import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { ApiError, api } from '../lib/api';
import type {
  AdminStats,
  Booking,
  BookingStatus,
  ContactEnquiry,
  ContentMap,
  GalleryItem,
  PricingPackage,
  Project,
  Service,
} from '../lib/types';
import { Logo } from '../components/SiteNav';

type Overview = {
  content: ContentMap;
  services: Service[];
  projects: Project[];
  gallery: GalleryItem[];
  pricing: PricingPackage[];
  bookings: Booking[];
  contacts: ContactEnquiry[];
  stats: AdminStats;
};

type AdminUser = { id: number; email: string; name: string };
type Tab = 'overview' | 'content' | 'services' | 'projects' | 'gallery' | 'pricing' | 'bookings' | 'contacts';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'contacts', label: 'Enquiries' },
  { id: 'projects', label: 'Projects' },
  { id: 'services', label: 'Services' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'content', label: 'Content' },
];

const STATUSES: BookingStatus[] = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
const CONTACT_STATUSES = ['New', 'Read', 'Replied', 'Archived'];

const section = 'rounded-2xl border border-espresso/12 bg-white p-5 sm:p-6';
const field = 'w-full rounded-lg border border-espresso/15 bg-ivory/40 px-3 py-2 text-sm text-espresso focus:border-gold focus:outline-none';
const label = 'mb-1.5 block text-[0.6rem] font-medium uppercase tracking-[0.16em] text-espresso/50';
const smallBtn =
  'inline-flex items-center gap-1.5 rounded-full border border-espresso/15 px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-espresso/70 transition-colors hover:border-espresso/40 hover:text-espresso';

/* ------------------------------- login ------------------------------- */

function Login({ onDone }: { onDone: (admin: AdminUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.post<{ admin: AdminUser }>('/auth/login', { email, password });
      onDone(res.admin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-espresso px-5 py-16">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-ivory p-7 sm:p-9">
        <Logo className="h-14 w-auto" />
        <p className="eyebrow mt-5">Studio Admin</p>
        <h1 className="mt-2 font-display text-3xl text-espresso">Sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-espresso/60">
          Manage projects, services, packages, bookings and enquiries.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className={label} htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full disabled:opacity-60">
          {busy ? <Loader2 size={15} className="animate-spin" /> : null}
          {busy ? 'Signing in' : 'Sign in'}
        </button>

        <Link to="/" className="mt-5 block text-center text-[0.66rem] uppercase tracking-[0.18em] text-espresso/45 hover:text-espresso">
          Back to website
        </Link>
      </form>
    </div>
  );
}

/* ------------------------------ fields ------------------------------ */

type FieldDef = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'image' | 'select';
  options?: string[];
};

function FormRow({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  if (def.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 py-2 text-xs text-espresso/70">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        {def.label}
      </label>
    );
  }
  return (
    <div className={def.type === 'textarea' ? 'sm:col-span-2' : ''}>
      <label className={label}>{def.label}</label>
      {def.type === 'textarea' ? (
        <textarea
          rows={3}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className={field}
        />
      ) : def.type === 'select' ? (
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className={field}>
          {(def.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={def.type === 'number' ? 'number' : 'text'}
          value={String(value ?? '')}
          onChange={(e) => onChange(def.type === 'number' ? Number(e.target.value) : e.target.value)}
          className={field}
        />
      )}
    </div>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.upload(file);
      onChange(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className={label}>Image</label>
      <div className="flex items-start gap-3">
        {value ? (
          <img src={value} alt="" className="h-16 w-20 rounded-lg object-cover" />
        ) : (
          <div className="flex h-16 w-20 items-center justify-center rounded-lg bg-espresso/5 text-espresso/30">
            <ImageIcon size={18} />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… or upload"
            className={field}
          />
          <label className={`${smallBtn} cursor-pointer`}>
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => upload(e.target.files?.[0])}
            />
          </label>
          {error && <p className="text-[0.7rem] text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ editor ------------------------------ */

function Editor({
  title,
  fields,
  initial,
  onCancel,
  onSave,
}: {
  title: string;
  fields: FieldDef[];
  initial: Record<string, unknown>;
  onCancel: () => void;
  onSave: (values: Record<string, unknown>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await onSave(values);
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-espresso/50 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 max-w-2xl rounded-2xl bg-white p-5 sm:p-7">
        <h2 className="font-display text-2xl text-espresso">{title}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.map((def) =>
            def.type === 'image' ? (
              <div key={def.key} className="sm:col-span-2">
                <ImageField
                  value={String(values[def.key] ?? '')}
                  onChange={(v) => setValues((prev) => ({ ...prev, [def.key]: v }))}
                />
              </div>
            ) : (
              <FormRow
                key={def.key}
                def={def}
                value={values[def.key]}
                onChange={(v) => setValues((prev) => ({ ...prev, [def.key]: v }))}
              />
            ),
          )}
        </div>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className={smallBtn}>
            Cancel
          </button>
          <button type="button" onClick={save} disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ dashboard ------------------------------ */

export default function Admin() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ kind: Tab; record: Record<string, unknown> | null } | null>(null);
  const [contentDraft, setContentDraft] = useState<ContentMap>({});
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    api
      .get<{ admin: AdminUser }>('/auth/me')
      .then((res) => setAdmin(res.admin))
      .catch(() => setAdmin(null))
      .finally(() => setChecking(false));
  }, []);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await api.get<Overview>('/admin/overview');
      setOverview(data);
      setContentDraft(data.content);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setAdmin(null);
      else setLoadError(err instanceof Error ? err.message : 'Unable to load dashboard');
    }
  }, []);

  useEffect(() => {
    if (admin) void load();
  }, [admin, load]);

  const logout = async () => {
    await api.post('/auth/logout').catch(() => undefined);
    setAdmin(null);
    setOverview(null);
  };

  const stats = overview?.stats;
  const featuredServices = useMemo(() => overview?.services ?? [], [overview]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory text-espresso/60">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!admin) return <Login onDone={setAdmin} />;

  /* --- mutation helpers --- */
  const saveContent = async () => {
    await api.put('/admin/content', contentDraft);
    setSavedFlash(true);
    await load();
    window.setTimeout(() => setSavedFlash(false), 2200);
  };

  const remove = async (kind: Tab, id: number) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    await api.del(`/admin/${kind}/${id}`);
    await load();
  };

  const create = async (kind: Tab, values: Record<string, unknown>) => {
    await api.post(`/admin/${kind}`, values);
    setEditing(null);
    await load();
  };

  const update = async (kind: Tab, id: number, values: Record<string, unknown>) => {
    await api.put(`/admin/${kind}/${id}`, values);
    setEditing(null);
    await load();
  };

  const setBookingStatus = async (id: number, status: BookingStatus) => {
    await api.patch(`/admin/bookings/${id}`, { status });
    await load();
  };

  const setContactStatus = async (id: number, status: string) => {
    await api.patch(`/admin/contacts/${id}`, { status });
    await load();
  };

  const fieldsFor: Record<string, FieldDef[]> = {
    services: [
      { key: 'title', label: 'Service title' },
      { key: 'bullet', label: 'Short badge' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'published', label: 'Published', type: 'checkbox' },
    ],
    projects: [
      { key: 'title', label: 'Project title' },
      { key: 'category', label: 'Category' },
      { key: 'location', label: 'Location' },
      { key: 'year', label: 'Year' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image1', label: 'Image 1', type: 'image' },
      { key: 'image2', label: 'Image 2', type: 'image' },
      { key: 'image3', label: 'Image 3', type: 'image' },
      { key: 'published', label: 'Published', type: 'checkbox' },
    ],
    gallery: [
      { key: 'title', label: 'Caption' },
      { key: 'category', label: 'Category' },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'published', label: 'Published', type: 'checkbox' },
    ],
    pricing: [
      { key: 'name', label: 'Package name' },
      { key: 'price_label', label: 'Price label (editable placeholder)' },
      { key: 'price_note', label: 'Price note' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'features', label: 'Features — one per line', type: 'textarea' },
      { key: 'highlight', label: 'Highlight this package', type: 'checkbox' },
    ],
  };

  const blank: Record<string, Record<string, unknown>> = {
    services: { title: '', bullet: '', description: '', image: '', published: true },
    projects: { title: '', category: 'Residential', location: '', year: '', description: '', image1: '', image2: '', image3: '', published: true },
    gallery: { title: '', category: 'Living Rooms', image: '', published: true },
    pricing: { name: '', price_label: 'Custom quote', price_note: '', description: '', features: '', highlight: false },
  };

  return (
    <div className="min-h-screen bg-ivory text-espresso">
      <header className="border-b border-espresso/10 bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-auto" />
            <span className="hidden text-[0.6rem] font-medium uppercase tracking-[0.18em] text-espresso/45 sm:block">
              Studio Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className={smallBtn}>
              <ArrowLeft size={12} /> Site
            </Link>
            <button type="button" onClick={() => void load()} className={smallBtn}>
              <RefreshCw size={12} /> Refresh
            </button>
            <button type="button" onClick={() => void logout()} className={smallBtn}>
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-3 pb-2 sm:px-5">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-current={tab === item.id}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.12em] transition-colors ${
                tab === item.id ? 'bg-espresso text-ivory' : 'text-espresso/55 hover:bg-espresso/[0.06]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6">
        {loadError && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </p>
        )}
        {!overview ? (
          <div className="flex items-center gap-2 py-20 text-espresso/50">
            <Loader2 className="animate-spin" size={16} /> Loading dashboard…
          </div>
        ) : (
          <>
            {tab === 'overview' && stats && (
              <div className="space-y-6">
                <div>
                  <p className="eyebrow">Signed in as {admin.email}</p>
                  <h1 className="mt-2 font-display text-3xl sm:text-4xl">Studio overview</h1>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Bookings', value: stats.bookings },
                    { label: 'Pending', value: stats.pending },
                    { label: 'Enquiries', value: stats.contacts },
                    { label: 'New enquiries', value: stats.newContacts },
                    { label: 'Projects', value: stats.projects },
                    { label: 'Services', value: stats.services },
                    { label: 'Gallery', value: stats.gallery },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-espresso/12 bg-white p-4">
                      <p className="font-display text-3xl">{stat.value}</p>
                      <p className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-espresso/45">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className={section}>
                  <h2 className="font-display text-xl">Latest bookings</h2>
                  <ul className="mt-3 divide-y divide-espresso/10 text-sm">
                    {overview.bookings.slice(0, 5).map((b) => (
                      <li key={b.id} className="flex flex-wrap items-center justify-between gap-1 py-2.5">
                        <span>
                          {b.name} · {b.service}
                        </span>
                        <span className="text-espresso/50">
                          {b.date} {b.time} · {b.status}
                        </span>
                      </li>
                    ))}
                    {overview.bookings.length === 0 && <li className="py-3 text-espresso/50">No bookings yet.</li>}
                  </ul>
                </div>
              </div>
            )}

            {tab === 'bookings' && (
              <div className={section}>
                <h1 className="font-display text-2xl">Appointment bookings</h1>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-espresso/15 text-[0.6rem] uppercase tracking-[0.14em] text-espresso/45">
                        <th className="pb-2 pr-3">Client</th>
                        <th className="pb-2 pr-3">Contact</th>
                        <th className="pb-2 pr-3">Slot</th>
                        <th className="pb-2 pr-3">Service</th>
                        <th className="pb-2 pr-3">Status</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-espresso/10">
                      {overview.bookings.map((b) => (
                        <tr key={b.id}>
                          <td className="py-2.5 pr-3">
                            <p className="font-medium">{b.name}</p>
                            <p className="text-[0.7rem] text-espresso/50">{b.property_type}</p>
                          </td>
                          <td className="py-2.5 pr-3 text-[0.78rem]">
                            <p>{b.email}</p>
                            <p className="text-espresso/50">{b.mobile}</p>
                          </td>
                          <td className="py-2.5 pr-3 text-[0.78rem]">
                            {b.date}
                            <br />
                            <span className="text-espresso/50">{b.time}</span>
                          </td>
                          <td className="py-2.5 pr-3 text-[0.78rem]">{b.service}</td>
                          <td className="py-2.5 pr-3">
                            <select
                              value={b.status}
                              onChange={(e) => void setBookingStatus(b.id, e.target.value as BookingStatus)}
                              className="rounded-lg border border-espresso/15 bg-white px-2 py-1 text-xs"
                              aria-label={`Status for ${b.name}`}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5">
                            <button
                              type="button"
                              onClick={() => void remove('bookings', b.id)}
                              className={smallBtn}
                              aria-label={`Delete booking from ${b.name}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {overview.bookings.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-5 text-center text-espresso/50">
                            No bookings yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'contacts' && (
              <div className={section}>
                <h1 className="font-display text-2xl">Contact enquiries</h1>
                <ul className="mt-4 divide-y divide-espresso/10">
                  {overview.contacts.map((c) => (
                    <li key={c.id} className="py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">
                          {c.name} <span className="text-espresso/45">· {c.email}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          <select
                            value={c.status}
                            onChange={(e) => void setContactStatus(c.id, e.target.value)}
                            className="rounded-lg border border-espresso/15 bg-white px-2 py-1 text-xs"
                            aria-label={`Status for ${c.name}`}
                          >
                            {CONTACT_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button type="button" onClick={() => void remove('contacts', c.id)} className={smallBtn}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-espresso/60">{c.message}</p>
                    </li>
                  ))}
                  {overview.contacts.length === 0 && <li className="py-4 text-espresso/50">No enquiries yet.</li>}
                </ul>
              </div>
            )}

            {(['services', 'projects', 'gallery', 'pricing'] as const).includes(tab as never) && (
              <div className={section}>
                <div className="flex items-center justify-between gap-3">
                  <h1 className="font-display text-2xl capitalize">{tab}</h1>
                  <button
                    type="button"
                    onClick={() => setEditing({ kind: tab, record: blank[tab] })}
                    className="btn-primary !px-5 !py-2.5"
                  >
                    <Plus size={14} /> New
                  </button>
                </div>

                <ul className="mt-4 divide-y divide-espresso/10">
                  {tab === 'services' &&
                    featuredServices.map((s) => (
                      <li key={s.id} className="flex items-center gap-3 py-2.5">
                        <RowActions
                          title={s.title}
                          subtitle={s.bullet}
                          published={s.published}
                          onEdit={() => setEditing({ kind: 'services', record: { ...s } })}
                          onDelete={() => void remove('services', s.id)}
                        />
                      </li>
                    ))}
                  {tab === 'projects' &&
                    overview.projects.map((p) => (
                      <li key={p.id} className="flex items-center gap-3 py-2.5">
                        <RowActions
                          title={p.title}
                          subtitle={`${p.category} · ${p.location}`}
                          published={p.published}
                          onEdit={() => setEditing({ kind: 'projects', record: { ...p } })}
                          onDelete={() => void remove('projects', p.id)}
                        />
                      </li>
                    ))}
                  {tab === 'gallery' &&
                    overview.gallery.map((g) => (
                      <li key={g.id} className="flex items-center gap-3 py-2.5">
                        <RowActions
                          title={g.title}
                          subtitle={g.category}
                          published={g.published}
                          onEdit={() => setEditing({ kind: 'gallery', record: { ...g } })}
                          onDelete={() => void remove('gallery', g.id)}
                        />
                      </li>
                    ))}
                  {tab === 'pricing' &&
                    overview.pricing.map((p) => (
                      <li key={p.id} className="flex items-center gap-3 py-2.5">
                        <RowActions
                          title={`${p.name} — ${p.price_label}`}
                          subtitle={`${p.features.length} features${p.highlight ? ' · highlighted' : ''}`}
                          published={1}
                          onEdit={() =>
                            setEditing({ kind: 'pricing', record: { ...p, features: p.features.join('\n') } })
                          }
                          onDelete={() => void remove('pricing', p.id)}
                        />
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {tab === 'content' && (
              <div className={section}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="font-display text-2xl">Website content</h1>
                  <button type="button" onClick={() => void saveContent()} className="btn-primary !px-5 !py-2.5">
                    <Check size={14} /> Save content
                  </button>
                </div>
                {savedFlash && <p className="mt-3 text-sm text-green-700">Content saved.</p>}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {Object.entries(contentDraft).map(([key, value]) => (
                    <div key={key} className={value.length > 90 ? 'sm:col-span-2' : ''}>
                      <label className={label}>{key.replace(/_/g, ' ')}</label>
                      {value.length > 90 ? (
                        <textarea
                          rows={3}
                          value={value}
                          onChange={(e) => setContentDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                          className={field}
                        />
                      ) : (
                        <input
                          value={value}
                          onChange={(e) => setContentDraft((prev) => ({ ...prev, [key]: e.target.value }))}
                          className={field}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {editing && fieldsFor[editing.kind] && (
        <Editor
          title={`${editing.record?.id ? 'Edit' : 'New'} ${editing.kind.replace(/s$/, '')}`}
          fields={fieldsFor[editing.kind]}
          initial={editing.record ?? {}}
          onCancel={() => setEditing(null)}
          onSave={(values) =>
            editing.record?.id
              ? update(editing.kind, Number(editing.record.id), values)
              : create(editing.kind, values)
          }
        />
      )}
    </div>
  );
}

function RowActions({
  title,
  subtitle,
  published,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle: string;
  published: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="truncate text-[0.72rem] text-espresso/50">{subtitle || '—'}</p>
      </div>
      <span
        className={`hidden rounded-full px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.1em] sm:inline ${
          published ? 'bg-green-50 text-green-700' : 'bg-espresso/5 text-espresso/50'
        }`}
      >
        {published ? 'Live' : 'Draft'}
      </span>
      <button type="button" onClick={onEdit} className={smallBtn}>
        Edit
      </button>
      <button type="button" onClick={onDelete} className={smallBtn} aria-label={`Delete ${title}`}>
        <Trash2 size={12} />
      </button>
    </>
  );
}
