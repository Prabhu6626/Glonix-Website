from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from typing import List, Dict, Any
from typing import Optional, List, Dict, Any
from database import get_database

app = FastAPI(title="Glonix Electronics API")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_manager = get_database()

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: str
    email: str
    full_name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    role: str = "customer"
    is_active: bool = True
    fabrication_status: int = 0
    created_at: datetime

class ProjectCreate(BaseModel):
    title: str
    description: str
    service_type: str
    requirements: Optional[str] = None
    estimated_value: Optional[float] = None
    deadline: Optional[datetime] = None

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    service_interest: Optional[str] = None
    message: str

class FabricationStatusUpdate(BaseModel):
    user_id: str
    status: int  # 0, 1, or 2

# Enhanced User Models
class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    role: str = "customer"
    is_active: bool = True
    fabrication_status: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    fabrication_status: Optional[int] = None

# Product Models
class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    price: float
    description: str
    long_description: Optional[str] = None
    stock_quantity: int
    specifications: Dict[str, str] = {}
    features: List[str] = []
    applications: List[str] = []
    images: List[str] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    long_description: Optional[str] = None
    stock_quantity: Optional[int] = None
    specifications: Optional[Dict[str, str]] = None
    features: Optional[List[str]] = None
    applications: Optional[List[str]] = None
    images: Optional[List[str]] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    sku: str
    category: str
    price: float
    image: str
    images: List[str]
    description: str
    long_description: Optional[str] = None
    inStock: bool
    stock_quantity: int
    rating: float = 0.0
    reviews: int = 0
    specifications: Dict[str, str]
    features: List[str]
    applications: List[str]
    created_at: datetime
    updated_at: datetime

# Order Models
class OrderUpdate(BaseModel):
    status: Optional[str] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    order_number: str
    user_id: str
    user_name: str
    user_email: str
    total: float
    status: str
    payment_status: str
    created_at: datetime
    updated_at: Optional[datetime] = None


# Order Management Models
class AddressModel(BaseModel):
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

class OrderItemModel(BaseModel):
    product_id: str
    product_name: str
    product_sku: str
    price: float
    quantity: int
    total: float

class OrderCreate(BaseModel):
    items: List[OrderItemModel]
    shipping_address: AddressModel
    billing_address: AddressModel
    shipping_method: str
    payment_method: str
    subtotal: float
    shipping_cost: float
    tax: float
    total: float

 # Add these models and routes to your existing main.py

# Enquiry Models
class EnquiryCreate(BaseModel):
    enquiry_type: str  # "design_enquiry" or "product_enquiry"
    title: str
    abstract: Optional[str] = None
    requirements: Optional[str] = None
    file_url: Optional[str] = None
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    priority: Optional[str] = "medium"

class EnquiryResponse(BaseModel):
    id: str
    enquiry_type: str
    title: str
    abstract: Optional[str] = None
    requirements: Optional[str] = None
    file_url: Optional[str] = None
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    priority: str
    status: str
    replied: bool
    user_id: str
    user_name: str
    user_email: str
    created_at: datetime
    updated_at: datetime
    replies: List[Dict[str, Any]] = []

class EnquiryReply(BaseModel):
    message: str
    attachments: Optional[List[str]] = []

class EnquiryStatusUpdate(BaseModel):
    status: str  # "new", "in_progress", "replied", "completed", "closed"
   

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db_manager.get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user



# Initialize admin user
def initialize_admin():
    """Create default admin user if it doesn't exist"""
    admin_email = "admin@glonix.com"
    admin_user = db_manager.get_user_by_email(admin_email)
    
    if not admin_user:
        admin_data = {
            "email": admin_email,
            "hashed_password": get_password_hash("admin123"),
            "full_name": "Admin User",
            "company": "Glonix Electronics",
            "phone": "+1-555-0100",
            "role": "admin",
            "fabrication_status": 0,
        }
        db_manager.create_user(admin_data)
        print(f"Admin user created: {admin_email} / admin123")

# Admin check decorator
def admin_required(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Initialize admin on startup
@app.on_event("startup")
async def startup_event():
    initialize_admin()

# API Routes
@app.post("/auth/register", response_model=Token)
async def register(user: UserCreate):
    # Check if user already exists
    if db_manager.get_user_by_email(user.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_data = {
        "email": user.email,
        "hashed_password": hashed_password,
        "full_name": user.full_name,
        "company": user.company,
        "phone": user.phone,
        "role": "customer",
        "fabrication_status": 0,
    }
    
    user_id = db_manager.create_user(user_data)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def login(user: UserLogin):
    # Authenticate user
    db_user = db_manager.get_user_by_email(user.email)
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not db_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return User(
        id=str(current_user["_id"]),
        email=current_user["email"],
        full_name=current_user["full_name"],
        company=current_user.get("company"),
        phone=current_user.get("phone"),
        role=current_user.get("role", "customer"),
        is_active=current_user.get("is_active", True),
        fabrication_status=current_user.get("fabrication_status", 0),
        created_at=current_user["created_at"]
    )

@app.get("/auth/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    return {"valid": True, "user": current_user["email"]}

@app.put("/auth/fabrication-status")
async def update_fabrication_status(
    update_data: FabricationStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update fabrication status for a user"""
    # Check if current user is admin or updating their own status
    if current_user.get("role") != "admin" and str(current_user["_id"]) != update_data.user_id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this user's fabrication status"
        )
    
    success = db_manager.update_user(update_data.user_id, {
        "fabrication_status": update_data.status
    })
    
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Fabrication status updated successfully"}

@app.get("/auth/users-by-fabrication-status")
async def get_users_by_fabrication_status(
    status: int,
    current_user: dict = Depends(get_current_user)
):
    """Get users by fabrication status (admin only)"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # This would need to be implemented in the database manager
    # For now, return empty list
    return {"users": []}

@app.post("/projects")
async def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    """Create a new project"""
    project_data = {
        "user_id": str(current_user["_id"]),
        "title": project.title,
        "description": project.description,
        "service_type": project.service_type,
        "requirements": project.requirements,
        "estimated_value": project.estimated_value,
        "deadline": project.deadline,
    }
    
    project_id = db_manager.create_project(project_data)
    return {"project_id": project_id, "message": "Project created successfully"}

@app.get("/projects")
async def get_user_projects(current_user: dict = Depends(get_current_user)):
    """Get all projects for the current user"""
    projects = db_manager.get_user_projects(str(current_user["_id"]))
    return {"projects": projects}

@app.get("/quotes")
async def get_user_quotes(current_user: dict = Depends(get_current_user)):
    """Get all quotes for the current user"""
    quotes = db_manager.get_user_quotes(str(current_user["_id"]))
    return {"quotes": quotes}

@app.post("/contact")
async def submit_contact_message(message: ContactMessage):
    """Submit a contact message"""
    message_data = {
        "name": message.name,
        "email": message.email,
        "company": message.company,
        "phone": message.phone,
        "service_interest": message.service_interest,
        "message": message.message,
    }
    
    message_id = db_manager.create_contact_message(message_data)
    return {"message_id": message_id, "message": "Contact message submitted successfully"}

@app.get("/components/search")
async def search_components(
    q: str, 
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Search components"""
    components = db_manager.search_components(q, category)
    return {"components": components}

@app.get("/components/categories")
async def get_component_categories(current_user: dict = Depends(get_current_user)):
    """Get all component categories"""
    categories = db_manager.get_component_categories()
    return {"categories": categories}

@app.get("/analytics/users")
async def get_user_analytics(current_user: dict = Depends(get_current_user)):
    """Get user analytics (admin only)"""
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    stats = db_manager.get_user_stats()
    return {"user_stats": stats}

@app.get("/analytics/projects")
async def get_project_analytics(current_user: dict = Depends(get_current_user)):
    """Get project analytics (admin only)"""
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    stats = db_manager.get_project_stats()
    return {"project_stats": stats}

# CUSTOMER CART MANAGEMENT
@app.post("/cart/add")
async def add_to_cart(
    item: CartItemModel,
    current_user: dict = Depends(get_current_user)
):
    """Add item to user's cart"""
    try:
        user_id = str(current_user["_id"])
        
        # Update user's fabrication status to 2 (added to cart)
        db_manager.update_user(user_id, {"fabrication_status": 2})
        
        # Get product details
        product = db_manager.get_product_by_id(item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Store cart in user document
        user = db_manager.get_user_by_id(user_id)
        current_cart = user.get("cart", [])
        
        # Check if item already in cart
        existing_item = next((i for i in current_cart if i["product_id"] == item.product_id), None)
        
        if existing_item:
            existing_item["quantity"] += item.quantity
        else:
            current_cart.append({
                "product_id": item.product_id,
                "product_name": product["name"],
                "product_sku": product["sku"],
                "price": product["price"],
                "quantity": item.quantity,
                "image": product.get("image", "")
            })
        
        # Update user's cart
        db_manager.update_user(user_id, {"cart": current_cart})
        
        return {"success": True, "message": "Item added to cart"}
        
    except Exception as e:
        print(f"Add to cart error: {e}")
        raise HTTPException(status_code=500, detail="Failed to add item to cart")

@app.get("/cart")
async def get_cart(current_user: dict = Depends(get_current_user)):
    """Get user's cart"""
    try:
        user_id = str(current_user["_id"])
        user = db_manager.get_user_by_id(user_id)
        cart = user.get("cart", [])
        
        return {"cart": cart}
        
    except Exception as e:
        print(f"Get cart error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get cart")

@app.put("/cart")
async def update_cart(
    cart_update: CartUpdateModel,
    current_user: dict = Depends(get_current_user)
):
    """Update user's cart"""
    try:
        user_id = str(current_user["_id"])
        
        # Convert cart items to detailed format
        cart_items = []
        for item in cart_update.items:
            product = db_manager.get_product_by_id(item.product_id)
            if product:
                cart_items.append({
                    "product_id": item.product_id,
                    "product_name": product["name"],
                    "product_sku": product["sku"],
                    "price": product["price"],
                    "quantity": item.quantity,
                    "image": product.get("image", "")
                })
        
        # Update fabrication status based on cart contents
        status = 2 if cart_items else 0
        db_manager.update_user(user_id, {
            "cart": cart_items,
            "fabrication_status": status
        })
        
        return {"success": True, "message": "Cart updated"}
        
    except Exception as e:
        print(f"Update cart error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update cart")

@app.delete("/cart")
async def clear_cart(current_user: dict = Depends(get_current_user)):
    """Clear user's cart"""
    try:
        user_id = str(current_user["_id"])
        db_manager.update_user(user_id, {
            "cart": [],
            "fabrication_status": 0
        })
        
        return {"success": True, "message": "Cart cleared"}
        
    except Exception as e:
        print(f"Clear cart error: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear cart")
# ADMIN USER MANAGEMENT ROUTES
@app.get("/admin/users", response_model=Dict[str, Any])
async def get_all_users_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(admin_required)
):
    """Get all users with pagination (admin only)"""
    users = db_manager.get_all_users(skip, limit)
    total = len(db_manager.get_all_users(0, 10000))  # Get total count
    
    user_responses = []
    for user in users:
        user_responses.append(UserResponse(
            id=user["_id"],
            email=user["email"],
            full_name=user["full_name"],
            company=user.get("company"),
            phone=user.get("phone"),
            role=user.get("role", "customer"),
            is_active=user.get("is_active", True),
            fabrication_status=user.get("fabrication_status", 0),
            created_at=user["created_at"],
            updated_at=user.get("updated_at")
        ))
    
    return {
        "users": user_responses,
        "total": total,
        "skip": skip,
        "limit": limit
    }


# CUSTOMER ORDER ENDPOINTS
@app.post("/orders")
async def create_order(order: OrderCreate, current_user: dict = Depends(get_current_user)):
    """Create a new order"""
    try:
        # Prepare order data
        order_data = {
            "user_id": str(current_user["_id"]),
            "items": [item.dict() for item in order.items],
            "shipping_address": order.shipping_address.dict(),
            "billing_address": order.billing_address.dict(),
            "shipping_method": order.shipping_method,
            "payment_method": order.payment_method,
            "subtotal": order.subtotal,
            "shipping_cost": order.shipping_cost,
            "tax": order.tax,
            "total": order.total,
            "status": "pending",
            "payment_status": "pending"
        }
        
        # Create order in database
        order_id = db_manager.create_order(order_data)
        
        # Update user's fabrication status to 2 (added to cart/ordered)
        db_manager.update_user(str(current_user["_id"]), {"fabrication_status": 2})
        
        return {"success": True, "order_id": order_id, "message": "Order created successfully"}
        
    except Exception as e:
        print(f"Order creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create order")

@app.get("/orders/my-orders")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    """Get orders for the current user"""
    try:
        # Get user's orders from database
        user_id = str(current_user["_id"])
        orders = db_manager.get_user_orders(user_id)
        
        return {"orders": orders}
        
    except Exception as e:
        print(f"Get orders error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve orders")

@app.get("/orders/{order_id}")
async def get_order_by_id(order_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific order by ID"""
    try:
        order = db_manager.get_order_by_id(order_id)
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
            
        # Check if user owns this order or is admin
        if order.get("user_id") != str(current_user["_id"]) and current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
            
        return {"order": order}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get order error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve order")



@app.put("/admin/users/{user_id}")
async def update_user_admin(
    user_id: str,
    user_update: UserUpdate,
    current_user: dict = Depends(admin_required)
):
    """Update user information (admin only)"""
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    
    success = db_manager.update_user(user_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User updated successfully"}

@app.delete("/admin/users/{user_id}")
async def delete_user_admin(
    user_id: str,
    current_user: dict = Depends(admin_required)
):
    """Delete user (admin only)"""
    # Don't allow deleting admin users
    user = db_manager.get_user_by_id(user_id)
    if user and user.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin users")
    
    success = db_manager.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

@app.get("/admin/users/fabrication-status/{status}")
async def get_users_by_fabrication_status_admin(
    status: int,
    current_user: dict = Depends(admin_required)
):
    """Get users by fabrication status (admin only)"""
    users = db_manager.get_users_by_fabrication_status(status)
    
    user_responses = []
    for user in users:
        user_responses.append(UserResponse(
            id=user["_id"],
            email=user["email"],
            full_name=user["full_name"],
            company=user.get("company"),
            phone=user.get("phone"),
            role=user.get("role", "customer"),
            is_active=user.get("is_active", True),
            fabrication_status=user.get("fabrication_status", 0),
            created_at=user["created_at"],
            updated_at=user.get("updated_at")
        ))
    
    return {"users": user_responses}

# ADMIN PRODUCT MANAGEMENT ROUTES
@app.get("/admin/products", response_model=Dict[str, Any])
async def get_all_products_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[str] = None,
    current_user: dict = Depends(admin_required)
):
    """Get all products with pagination (admin only)"""
    products = db_manager.get_all_products(skip, limit, category)
    total = db_manager.get_products_count(category)
    
    product_responses = []
    for product in products:
        product_responses.append(ProductResponse(
            id=product["_id"],
            name=product["name"],
            sku=product["sku"],
            category=product["category"],
            price=product["price"],
            image=product.get("image", ""),
            images=product.get("images", []),
            description=product["description"],
            long_description=product.get("long_description"),
            inStock=product.get("inStock", True),
            stock_quantity=product.get("stock_quantity", 0),
            rating=product.get("rating", 0.0),
            reviews=product.get("reviews", 0),
            specifications=product.get("specifications", {}),
            features=product.get("features", []),
            applications=product.get("applications", []),
            created_at=product["created_at"],
            updated_at=product["updated_at"]
        ))
    
    return {
        "products": product_responses,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@app.post("/admin/products", response_model=ProductResponse)
async def create_product_admin(
    product: ProductCreate,
    current_user: dict = Depends(admin_required)
):
    """Create new product (admin only)"""
    product_data = {
        "name": product.name,
        "sku": product.sku,
        "category": product.category,
        "price": product.price,
        "description": product.description,
        "long_description": product.long_description,
        "stock_quantity": product.stock_quantity,
        "inStock": product.stock_quantity > 0,
        "image": product.images[0] if product.images else "",
        "images": product.images,
        "specifications": product.specifications,
        "features": product.features,
        "applications": product.applications,
        "rating": 0.0,
        "reviews": 0
    }
    
    product_id = db_manager.create_product(product_data)
    created_product = db_manager.get_product_by_id(product_id)
    
    return ProductResponse(
        id=created_product["_id"],
        name=created_product["name"],
        sku=created_product["sku"],
        category=created_product["category"],
        price=created_product["price"],
        image=created_product.get("image", ""),
        images=created_product.get("images", []),
        description=created_product["description"],
        long_description=created_product.get("long_description"),
        inStock=created_product.get("inStock", True),
        stock_quantity=created_product.get("stock_quantity", 0),
        rating=created_product.get("rating", 0.0),
        reviews=created_product.get("reviews", 0),
        specifications=created_product.get("specifications", {}),
        features=created_product.get("features", []),
        applications=created_product.get("applications", []),
        created_at=created_product["created_at"],
        updated_at=created_product["updated_at"]
    )

@app.put("/admin/products/{product_id}")
async def update_product_admin(
    product_id: str,
    product_update: ProductUpdate,
    current_user: dict = Depends(admin_required)
):
    """Update product (admin only)"""
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    
    # Update inStock based on stock_quantity
    if "stock_quantity" in update_data:
        update_data["inStock"] = update_data["stock_quantity"] > 0
    
    success = db_manager.update_product(product_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product updated successfully"}

@app.delete("/admin/products/{product_id}")
async def delete_product_admin(
    product_id: str,
    current_user: dict = Depends(admin_required)
):
    """Delete product (admin only)"""
    success = db_manager.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

# ADMIN ORDER MANAGEMENT ROUTES
@app.get("/admin/orders", response_model=Dict[str, Any])
async def get_all_orders_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = None,
    current_user: dict = Depends(admin_required)
):
    """Get all orders with pagination (admin only)"""
    orders = db_manager.get_all_orders(skip, limit, status)
    total = db_manager.get_orders_count(status)
    
    order_responses = []
    for order in orders:
        # Get user info
        user = db_manager.get_user_by_id(order["user_id"])
        
        order_responses.append(OrderResponse(
            id=order["_id"],
            order_number=order.get("order_number", f"ORD-{order['_id'][:8]}"),
            user_id=order["user_id"],
            user_name=user["full_name"] if user else "Unknown User",
            user_email=user["email"] if user else "unknown@email.com",
            total=order.get("total", 0.0),
            status=order.get("status", "pending"),
            payment_status=order.get("payment_status", "pending"),
            created_at=order["created_at"],
            updated_at=order.get("updated_at")
        ))
    
    return {
        "orders": order_responses,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@app.put("/admin/orders/{order_id}")
async def update_order_admin(
    order_id: str,
    order_update: OrderUpdate,
    current_user: dict = Depends(admin_required)
):
    """Update order status (admin only)"""
    update_data = {k: v for k, v in order_update.dict().items() if v is not None}
    
    success = db_manager.update_order(order_id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order updated successfully"}

# ADMIN ANALYTICS ROUTES
@app.get("/admin/analytics/overview")
async def get_admin_analytics(
    current_user: dict = Depends(admin_required)
):
    """Get admin dashboard analytics"""
    stats = db_manager.get_admin_stats()
    return {
        "totalUsers": stats.get("total_users", 0),
        "totalProducts": stats.get("total_products", 0),
        "totalOrders": stats.get("total_orders", 0),
        "totalRevenue": stats.get("total_revenue", 0.0),
        "pendingOrders": stats.get("pending_orders", 0),
        "lowStockProducts": stats.get("low_stock_products", 0),
        "newMessages": stats.get("new_messages", 0),
        "newQuotes": stats.get("new_quotes", 0)
    }

# ADMIN CONTACT MESSAGES
@app.get("/admin/messages")
async def get_contact_messages_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(admin_required)
):
    """Get contact messages (admin only)"""
    messages = db_manager.get_contact_messages(skip, limit)
    total = db_manager.get_contact_messages_count()
    
    return {
        "messages": messages,
        "total": total,
        "skip": skip,
        "limit": limit
    }


# CUSTOMER ENQUIRY ENDPOINTS
@app.post("/enquiries")
async def create_enquiry(enquiry: EnquiryCreate, current_user: dict = Depends(get_current_user)):
    """Create a new enquiry (design or product)"""
    try:
        enquiry_data = {
            "user_id": str(current_user["_id"]),
            "enquiry_type": enquiry.enquiry_type,
            "title": enquiry.title,
            "abstract": enquiry.abstract,
            "requirements": enquiry.requirements,
            "file_url": enquiry.file_url,
            "budget_range": enquiry.budget_range,
            "timeline": enquiry.timeline,
            "priority": enquiry.priority,
            "replies": []
        }
        
        enquiry_id = db_manager.create_enquiry(enquiry_data)
        
        # Update user's fabrication status to 1 (visited/interested)
        if current_user.get("fabrication_status", 0) == 0:
            db_manager.update_user(str(current_user["_id"]), {"fabrication_status": 1})
        
        return {"success": True, "enquiry_id": enquiry_id, "message": "Enquiry submitted successfully"}
        
    except Exception as e:
        print(f"Enquiry creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create enquiry")

@app.get("/enquiries/my-enquiries")
async def get_my_enquiries(current_user: dict = Depends(get_current_user)):
    """Get enquiries for the current user"""
    try:
        user_id = str(current_user["_id"])
        enquiries = db_manager.get_user_enquiries(user_id)
        
        return {"enquiries": enquiries}
        
    except Exception as e:
        print(f"Get enquiries error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve enquiries")

@app.get("/enquiries/{enquiry_id}")
async def get_enquiry_by_id(enquiry_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific enquiry by ID"""
    try:
        enquiry = db_manager.get_enquiry_by_id(enquiry_id)
        
        if not enquiry:
            raise HTTPException(status_code=404, detail="Enquiry not found")
            
        # Check if user owns this enquiry or is admin
        if enquiry.get("user_id") != str(current_user["_id"]) and current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
            
        return {"enquiry": enquiry}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get enquiry error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve enquiry")

# ADMIN ENQUIRY MANAGEMENT ROUTES
@app.get("/admin/enquiries", response_model=Dict[str, Any])
async def get_all_enquiries_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    enquiry_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(admin_required)
):
    """Get all enquiries with pagination (admin only)"""
    enquiries = db_manager.get_all_enquiries(skip, limit, enquiry_type, status)
    total = db_manager.get_enquiries_count(enquiry_type, status)
    
    enquiry_responses = []
    for enquiry in enquiries:
        # Get user info
        user = db_manager.get_user_by_id(enquiry["user_id"])
        
        enquiry_responses.append(EnquiryResponse(
            id=enquiry["_id"],
            enquiry_type=enquiry["enquiry_type"],
            title=enquiry["title"],
            abstract=enquiry.get("abstract"),
            requirements=enquiry.get("requirements"),
            file_url=enquiry.get("file_url"),
            budget_range=enquiry.get("budget_range"),
            timeline=enquiry.get("timeline"),
            priority=enquiry.get("priority", "medium"),
            status=enquiry.get("status", "new"),
            replied=enquiry.get("replied", False),
            user_id=enquiry["user_id"],
            user_name=user["full_name"] if user else "Unknown User",
            user_email=user["email"] if user else "unknown@email.com",
            created_at=enquiry["created_at"],
            updated_at=enquiry.get("updated_at", enquiry["created_at"]),
            replies=enquiry.get("replies", [])
        ))
    
    return {
        "enquiries": enquiry_responses,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@app.post("/admin/enquiries/{enquiry_id}/reply")
async def reply_to_enquiry_admin(
    enquiry_id: str,
    reply: EnquiryReply,
    current_user: dict = Depends(admin_required)
):
    """Reply to an enquiry (admin only)"""
    try:
        reply_data = {
            "admin_id": str(current_user["_id"]),
            "admin_name": current_user["full_name"],
            "message": reply.message,
            "attachments": reply.attachments or []
        }
        
        success = db_manager.add_enquiry_reply(enquiry_id, reply_data)
        if not success:
            raise HTTPException(status_code=404, detail="Enquiry not found")
        
        return {"message": "Reply added successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Reply error: {e}")
        raise HTTPException(status_code=500, detail="Failed to add reply")

@app.put("/admin/enquiries/{enquiry_id}/status")
async def update_enquiry_status_admin(
    enquiry_id: str,
    status_update: EnquiryStatusUpdate,
    current_user: dict = Depends(admin_required)
):
    """Update enquiry status (admin only)"""
    success = db_manager.update_enquiry(enquiry_id, {"status": status_update.status})
    if not success:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    
    return {"message": "Enquiry status updated successfully"}

# Update the admin stats to include enquiries
@app.get("/admin/analytics/overview")
async def get_admin_analytics(
    current_user: dict = Depends(admin_required)
):
    """Get admin dashboard analytics"""
    stats = db_manager.get_admin_stats()
    
    # Add enquiry stats
    total_enquiries = db_manager.get_enquiries_count()
    new_enquiries = db_manager.get_enquiries_count(status="new")
    design_enquiries = db_manager.get_enquiries_count(enquiry_type="design_enquiry")
    product_enquiries = db_manager.get_enquiries_count(enquiry_type="product_enquiry")
    
    # Add user behavior stats
    visited_users = len(db_manager.get_users_who_visited())
    cart_users = len(db_manager.get_users_with_cart_items())
    
    return {
        "totalUsers": stats.get("total_users", 0),
        "totalProducts": stats.get("total_products", 0),
        "totalOrders": stats.get("total_orders", 0),
        "totalRevenue": stats.get("total_revenue", 0.0),
        "pendingOrders": stats.get("pending_orders", 0),
        "lowStockProducts": stats.get("low_stock_products", 0),
        "newMessages": stats.get("new_messages", 0),
        "newQuotes": stats.get("new_quotes", 0),
        "totalEnquiries": total_enquiries,
        "newEnquiries": new_enquiries,
        "designEnquiries": design_enquiries,
        "productEnquiries": product_enquiries,
        "visitedUsers": visited_users,
        "cartUsers": cart_users
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    db_manager.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)