// Create a new file lib/public-api.ts
class PublicApiService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  static async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.API_BASE_URL}${endpoint}`
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  static async getAllProducts(): Promise<Product[]> {
    try {
      const response = await this.apiRequest('/public/products?skip=0&limit=1000')
      return response.products || []
    } catch (error) {
      console.error("Failed to get products:", error)
      return []
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await this.apiRequest(`/public/products/${id}`)
      return response
    } catch (error) {
      console.error("Failed to get product:", error)
      return null
    }
  }
}