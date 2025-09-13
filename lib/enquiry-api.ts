// lib/enquiry-api.ts - Enquiry API service
import type { Enquiry, EnquiryFormData, EnquiryReply } from "./types"

export class EnquiryApiService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  private static async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem("access_token")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const url = `${this.API_BASE_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Network error' }))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // CUSTOMER ENQUIRY OPERATIONS
  static async createEnquiry(enquiryData: EnquiryFormData): Promise<{ success: boolean, enquiry_id: string }> {
    try {
      const response = await this.apiRequest('/enquiries', {
        method: 'POST',
        body: JSON.stringify(enquiryData),
      })
      return response
    } catch (error) {
      console.error("Failed to create enquiry:", error)
      throw error
    }
  }

  static async getMyEnquiries(): Promise<Enquiry[]> {
    try {
      const response = await this.apiRequest('/enquiries/my-enquiries')
      return response.enquiries || []
    } catch (error) {
      console.error("Failed to get my enquiries:", error)
      return []
    }
  }

  static async getEnquiryById(enquiryId: string): Promise<Enquiry | null> {
    try {
      const response = await this.apiRequest(`/enquiries/${enquiryId}`)
      return response.enquiry
    } catch (error) {
      console.error("Failed to get enquiry:", error)
      return null
    }
  }

  // ADMIN ENQUIRY OPERATIONS
  static async getAllEnquiries(
    skip = 0, 
    limit = 100, 
    enquiry_type?: string, 
    status?: string
  ): Promise<{ enquiries: Enquiry[], total: number }> {
    try {
      let url = `/admin/enquiries?skip=${skip}&limit=${limit}`
      if (enquiry_type && enquiry_type !== 'all') {
        url += `&enquiry_type=${encodeURIComponent(enquiry_type)}`
      }
      if (status && status !== 'all') {
        url += `&status=${encodeURIComponent(status)}`
      }
      
      const response = await this.apiRequest(url)
      return {
        enquiries: response.enquiries || [],
        total: response.total || 0
      }
    } catch (error) {
      console.error("Failed to get enquiries:", error)
      return { enquiries: [], total: 0 }
    }
  }

  static async replyToEnquiry(enquiryId: string, reply: { message: string, attachments?: string[] }): Promise<boolean> {
    try {
      await this.apiRequest(`/admin/enquiries/${enquiryId}/reply`, {
        method: 'POST',
        body: JSON.stringify(reply),
      })
      return true
    } catch (error) {
      console.error("Failed to reply to enquiry:", error)
      return false
    }
  }

  static async updateEnquiryStatus(enquiryId: string, status: string): Promise<boolean> {
    try {
      await this.apiRequest(`/admin/enquiries/${enquiryId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      return true
    } catch (error) {
      console.error("Failed to update enquiry status:", error)
      return false
    }
  }

  // FILE UPLOAD HELPER
  static async uploadFile(file: File, username: string, order_id: string): Promise<string | null> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('username', username)
      formData.append('order_id', order_id)

      const response = await fetch('https://file-store-api.onrender.com/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      return result.file_url || null
    } catch (error) {
      console.error('File upload failed:', error)
      return null
    }
  }
}