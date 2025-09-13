// Real-time data management system using localStorage
import type { User, Product, Order, ContactMessage, QuoteRequest, Category } from "./types"

// Data storage keys
const STORAGE_KEYS = {
  USERS: "glonix_users",
  PRODUCTS: "glonix_products",
  ORDERS: "glonix_orders",
  CONTACT_MESSAGES: "glonix_contact_messages",
  QUOTE_REQUESTS: "glonix_quote_requests",
  CATEGORIES: "glonix_categories",
} as const

// Real-time data service class
export class DataService {
  // Generic storage methods
  private static getData<T>(key: string): T[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  private static saveData<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(key, JSON.stringify(data))
  }

  // User management
  static getUsers(): User[] {
    return this.getData<User>(STORAGE_KEYS.USERS)
  }

  static saveUsers(users: User[]): void {
    this.saveData(STORAGE_KEYS.USERS, users)
  }

  static getUserById(id: string): User | undefined {
    return this.getUsers().find((user) => user.id === id)
  }

  static updateUser(id: string, updates: Partial<User>): boolean {
    const users = this.getUsers()
    const index = users.findIndex((user) => user.id === id)
    if (index === -1) return false

    users[index] = { ...users[index], ...updates, updated_at: new Date().toISOString() }
    this.saveUsers(users)
    return true
  }

  static deleteUser(id: string): boolean {
    const users = this.getUsers()
    const filteredUsers = users.filter((user) => user.id !== id)
    if (filteredUsers.length === users.length) return false

    this.saveUsers(filteredUsers)
    return true
  }

  // Product management
  static getProducts(): Product[] {
    return this.getData<Product>(STORAGE_KEYS.PRODUCTS)
  }

  static saveProducts(products: Product[]): void {
    this.saveData(STORAGE_KEYS.PRODUCTS, products)
  }

  static getProductById(id: string): Product | undefined {
    return this.getProducts().find((product) => product.id === id)
  }

  static addProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Product {
    const products = this.getProducts()
    const newProduct: Product = {
      ...product,
      id: `product-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    products.push(newProduct)
    this.saveProducts(products)
    return newProduct
  }

  static updateProduct(id: string, updates: Partial<Product>): boolean {
    const products = this.getProducts()
    const index = products.findIndex((product) => product.id === id)
    if (index === -1) return false

    products[index] = { ...products[index], ...updates, updated_at: new Date().toISOString() }
    this.saveProducts(products)
    return true
  }

  static deleteProduct(id: string): boolean {
    const products = this.getProducts()
    const filteredProducts = products.filter((product) => product.id !== id)
    if (filteredProducts.length === products.length) return false

    this.saveProducts(filteredProducts)
    return true
  }

  // Order management
  static getOrders(): Order[] {
    return this.getData<Order>(STORAGE_KEYS.ORDERS)
  }

  static saveOrders(orders: Order[]): void {
    this.saveData(STORAGE_KEYS.ORDERS, orders)
  }

  static getOrderById(id: string): Order | undefined {
    return this.getOrders().find((order) => order.id === id)
  }

  static addOrder(order: Omit<Order, "id" | "order_number" | "created_at" | "updated_at">): Order {
    const orders = this.getOrders()
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, "0")}`

    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      order_number: orderNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    orders.push(newOrder)
    this.saveOrders(orders)
    return newOrder
  }

  static updateOrder(id: string, updates: Partial<Order>): boolean {
    const orders = this.getOrders()
    const index = orders.findIndex((order) => order.id === id)
    if (index === -1) return false

    orders[index] = { ...orders[index], ...updates, updated_at: new Date().toISOString() }
    this.saveOrders(orders)
    return true
  }

  // Contact messages
  static getContactMessages(): ContactMessage[] {
    return this.getData<ContactMessage>(STORAGE_KEYS.CONTACT_MESSAGES)
  }

  static saveContactMessages(messages: ContactMessage[]): void {
    this.saveData(STORAGE_KEYS.CONTACT_MESSAGES, messages)
  }

  static addContactMessage(message: Omit<ContactMessage, "id" | "created_at">): ContactMessage {
    const messages = this.getContactMessages()
    const newMessage: ContactMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      created_at: new Date().toISOString(),
    }

    messages.push(newMessage)
    this.saveContactMessages(messages)
    return newMessage
  }

  // Quote requests
  static getQuoteRequests(): QuoteRequest[] {
    return this.getData<QuoteRequest>(STORAGE_KEYS.QUOTE_REQUESTS)
  }

  static saveQuoteRequests(quotes: QuoteRequest[]): void {
    this.saveData(STORAGE_KEYS.QUOTE_REQUESTS, quotes)
  }

  static addQuoteRequest(quote: Omit<QuoteRequest, "id" | "quote_number" | "created_at">): QuoteRequest {
    const quotes = this.getQuoteRequests()
    const quoteNumber = `QUO-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, "0")}`

    const newQuote: QuoteRequest = {
      ...quote,
      id: `quote-${Date.now()}`,
      quote_number: quoteNumber,
      created_at: new Date().toISOString(),
    }

    quotes.push(newQuote)
    this.saveQuoteRequests(quotes)
    return newQuote
  }

  // Categories
  static getCategories(): Category[] {
    const categories = this.getData<Category>(STORAGE_KEYS.CATEGORIES)
    // Initialize with default categories if empty
    if (categories.length === 0) {
      const defaultCategories: Category[] = [
        {
          id: "cat-1",
          name: "Microcontrollers",
          slug: "microcontrollers",
          description: "Arduino, ESP32, STM32 and other microcontroller boards",
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: "cat-2",
          name: "Single Board Computers",
          slug: "single-board-computers",
          description: "Raspberry Pi, BeagleBone and other SBCs",
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: "cat-3",
          name: "Prototyping",
          slug: "prototyping",
          description: "Breadboards, jumper wires and prototyping accessories",
          is_active: true,
          sort_order: 3,
          created_at: new Date().toISOString(),
        },
      ]
      this.saveCategories(defaultCategories)
      return defaultCategories
    }
    return categories
  }

  static saveCategories(categories: Category[]): void {
    this.saveData(STORAGE_KEYS.CATEGORIES, categories)
  }

  // Statistics
  static generateStats() {
    const users = this.getUsers()
    const products = this.getProducts()
    const orders = this.getOrders()
    const messages = this.getContactMessages()
    const quotes = this.getQuoteRequests()

    return {
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      pendingOrders: orders.filter((order) => order.status === "pending").length,
      lowStockProducts: products.filter((product) => product.stock_quantity < 20).length,
      newMessages: messages.filter((msg) => msg.status === "new").length,
      newQuotes: quotes.filter((quote) => quote.status === "pending").length,
    }
  }

  // Clear all data (for testing/reset)
  static clearAllData(): void {
    if (typeof window === "undefined") return
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }
}

// Export helper functions for backward compatibility
export const getMockUserById = (id: string): User | undefined => DataService.getUserById(id)
export const getMockProductById = (id: string): Product | undefined => DataService.getProductById(id)
export const getMockOrderById = (id: string): Order | undefined => DataService.getOrderById(id)
export const generateMockStats = () => DataService.generateStats()

// Export empty arrays as defaults (data will be managed in real-time)
export const mockUsers: User[] = []
export const mockProducts: Product[] = []
export const mockOrders: Order[] = []
export const mockContactMessages: ContactMessage[] = []
export const mockQuoteRequests: QuoteRequest[] = []
export const mockCategories: Category[] = []
