/** Normalised public + admin shapes returned by the KAVÉ API. */

export interface ContentMap {
  [key: string]: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
  bullet: string;
  sort: number;
  published: number;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  location: string;
  year: string;
  description: string;
  image1: string;
  image2: string;
  image3: string;
  sort: number;
  published: number;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
  sort: number;
  published: number;
}

export interface PricingPackage {
  id: number;
  name: string;
  price_label: string;
  price_note: string;
  description: string;
  features: string[];
  highlight: number;
  sort: number;
}

export interface Booking {
  id: number;
  name: string;
  email: string;
  mobile: string;
  date: string;
  time: string;
  service: string;
  property_type: string;
  message: string;
  status: BookingStatus;
  created_at: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface ContactEnquiry {
  id: number;
  name: string;
  email: string;
  mobile: string;
  message: string;
  status: string;
  created_at: string;
}

export interface SiteData {
  content: ContentMap;
  services: Service[];
  projects: Project[];
  gallery: GalleryItem[];
  pricing: PricingPackage[];
  categories: string[];
  galleryCategories: string[];
}

export interface AdminStats {
  bookings: number;
  pending: number;
  contacts: number;
  newContacts: number;
  projects: number;
  services: number;
  gallery: number;
}
