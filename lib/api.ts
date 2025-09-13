// lib/api.ts

import { EnquiryCreate, EnquiryReply, Enquiry, ApiResponse, PaginatedResponse } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }
    return response.json()
  }

  // Enquiry APIs
  async createEnquiry(enquiry: EnquiryCreate): Promise<ApiResponse<{ enquiry_id: string }>> {
    const response = await fetch(`${API_BASE_URL}/enquiries`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(enquiry)
    })
    return this.handleResponse(response)
  }

  async getMyEnquiries(enquiryType?: string): Promise<{ enquiries: Enquiry[] }> {
    const params = new URLSearchParams()
    if (enquiryType) params.append('enquiry_type', enquiryType)
    
    const response = await fetch(`${API_BASE_URL}/enquiries/my-enquiries?${params}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  // Admin APIs
  async getAllEnquiries(
    skip = 0,
    limit = 20,
    enquiryType?: string,
    status?: string
  ): Promise<PaginatedResponse<Enquiry>> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    })
    if (enquiryType) params.append('enquiry_type', enquiryType)
    if (status) params.append('status', status)

    const response = await fetch(`${API_BASE_URL}/admin/enquiries?${params}`, {
      headers: this.getAuthHeaders()
    })
    const data = await this.handleResponse<any>(response)
    return {
      items: data.enquiries,
      total: data.total,
      skip: data.skip,
      limit: data.limit
    }
  }

  async getEnquiryDetails(enquiryId: string): Promise<{ enquiry: Enquiry }> {
    const response = await fetch(`${API_BASE_URL}/admin/enquiries/${enquiryId}`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse(response)
  }

  async replyToEnquiry(enquiryId: string, reply: EnquiryReply): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/admin/enquiries/${enquiryId}/reply`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(reply)
    })
    return this.handleResponse(response)
  }

  async updateEnquiryStatus(enquiryId: string, status: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/admin/enquiries/${enquiryId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    })
    return this.handleResponse(response)
  }

  // File Upload
  async uploadFile(file: File, enquiryType: string, quotationId: string): Promise<{ file_url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('enquiry_type', enquiryType)
    formData.append('quotation_id', quotationId)

    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    })

    return this.handleResponse(response)
  }
}

export const apiClient = new ApiClient()