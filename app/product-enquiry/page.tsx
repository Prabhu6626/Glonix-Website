"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { EnquiryApiService } from "@/lib/enquiry-api"
import { ArrowLeft, Upload, FileText, Send, AlertTriangle, Package } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

function ProductEnquiryContent() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    requirements: "",
    budget_range: "",
    timeline: "",
    priority: "medium"
  })
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "File size must be less than 10MB"
        })
        return
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain']
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Only PDF, JPG, PNG, and TXT files are allowed"
        })
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file and ensure you're logged in"
      })
      return
    }

    setUploading(true)
    
    try {
      const order_id = `product_enquiry_${Date.now()}`
      const fileUrl = await EnquiryApiService.uploadFile(selectedFile, user.email, order_id)
      
      if (fileUrl) {
        setUploadedFileUrl(fileUrl)
        toast({
          title: "Success",
          description: "File uploaded successfully"
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload file. Please try again."
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Product name is required"
      })
      return
    }

    if (!formData.abstract.trim() && !uploadedFileUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide either product description or upload a file"
      })
      return
    }

    if (!formData.requirements.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Requirements are required"
      })
      return
    }

    setSubmitting(true)
    
    try {
      const enquiryData = {
        enquiry_type: "product_enquiry" as const,
        title: formData.title.trim(),
        abstract: formData.abstract.trim() || undefined,
        requirements: formData.requirements.trim(),
        file_url: uploadedFileUrl || undefined,
        budget_range: formData.budget_range || undefined,
        timeline: formData.timeline || undefined,
        priority: formData.priority as "low" | "medium" | "high" | "urgent"
      }

      const response = await EnquiryApiService.createEnquiry(enquiryData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Product enquiry submitted successfully! We'll get back to you soon."
        })
        
        // Reset form
        setFormData({
          title: "",
          abstract: "",
          requirements: "",
          budget_range: "",
          timeline: "",
          priority: "medium"
        })
        setSelectedFile(null)
        setUploadedFileUrl(null)
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit enquiry. Please try again."
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-cyan-700 hover:text-cyan-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center ml-4">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-slate-900">Product Enquiry</h1>
              <p className="text-xs text-slate-600">Electronic Components & Products</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Electronic Components & Products
            </Badge>
            <h1 className="font-heading font-bold text-3xl lg:text-4xl text-slate-900 mb-6">
              Submit Your Product Enquiry
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Looking for specific electronic components or products? Let us know your requirements and we'll provide you with the best solutions and pricing.
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900">Product Requirements</CardTitle>
              <CardDescription className="text-slate-600">
                Provide detailed information about the products you need
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Name */}
              <div>
                <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                  Product Name / Category *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Arduino Uno R3, STM32 Development Board, PCB Fabrication"
                  className="mt-1"
                />
              </div>

              {/* Priority and Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority" className="text-sm font-semibold text-slate-700">
                    Priority Level
                  </Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="budget_range" className="text-sm font-semibold text-slate-700">
                    Budget Range
                  </Label>
                  <Select value={formData.budget_range} onValueChange={(value) => handleInputChange("budget_range", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_1k">Under ₹1,000</SelectItem>
                      <SelectItem value="1k_5k">₹1,000 - ₹5,000</SelectItem>
                      <SelectItem value="5k_25k">₹5,000 - ₹25,000</SelectItem>
                      <SelectItem value="25k_1l">₹25,000 - ₹1,00,000</SelectItem>
                      <SelectItem value="1l_5l">₹1,00,000 - ₹5,00,000</SelectItem>
                      <SelectItem value="above_5l">Above ₹5,00,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <Label htmlFor="timeline" className="text-sm font-semibold text-slate-700">
                  Required Timeline
                </Label>
                <Select value={formData.timeline} onValueChange={(value) => handleInputChange("timeline", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="When do you need this?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate (1-2 days)</SelectItem>
                    <SelectItem value="1_week">Within 1 week</SelectItem>
                    <SelectItem value="2_weeks">Within 2 weeks</SelectItem>
                    <SelectItem value="1_month">Within 1 month</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Product Description */}
              <div>
                <Label htmlFor="abstract" className="text-sm font-semibold text-slate-700">
                  Product Description
                </Label>
                <Textarea
                  id="abstract"
                  value={formData.abstract}
                  onChange={(e) => handleInputChange("abstract", e.target.value)}
                  placeholder="Describe the product(s) you need, including specifications, quantities, and intended use..."
                  rows={4}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Brief description of the products you're looking for
                </p>
              </div>

              {/* File Upload */}
              <div>
                <Label className="text-sm font-semibold text-slate-700">
                  Product Specifications / Datasheets (Optional)
                </Label>
                <div className="mt-2">
                  {!uploadedFileUrl ? (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <div className="space-y-2">
                        <Input
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png,.txt"
                          className="hidden"
                          id="file-upload"
                        />
                        <Label 
                          htmlFor="file-upload"
                          className="cursor-pointer text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                          Choose File
                        </Label>
                        <p className="text-xs text-slate-500">
                          Upload product specs, datasheets, or reference images
                        </p>
                        <p className="text-xs text-slate-500">
                          PDF, JPG, PNG, TXT files up to 10MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-700">File uploaded successfully</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadedFileUrl(null)}
                        className="ml-auto"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  
                  {selectedFile && !uploadedFileUrl && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-sm text-slate-600">Selected: {selectedFile.name}</span>
                      <Button
                        onClick={handleFileUpload}
                        disabled={uploading}
                        size="sm"
                      >
                        {uploading ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Requirements */}
              <div>
                <Label htmlFor="requirements" className="text-sm font-semibold text-slate-700">
                  Detailed Requirements *
                </Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange("requirements", e.target.value)}
                  placeholder="Specify exact quantities, technical specifications, delivery location, special requirements, preferred brands, certifications needed, etc..."
                  rows={6}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Include quantities, specifications, delivery requirements, and any special needs
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-slate-200">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || uploading}
                  className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white py-3"
                  size="lg"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting Enquiry...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Submit Product Enquiry
                    </div>
                  )}
                </Button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  We'll review your enquiry and provide quotes within 24 hours
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Popular Categories */}
          <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Popular Product Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "Arduino Boards", "Raspberry Pi", "Sensors", "Motors & Actuators",
                  "Power Supplies", "Development Boards", "PCB Fabrication", "Components"
                ].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleInputChange("title", category)}
                    className="text-left p-3 text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-8 shadow-lg border-0 bg-blue-50/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Need Help Finding Products?</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Our technical team can help you identify the right components for your project or suggest alternatives.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push("/contact")}>
                      Get Technical Support
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open("tel:9444312035")}>
                      Call: 9444312035
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ProductEnquiryPage() {
  return (
    <ProtectedRoute>
      <ProductEnquiryContent />
    </ProtectedRoute>
  )
}