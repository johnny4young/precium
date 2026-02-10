export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  icon?: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  openingHours?: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  categoryId?: string;
  barcode?: string;
  imageUrl?: string;
  unit?: string;
  packageSize?: string;
}

export interface Price {
  id: string;
  productId: string;
  storeId: string;
  price: number;
  currency: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
