"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminGuard } from "@/components/admin/admin-guard"
import type { Product, ProductFormData } from "@/lib/types"
import { Package, Search, Plus, Edit, Trash2, Filter, Star, AlertTriangle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Enhanced Admin Product API Service
class AdminProductApiService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  private static async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = localStorage.getItem("access_token")
    const url = `${this.API_BASE_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
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
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  static async getAllProducts(params: {
    skip?: number,
    limit?: number,
    category?: string
  } = {}): Promise<{products: Product[], total: number}> {
    try {
      const queryParams = new URLSearchParams()
      if (params.skip) queryParams.append('skip', params.skip.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.category) queryParams.append('category', params.category)
      
      const endpoint = `/admin/products?${queryParams.toString()}`
      const response = await this.apiRequest(endpoint)
      
      return {
        products: response.products || [],
        total: response.total || 0
      }
    } catch (error) {
      console.error("Failed to get products:", error)
      return { products: [], total: 0 }
    }
  }

  static async createProduct(productData: ProductFormData): Promise<Product | null> {
    try {
      const response = await this.apiRequest('/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      })
      return response
    } catch (error) {
      console.error("Failed to create product:", error)
      return null
    }
  }

  static async updateProduct(productId: string, productData: Partial<ProductFormData>): Promise<boolean> {
    try {
      await this.apiRequest(`/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      })
      return true
    } catch (error) {
      console.error("Failed to update product:", error)
      return false
    }
  }

  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      await this.apiRequest(`/admin/products/${productId}`, {
        method: 'DELETE'
      })
      return true
    } catch (error) {
      console.error("Failed to delete product:", error)
      return false
    }
  }
}

function ProductManagementContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: "",
    sku: "",
    category: "",
    price: 0,
    description: "",
    long_description: "",
    stock_quantity: 0,
    specifications: {},
    features: [],
    applications: [],
    images: [],
  })
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const categories = ["Microcontrollers", "Single Board Computers", "Prototyping", "Sensors", "Components"]

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, categoryFilter, stockFilter])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const { products: allProducts, total } = await AdminProductApiService.getAllProducts({ skip: 0, limit: 1000 })
      setProducts(allProducts)
      setTotalProducts(total)
    } catch (error) {
      console.error("Failed to load products:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category === categoryFilter)
    }

    // Stock filter
    if (stockFilter !== "all") {
      if (stockFilter === "in_stock") {
        filtered = filtered.filter((product) => product.inStock && product.stock_quantity > 0)
      } else if (stockFilter === "low_stock") {
        filtered = filtered.filter((product) => product.stock_quantity > 0 && product.stock_quantity < 20)
      } else if (stockFilter === "out_of_stock") {
        filtered = filtered.filter((product) => !product.inStock || product.stock_quantity === 0)
      }
    }

    setFilteredProducts(filtered)
  }

  const resetForm = () => {
    setProductForm({
      name: "",
      sku: "",
      category: "",
      price: 0,
      description: "",
      long_description: "",
      stock_quantity: 0,
      specifications: {},
      features: [],
      applications: [],
      images: [],
    })
    setUploadedImages([])
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    resetForm()
    setIsAddDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      description: product.description,
      long_description: product.long_description || "",
      stock_quantity: product.stock_quantity,
      specifications: product.specifications,
      features: product.features || [],
      applications: product.applications || [],
      images: product.images || [product.image].filter(Boolean),
    })
    setUploadedImages(product.images || [product.image].filter(Boolean))
    setIsAddDialogOpen(true)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('username', 'admin')
      formData.append('order_id', `img-${Date.now()}`)

      try {
        const response = await fetch('https://file-store-api.onrender.com/upload', {
          method: 'POST',
          body: formData,
        })
        const result = await response.json()
        return result.file_url
      } catch (error) {
        console.error('Upload error:', error)
        return null
      }
    })

    try {
      const imageUrls = await Promise.all(uploadPromises)
      const validUrls = imageUrls.filter(url => url !== null) as string[]
      
      setUploadedImages(prev => [...prev, ...validUrls])
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...validUrls]
      }))
    } catch (error) {
      console.error('Upload failed:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Image upload failed. Please try again."
      })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
    setProductForm(prev => ({
      ...prev,
      images: newImages
    }))
  }

  const handleSaveProduct = async () => {
    try {
      let success = false

      if (editingProduct) {
        // Update existing product
        success = await AdminProductApiService.updateProduct(editingProduct.id, productForm)
        if (success) {
          toast({
            title: "Success",
            description: "Product updated successfully!"
          })
        }
      } else {
        // Add new product
        const newProduct = await AdminProductApiService.createProduct(productForm)
        success = !!newProduct
        if (success) {
          toast({
            title: "Success", 
            description: "Product added successfully!"
          })
        }
      }

      if (success) {
        await loadProducts()
        setIsAddDialogOpen(false)
        resetForm()
      } else {
        throw new Error("Operation failed")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while saving the product"
      })
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const success = await AdminProductApiService.deleteProduct(productId)
      if (success) {
        toast({
          title: "Success",
          description: "Product deleted successfully!"
        })
        await loadProducts()
      } else {
        throw new Error("Delete failed")
      }
    } catch (error) {
      console.error("Failed to delete product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product"
      })
    }
  }

  const getStockBadge = (product: Product) => {
    if (!product.inStock || product.stock_quantity === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
    } else if (product.stock_quantity < 20) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>
    }
  }

  const addSpecification = () => {
    const key = prompt("Enter specification name:")
    const value = prompt("Enter specification value:")
    if (key && value) {
      setProductForm({
        ...productForm,
        specifications: { ...productForm.specifications, [key]: value },
      })
    }
  }

  const removeSpecification = (key: string) => {
    const newSpecs = { ...productForm.specifications }
    delete newSpecs[key]
    setProductForm({ ...productForm, specifications: newSpecs })
  }

  const addFeature = () => {
    const feature = prompt("Enter feature:")
    if (feature) {
      setProductForm({
        ...productForm,
        features: [...productForm.features, feature],
      })
    }
  }

  const removeFeature = (index: number) => {
    setProductForm({
      ...productForm,
      features: productForm.features.filter((_, i) => i !== index),
    })
  }

  const addApplication = () => {
    const application = prompt("Enter application:")
    if (application) {
      setProductForm({
        ...productForm,
        applications: [...productForm.applications, application],
      })
    }
  }

  const removeApplication = (index: number) => {
    setProductForm({
      ...productForm,
      applications: productForm.applications.filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    )
  }

  const inStockProducts = products.filter((p) => p.inStock && p.stock_quantity > 0).length
  const lowStockProducts = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity < 20).length
  const outOfStockProducts = products.filter((p) => !p.inStock || p.stock_quantity === 0).length
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock_quantity, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-cyan-600" />
            Product Management
          </h1>
          <p className="text-slate-600 mt-2">Manage your product catalog and inventory</p>
        </div>
        <Button onClick={handleAddProduct} className="bg-gradient-to-r from-cyan-600 to-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">In Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{inStockProducts}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{lowStockProducts}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{outOfStockProducts}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">${totalValue.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium text-slate-900">{product.name}</div>
                            <div className="text-sm text-slate-600">SKU: {product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">${product.price}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">{product.stock_quantity}</div>
                      </td>
                      <td className="py-4 px-4">{getStockBadge(product)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{product.rating}</span>
                          <span className="text-xs text-slate-500">({product.reviews})</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  placeholder="Enter SKU"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={productForm.stock_quantity}
                onChange={(e) =>
                  setProductForm({ ...productForm, stock_quantity: Number.parseInt(e.target.value) || 0 })
                }
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Enter short description"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="long_description">Long Description</Label>
              <Textarea
                id="long_description"
                value={productForm.long_description}
                onChange={(e) => setProductForm({ ...productForm, long_description: e.target.value })}
                placeholder="Enter detailed description"
                rows={4}
              />
            </div>

            {/* Product Images */}
            <div>
              <Label>Product Images</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-gray-500 mt-2">Uploading images...</p>}
              </div>
              
              {/* Display uploaded images */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Specifications</Label>
                <Button type="button" size="sm" variant="outline" onClick={addSpecification}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Spec
                </Button>
              </div>
              <div className="space-y-2">
                {Object.entries(productForm.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                    <span className="font-medium text-sm">{key}:</span>
                    <span className="text-sm">{value}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSpecification(key)}
                      className="ml-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Features</Label>
                <Button type="button" size="sm" variant="outline" onClick={addFeature}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Feature
                </Button>
              </div>
              <div className="space-y-2">
                {productForm.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                    <span className="text-sm">{feature}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFeature(index)}
                      className="ml-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Applications</Label>
                <Button type="button" size="sm" variant="outline" onClick={addApplication}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Application
                </Button>
              </div>
              <div className="space-y-2">
                {productForm.applications.map((application, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                    <span className="text-sm">{application}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeApplication(index)}
                      className="ml-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSaveProduct} className="flex-1" disabled={!productForm.name || !productForm.sku}>
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProductManagementPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <ProductManagementContent />
      </AdminLayout>
    </AdminGuard>
  )
}