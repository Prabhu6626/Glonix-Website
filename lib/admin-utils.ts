import type { AdminStats, Order, Product, User, ProductFormData, UserFormData } from "./types"
import { AdminApiService } from "./admin-api"

// Initialize empty data - no longer needed since we're using real database
export const initializeEmptyData = (): void => {
  // This function is kept for compatibility but does nothing
  // since we're now using the real MongoDB database
}

// Admin overview stats
export const getAdminStats = async (): Promise<AdminStats> => {
  return await AdminApiService.getAdminStats()
}

// Read helpers
export const getAllOrders = async (): Promise<Order[]> => {
  const { orders } = await AdminApiService.getAllOrders(0, 1000) // Get all orders
  return orders
}

export const getAllProducts = async (): Promise<Product[]> => {
  const { products } = await AdminApiService.getAllProducts(0, 1000) // Get all products
  return products
}

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const { products } = await AdminApiService.getAllProducts()
  return products.find(p => p.id === id)
}

export const getAllUsers = async (): Promise<User[]> => {
  const { users } = await AdminApiService.getAllUsers(0, 1000) // Get all users
  return users
}

// Product CRUD
export const createProduct = async (input: ProductFormData): Promise<Product | null> => {
  return await AdminApiService.createProduct(input)
}

export const updateProduct = async (id: string, input: Partial<ProductFormData>): Promise<boolean> => {
  return await AdminApiService.updateProduct(id, input)
}

export const deleteProduct = async (id: string): Promise<boolean> => {
  return await AdminApiService.deleteProduct(id)
}

// User update
export const updateUser = async (id: string, input: Partial<UserFormData>): Promise<boolean> => {
  return await AdminApiService.updateUser(id, input)
}

export const deleteUser = async (id: string): Promise<boolean> => {
  return await AdminApiService.deleteUser(id)
}

// Order status updates
export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"],
  tracking_number?: string,
  notes?: string,
): Promise<boolean> => {
  return await AdminApiService.updateOrderStatus(orderId, {
    status,
    tracking_number,
    notes
  })
}

// Fabrication status methods
export const getUsersByFabricationStatus = async (status: 0 | 1 | 2): Promise<User[]> => {
  return await AdminApiService.getUsersByFabricationStatus(status)
}

// Helper functions for pagination
export const getProductsPaginated = async (
  skip = 0, 
  limit = 100, 
  category?: string
): Promise<{ products: Product[], total: number }> => {
  return await AdminApiService.getAllProducts(skip, limit, category)
}

export const getUsersPaginated = async (
  skip = 0, 
  limit = 100
): Promise<{ users: User[], total: number }> => {
  return await AdminApiService.getAllUsers(skip, limit)
}

export const getOrdersPaginated = async (
  skip = 0, 
  limit = 100, 
  status?: string
): Promise<{ orders: Order[], total: number }> => {
  return await AdminApiService.getAllOrders(skip, limit, status)
}

export const getContactMessages = async (
  skip = 0, 
  limit = 50
) => {
  return await AdminApiService.getContactMessages(skip, limit)
}

// Updated dashboard data
export const loadDashboardData = async () => {
  try {
    const [stats, orders, products] = await Promise.all([
      getAdminStats(),
      getAllOrders(),
      getAllProducts()
    ])

    return {
      stats,
      recentOrders: orders.slice(0, 5),
      lowStockProducts: products.filter(p => p.stock_quantity < 20).slice(0, 5)
    }
  } catch (error) {
    console.error("Failed to load dashboard data:", error)
    throw error
  }
}

// Backward compatibility aliases
export { initializeEmptyData as initializeMockData }
export const addProduct = createProduct