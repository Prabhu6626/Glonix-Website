from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"
    STAFF = "staff"

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class User(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Product(BaseModel):
    id: Optional[str] = None
    name: str
    sku: str
    category: str
    price: float
    description: str
    long_description: Optional[str] = None
    images: List[str] = []
    in_stock: bool = True
    stock_quantity: int = 0
    rating: float = 0.0
    reviews_count: int = 0
    specifications: Dict[str, str] = {}
    features: List[str] = []
    applications: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    product_sku: str
    price: float
    quantity: int
    total: float

class Address(BaseModel):
    first_name: str
    last_name: str
    company: Optional[str] = None
    address1: str
    address2: Optional[str] = None
    city: str
    state: str
    zip_code: str
    country: str = "US"
    phone: Optional[str] = None

class Order(BaseModel):
    id: Optional[str] = None
    user_id: str
    order_number: str
    items: List[OrderItem]
    shipping_address: Address
    billing_address: Address
    shipping_method: str
    payment_method: str
    subtotal: float
    shipping_cost: float
    tax: float
    total: float
    status: OrderStatus = OrderStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    estimated_delivery: Optional[datetime] = None

class ContactMessage(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    subject: str
    message: str
    service_type: Optional[str] = None
    status: str = "new"
    replied: bool = False
    created_at: Optional[datetime] = None

class QuoteRequest(BaseModel):
    id: Optional[str] = None
    quote_number: Optional[str] = None
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    service_type: str
    project_description: str
    requirements: Dict[str, Any] = {}
    files: List[str] = []
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    status: str = "pending"
    responded: bool = False
    quote_amount: Optional[float] = None
    quote_valid_until: Optional[datetime] = None
    created_at: Optional[datetime] = None

class Review(BaseModel):
    id: Optional[str] = None
    product_id: str
    user_id: str
    rating: int  # 1-5
    title: str
    comment: str
    verified_purchase: bool = False
    helpful_votes: int = 0
    created_at: Optional[datetime] = None

class Category(BaseModel):
    id: Optional[str] = None
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    image: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0
    created_at: Optional[datetime] = None

class Coupon(BaseModel):
    id: Optional[str] = None
    code: str
    description: str
    discount_type: str  # "percentage" or "fixed"
    discount_value: float
    minimum_order: Optional[float] = None
    maximum_discount: Optional[float] = None
    usage_limit: Optional[int] = None
    used_count: int = 0
    is_active: bool = True
    valid_from: datetime
    valid_until: datetime
    created_at: Optional[datetime] = None

class Inventory(BaseModel):
    id: Optional[str] = None
    product_id: str
    quantity: int
    reserved_quantity: int = 0
    reorder_level: int = 10
    reorder_quantity: int = 100
    supplier: Optional[str] = None
    cost_price: Optional[float] = None
    last_updated: Optional[datetime] = None

class ShippingRate(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    rate: float
    estimated_days: int
    is_active: bool = True
    weight_limit: Optional[float] = None
    regions: List[str] = []
