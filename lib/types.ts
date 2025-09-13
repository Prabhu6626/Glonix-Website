// Database types and interfaces for the e-commerce system

export interface User {
  id: string
  email: string
  full_name: string
  company?: string
  phone?: string
  role: "customer" | "admin" | "staff"
  is_active: boolean
  fabrication_status: 0 | 1 | 2 // 0: not visited, 1: visited (checked price), 2: added to cart
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  image: string
  images?: string[]
  description: string
  long_description?: string
  inStock: boolean
  stock_quantity: number
  rating: number
  reviews: number
  specifications: Record<string, string>
  features?: string[]
  applications?: string[]
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  name: string
  sku: string
  price: number
  image: string
  quantity: number
  inStock: boolean
}

export interface WishlistItem {
  id: string
  name: string
  sku: string
  price: number
  image: string
  inStock: boolean
  rating: number
  reviews: number
}

export interface OrderItem {
  product_id: string
  product_name: string
  product_sku: string
  price: number
  quantity: number
  total: number
}

export interface Address {
  first_name: string
  last_name: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  zip_code: string
  country: string
  phone?: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  user_name: string
  user_email: string
  items: OrderItem[]
  shipping_address: Address
  billing_address: Address
  shipping_method: string
  payment_method: string
  subtotal: number
  shipping_cost: number
  tax: number
  total: number
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  payment_status: "pending" | "completed" | "failed" | "refunded"
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
  estimated_delivery?: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  subject: string
  message: string
  service_type?: string
  status: "new" | "in_progress" | "resolved" | "closed"
  replied: boolean
  created_at: string
}

export interface QuoteRequest {
  id: string
  quote_number: string
  name: string
  email: string
  company?: string
  phone?: string
  service_type: string
  project_description: string
  requirements: Record<string, any>
  files: string[]
  budget_range?: string
  timeline?: string
  status: "pending" | "quoted" | "accepted" | "rejected" | "completed"
  responded: boolean
  quote_amount?: number
  quote_valid_until?: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  image?: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface AdminStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  lowStockProducts: number
  newMessages: number
  newQuotes: number
}

// Form interfaces for admin operations
export interface ProductFormData {
  name: string
  sku: string
  category: string
  price: number
  description: string
  long_description?: string
  stock_quantity: number
  specifications: Record<string, string>
  features: string[]
  applications: string[]
  images: string[]
}

export interface UserFormData {
  email: string
  full_name: string
  company?: string
  phone?: string
  role: "customer" | "admin" | "staff"
  is_active: boolean
}

export interface OrderUpdateData {
  status: Order["status"]
  tracking_number?: string
  notes?: string
}

// Add these to your existing types.ts file

export interface Enquiry {
  id: string
  enquiry_type: "design_enquiry" | "product_enquiry"
  title: string
  abstract?: string
  requirements?: string
  file_url?: string
  budget_range?: string
  timeline?: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "new" | "in_progress" | "replied" | "completed" | "closed"
  replied: boolean
  user_id: string
  user_name: string
  user_email: string
  created_at: string
  updated_at: string
  replies: EnquiryReply[]
}

export interface EnquiryReply {
  admin_id?: string
  admin_name?: string
  message: string
  attachments?: string[]
  timestamp: string
}

export interface EnquiryFormData {
  enquiry_type: "design_enquiry" | "product_enquiry"
  title: string
  abstract?: string
  requirements?: string
  file_url?: string
  budget_range?: string
  timeline?: string
  priority?: "low" | "medium" | "high" | "urgent"
}

export interface EnquiryStats {
  totalEnquiries: number
  newEnquiries: number
  designEnquiries: number
  productEnquiries: number
  repliedEnquiries: number
  completedEnquiries: number
}