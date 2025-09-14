"""
Database connection and models for Glonix Electronics
"""

import os
from datetime import datetime
from typing import Optional, List, Dict, Any
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from bson import ObjectId
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_NAME = os.getenv("DATABASE_NAME", "glonix_electronics") 
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27018")

class DatabaseManager:
    """MongoDB database manager"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(MONGODB_URL)
            # Test connection
            self.client.admin.command('ping')
            self.db = self.client[DATABASE_NAME]
            logger.info(f"Connected to MongoDB at {MONGODB_URL}")
        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            logger.info("Database connection closed")
    
    # User operations
    def create_user(self, user_data: Dict[str, Any]) -> str:
        """Create a new user"""
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()
        user_data["is_active"] = True
        
        result = self.db.users.insert_one(user_data)
        logger.info(f"User created with ID: {result.inserted_id}")
        return str(result.inserted_id)
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        return self.db.users.find_one({"email": email})
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            return self.db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None
    
    def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user data"""
        update_data["updated_at"] = datetime.utcnow()
        
        try:
            result = self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update user {user_id}: {e}")
            return False
    
    def get_all_users(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all users with pagination"""
        try:
            users = list(self.db.users.find(
                {},
                {"hashed_password": 0}  # Exclude password hash
            ).skip(skip).limit(limit).sort("created_at", -1))
            
            # Convert ObjectId to string
            for user in users:
                user["_id"] = str(user["_id"])
            
            return users
        except Exception as e:
            logger.error(f"Failed to get all users: {e}")
            return []
    
    def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        try:
            result = self.db.users.delete_one({"_id": ObjectId(user_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Failed to delete user {user_id}: {e}")
            return False
    
    def get_users_by_fabrication_status(self, status: int) -> List[Dict[str, Any]]:
        """Get users by fabrication status"""
        try:
            users = list(self.db.users.find({
                "fabrication_status": status,
                "role": {"$ne": "admin"}  # Exclude admin users
            }).sort("created_at", -1))
            
            # Convert ObjectId to string and remove password hash
            for user in users:
                user["_id"] = str(user["_id"])
                user.pop("hashed_password", None)
            
            return users
        except Exception as e:
            logger.error(f"Failed to get users by fabrication status {status}: {e}")
            return []

    # Product operations - Enhanced for public access
    def create_product(self, product_data: Dict[str, Any]) -> str:
        """Create a new product"""
        product_data["created_at"] = datetime.utcnow()
        product_data["updated_at"] = datetime.utcnow()
        
        result = self.db.products.insert_one(product_data)
        logger.info(f"Product created with ID: {result.inserted_id}")
        return str(result.inserted_id)

    def get_all_products(self, skip: int = 0, limit: int = 100, category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all products with pagination, category filter, and search"""
        try:
            query = {}
            
            # Add category filter
            if category:
                query["category"] = category
            
            # Add search functionality
            if search:
                query["$or"] = [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"sku": {"$regex": search, "$options": "i"}},
                    {"description": {"$regex": search, "$options": "i"}},
                    {"category": {"$regex": search, "$options": "i"}}
                ]
                
            products = list(self.db.products.find(query)
                        .skip(skip)
                        .limit(limit)
                        .sort("created_at", -1))
            
            # Convert ObjectId to string
            for product in products:
                product["_id"] = str(product["_id"])
                
            return products
        except Exception as e:
            logger.error(f"Failed to get products: {e}")
            return []

    def get_product_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Get product by ID"""
        try:
            product = self.db.products.find_one({"_id": ObjectId(product_id)})
            if product:
                product["_id"] = str(product["_id"])
            return product
        except Exception as e:
            logger.error(f"Failed to get product {product_id}: {e}")
            return None

    def update_product(self, product_id: str, update_data: Dict[str, Any]) -> bool:
        """Update product data"""
        update_data["updated_at"] = datetime.utcnow()
        
        try:
            result = self.db.products.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update product {product_id}: {e}")
            return False

    def delete_product(self, product_id: str) -> bool:
        """Delete product"""
        try:
            result = self.db.products.delete_one({"_id": ObjectId(product_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Failed to delete product {product_id}: {e}")
            return False

    def get_products_count(self, category: Optional[str] = None, search: Optional[str] = None) -> int:
        """Get total product count"""
        try:
            query = {}
            
            if category:
                query["category"] = category
            
            if search:
                query["$or"] = [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"sku": {"$regex": search, "$options": "i"}},
                    {"description": {"$regex": search, "$options": "i"}},
                    {"category": {"$regex": search, "$options": "i"}}
                ]
                
            return self.db.products.count_documents(query)
        except Exception as e:
            logger.error(f"Failed to get products count: {e}")
            return 0

    # Cart operations
    def get_user_cart(self, user_id: str) -> Dict[str, Any]:
        """Get user's cart"""
        try:
            cart = self.db.carts.find_one({"user_id": user_id})
            if not cart:
                # Create empty cart if it doesn't exist
                cart_data = {
                    "user_id": user_id,
                    "items": [],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                result = self.db.carts.insert_one(cart_data)
                cart = self.db.carts.find_one({"_id": result.inserted_id})
            
            # Convert ObjectId to string
            cart["_id"] = str(cart["_id"])
            for item in cart.get("items", []):
                if "product_id" in item and isinstance(item["product_id"], ObjectId):
                    item["product_id"] = str(item["product_id"])
                    
            return cart
        except Exception as e:
            logger.error(f"Failed to get cart for user {user_id}: {e}")
            return {"user_id": user_id, "items": []}

    def update_user_cart(self, user_id: str, items: List[Dict[str, Any]]) -> bool:
        """Update user's cart"""
        try:
            result = self.db.carts.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "items": items,
                        "updated_at": datetime.utcnow()
                    }
                },
                upsert=True
            )
            return result.modified_count > 0 or result.upserted_id is not None
        except Exception as e:
            logger.error(f"Failed to update cart for user {user_id}: {e}")
            return False

    def clear_user_cart(self, user_id: str) -> bool:
        """Clear user's cart"""
        try:
            result = self.db.carts.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "items": [],
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to clear cart for user {user_id}: {e}")
            return False

    # Order operations
    def create_order(self, order_data: Dict[str, Any]) -> str:
        """Create a new order"""
        order_data["created_at"] = datetime.utcnow()
        order_data["updated_at"] = datetime.utcnow()
        
        # Generate order number if not provided
        if "order_number" not in order_data:
            order_count = self.db.orders.count_documents({})
            order_data["order_number"] = f"ORD-{datetime.utcnow().year}-{str(order_count + 1).zfill(4)}"
        
        result = self.db.orders.insert_one(order_data)
        logger.info(f"Order created with ID: {result.inserted_id}")
        return str(result.inserted_id)

    def get_all_orders(self, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all orders with pagination and optional status filter"""
        try:
            query = {}
            if status:
                query["status"] = status
                
            orders = list(self.db.orders.find(query)
                        .skip(skip)
                        .limit(limit)
                        .sort("created_at", -1))
            
            # Convert ObjectId to string
            for order in orders:
                order["_id"] = str(order["_id"])
                
            return orders
        except Exception as e:
            logger.error(f"Failed to get orders: {e}")
            return []

    def get_order_by_id(self, order_id: str) -> Optional[Dict[str, Any]]:
        """Get order by ID"""
        try:
            order = self.db.orders.find_one({"_id": ObjectId(order_id)})
            if order:
                order["_id"] = str(order["_id"])
            return order
        except Exception as e:
            logger.error(f"Failed to get order {order_id}: {e}")
            return None

    def get_user_orders(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all orders for a specific user"""
        try:
            orders = list(self.db.orders.find(
                {"user_id": user_id}
            ).sort("created_at", -1))
            
            # Convert ObjectId to string
            for order in orders:
                order["_id"] = str(order["_id"])
                
            return orders
        except Exception as e:
            logger.error(f"Failed to get orders for user {user_id}: {e}")
            return []

    def update_order(self, order_id: str, update_data: Dict[str, Any]) -> bool:
        """Update order data"""
        update_data["updated_at"] = datetime.utcnow()
        
        try:
            result = self.db.orders.update_one(
                {"_id": ObjectId(order_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update order {order_id}: {e}")
            return False

    def get_orders_count(self, status: Optional[str] = None) -> int:
        """Get total order count"""
        try:
            query = {}
            if status:
                query["status"] = status
            return self.db.orders.count_documents(query)
        except Exception as e:
            logger.error(f"Failed to get orders count: {e}")
            return 0

    # Project operations
    def create_project(self, project_data: Dict[str, Any]) -> str:
        """Create a new project"""
        project_data["created_at"] = datetime.utcnow()
        project_data["updated_at"] = datetime.utcnow()
        project_data["status"] = "pending"
        
        result = self.db.projects.insert_one(project_data)
        logger.info(f"Project created with ID: {result.inserted_id}")
        return str(result.inserted_id)
    
    def get_user_projects(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all projects for a user"""
        try:
            projects = list(self.db.projects.find(
                {"user_id": user_id}
            ).sort("created_at", -1))
            
            # Convert ObjectId to string
            for project in projects:
                project["_id"] = str(project["_id"])
            
            return projects
        except Exception as e:
            logger.error(f"Failed to get projects for user {user_id}: {e}")
            return []
    
    def update_project_status(self, project_id: str, status: str) -> bool:
        """Update project status"""
        try:
            result = self.db.projects.update_one(
                {"_id": ObjectId(project_id)},
                {"$set": {"status": status, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update project {project_id}: {e}")
            return False
    
    # Quote operations
    def create_quote(self, quote_data: Dict[str, Any]) -> str:
        """Create a new quote"""
        quote_data["created_at"] = datetime.utcnow()
        quote_data["status"] = "pending"
        
        result = self.db.quotes.insert_one(quote_data)
        logger.info(f"Quote created with ID: {result.inserted_id}")
        return str(result.inserted_id)
    
    def get_user_quotes(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all quotes for a user"""
        try:
            quotes = list(self.db.quotes.find(
                {"user_id": user_id}
            ).sort("created_at", -1))
            
            # Convert ObjectId to string
            for quote in quotes:
                quote["_id"] = str(quote["_id"])
            
            return quotes
        except Exception as e:
            logger.error(f"Failed to get quotes for user {user_id}: {e}")
            return []
    
    # Contact message operations
    def create_contact_message(self, message_data: Dict[str, Any]) -> str:
        """Create a new contact message"""
        message_data["created_at"] = datetime.utcnow()
        message_data["status"] = "new"
        
        result = self.db.contact_messages.insert_one(message_data)
        logger.info(f"Contact message created with ID: {result.inserted_id}")
        return str(result.inserted_id)
    
    def get_contact_messages(self, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        """Get contact messages with pagination"""
        try:
            messages = list(self.db.contact_messages.find()
                        .skip(skip)
                        .limit(limit)
                        .sort("created_at", -1))
            
            # Convert ObjectId to string
            for message in messages:
                message["_id"] = str(message["_id"])
                
            return messages
        except Exception as e:
            logger.error(f"Failed to get contact messages: {e}")
            return []

    def get_contact_messages_count(self) -> int:
        """Get total contact messages count"""
        try:
            return self.db.contact_messages.count_documents({})
        except Exception as e:
            logger.error(f"Failed to get contact messages count: {e}")
            return 0
    
    # Component operations
    def search_components(self, query: str, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search components by part number or description"""
        try:
            search_filter = {
                "$or": [
                    {"part_number": {"$regex": query, "$options": "i"}},
                    {"description": {"$regex": query, "$options": "i"}},
                    {"manufacturer": {"$regex": query, "$options": "i"}}
                ]
            }
            
            if category:
                search_filter["category"] = category
            
            components = list(self.db.components.find(search_filter).limit(50))
            
            # Convert ObjectId to string
            for component in components:
                component["_id"] = str(component["_id"])
            
            return components
        except Exception as e:
            logger.error(f"Failed to search components: {e}")
            return []
    
    def get_component_categories(self) -> List[str]:
        """Get all component categories"""
        try:
            return self.db.components.distinct("category")
        except Exception as e:
            logger.error(f"Failed to get component categories: {e}")
            return []
    
    # Analytics operations
    def get_user_stats(self) -> Dict[str, Any]:
        """Get user statistics"""
        try:
            total_users = self.db.users.count_documents({})
            active_users = self.db.users.count_documents({"is_active": True})
            
            return {
                "total_users": total_users,
                "active_users": active_users,
                "inactive_users": total_users - active_users
            }
        except Exception as e:
            logger.error(f"Failed to get user stats: {e}")
            return {}
    
    def get_project_stats(self) -> Dict[str, Any]:
        """Get project statistics"""
        try:
            pipeline = [
                {
                    "$group": {
                        "_id": "$service_type",
                        "count": {"$sum": 1},
                        "avg_value": {"$avg": "$estimated_value"}
                    }
                }
            ]
            
            stats = list(self.db.projects.aggregate(pipeline))
            return {stat["_id"]: {"count": stat["count"], "avg_value": stat.get("avg_value", 0)} for stat in stats}
        except Exception as e:
            logger.error(f"Failed to get project stats: {e}")
            return {}

    def get_admin_stats(self) -> Dict[str, Any]:
        """Get comprehensive admin statistics"""
        try:
            # Basic counts
            total_users = self.db.users.count_documents({})
            total_products = self.db.products.count_documents({})
            total_orders = self.db.orders.count_documents({})
            
            # Revenue calculation
            revenue_pipeline = [
                {"$match": {"status": {"$in": ["delivered", "completed"]}}},
                {"$group": {"_id": None, "total_revenue": {"$sum": "$total"}}}
            ]
            revenue_result = list(self.db.orders.aggregate(revenue_pipeline))
            total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0.0
            
            # Pending orders
            pending_orders = self.db.orders.count_documents({"status": "pending"})
            
            # Low stock products
            low_stock_products = self.db.products.count_documents({
                "$and": [
                    {"stock_quantity": {"$lt": 20}},
                    {"stock_quantity": {"$gt": 0}}
                ]
            })
            
            # New messages
            new_messages = self.db.contact_messages.count_documents({
                "status": {"$in": ["new", "unread"]}
            })
            
            # New quotes (if collection exists)
            try:
                new_quotes = self.db.quote_requests.count_documents({"status": "pending"})
            except:
                new_quotes = 0
            
            return {
                "total_users": total_users,
                "total_products": total_products,
                "total_orders": total_orders,
                "total_revenue": float(total_revenue),
                "pending_orders": pending_orders,
                "low_stock_products": low_stock_products,
                "new_messages": new_messages,
                "new_quotes": new_quotes
            }
        except Exception as e:
            logger.error(f"Failed to get admin stats: {e}")
            return {}

    # Enquiry operations
    def create_enquiry(self, enquiry_data: Dict[str, Any]) -> str:
        """Create a new enquiry (design or product)"""
        enquiry_data["created_at"] = datetime.utcnow()
        enquiry_data["updated_at"] = datetime.utcnow()
        enquiry_data["status"] = "new"
        enquiry_data["replied"] = False
        
        result = self.db.enquiries.insert_one(enquiry_data)
        logger.info(f"Enquiry created with ID: {result.inserted_id}")
        return str(result.inserted_id)

    def get_all_enquiries(self, skip: int = 0, limit: int = 100, enquiry_type: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all enquiries with pagination and optional filters"""
        try:
            query = {}
            if enquiry_type:
                query["enquiry_type"] = enquiry_type
            if status:
                query["status"] = status
                
            enquiries = list(self.db.enquiries.find(query)
                            .skip(skip)
                            .limit(limit)
                            .sort("created_at", -1))
            
            # Convert ObjectId to string
            for enquiry in enquiries:
                enquiry["_id"] = str(enquiry["_id"])
                
            return enquiries
        except Exception as e:
            logger.error(f"Failed to get enquiries: {e}")
            return []

    def get_enquiry_by_id(self, enquiry_id: str) -> Optional[Dict[str, Any]]:
        """Get enquiry by ID"""
        try:
            enquiry = self.db.enquiries.find_one({"_id": ObjectId(enquiry_id)})
            if enquiry:
                enquiry["_id"] = str(enquiry["_id"])
            return enquiry
        except Exception as e:
            logger.error(f"Failed to get enquiry {enquiry_id}: {e}")
            return None

    def update_enquiry(self, enquiry_id: str, update_data: Dict[str, Any]) -> bool:
        """Update enquiry data"""
        update_data["updated_at"] = datetime.utcnow()
        
        try:
            result = self.db.enquiries.update_one(
                {"_id": ObjectId(enquiry_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update enquiry {enquiry_id}: {e}")
            return False

    def get_enquiries_count(self, enquiry_type: Optional[str] = None, status: Optional[str] = None) -> int:
        """Get total enquiries count"""
        try:
            query = {}
            if enquiry_type:
                query["enquiry_type"] = enquiry_type
            if status:
                query["status"] = status
            return self.db.enquiries.count_documents(query)
        except Exception as e:
            logger.error(f"Failed to get enquiries count: {e}")
            return 0

    def add_enquiry_reply(self, enquiry_id: str, reply_data: Dict[str, Any]) -> bool:
        """Add reply to an enquiry"""
        try:
            reply_data["timestamp"] = datetime.utcnow()
            result = self.db.enquiries.update_one(
                {"_id": ObjectId(enquiry_id)},
                {
                    "$push": {"replies": reply_data},
                    "$set": {
                        "replied": True,
                        "status": "replied",
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to add reply to enquiry {enquiry_id}: {e}")
            return False

    def get_user_enquiries(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all enquiries for a specific user"""
        try:
            enquiries = list(self.db.enquiries.find(
                {"user_id": user_id}
            ).sort("created_at", -1))
            
            # Convert ObjectId to string
            for enquiry in enquiries:
                enquiry["_id"] = str(enquiry["_id"])
                
            return enquiries
        except Exception as e:
            logger.error(f"Failed to get enquiries for user {user_id}: {e}")
            return [] 
        

    # Add these methods to your DatabaseManager class in database.py

def create_order_with_payment(self, order_data: Dict[str, Any]) -> str:
    """Create order with payment details"""
    order_data["created_at"] = datetime.utcnow()
    order_data["updated_at"] = datetime.utcnow()
    
    # Generate order number if not provided
    if "order_number" not in order_data:
        order_count = self.db.orders.count_documents({})
        order_data["order_number"] = f"ORD-{datetime.utcnow().year}-{str(order_count + 1).zfill(4)}"
    
    # Add payment tracking fields
    order_data["payment_verified"] = True
    order_data["payment_gateway"] = "razorpay"
    
    result = self.db.orders.insert_one(order_data)
    logger.info(f"Order with payment created with ID: {result.inserted_id}")
    return str(result.inserted_id)

def create_payment_log(self, payment_data: Dict[str, Any]) -> str:
    """Log payment attempt for tracking"""
    payment_data["created_at"] = datetime.utcnow()
    payment_data["status"] = "initiated"
    
    result = self.db.payment_logs.insert_one(payment_data)
    return str(result.inserted_id)

def update_payment_log(self, payment_id: str, update_data: Dict[str, Any]) -> bool:
    """Update payment log status"""
    try:
        result = self.db.payment_logs.update_one(
            {"razorpay_payment_id": payment_id},
            {"$set": {**update_data, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0
    except Exception as e:
        logger.error(f"Failed to update payment log: {e}")
        return False

def get_payment_logs(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get payment logs"""
    try:
        query = {"user_id": user_id} if user_id else {}
        logs = list(self.db.payment_logs.find(query).sort("created_at", -1))
        
        for log in logs:
            log["_id"] = str(log["_id"])
        
        return logs
    except Exception as e:
        logger.error(f"Failed to get payment logs: {e}")
        return []

def get_failed_payments(self) -> List[Dict[str, Any]]:
    """Get failed payment attempts for admin review"""
    try:
        failed_payments = list(self.db.payment_logs.find({
            "status": {"$in": ["failed", "error"]}
        }).sort("created_at", -1))
        
        for payment in failed_payments:
            payment["_id"] = str(payment["_id"])
        
        return failed_payments
    except Exception as e:
        logger.error(f"Failed to get failed payments: {e}")
        return []

# Enhanced order creation with better payment tracking
def create_order_enhanced(self, order_data: Dict[str, Any]) -> str:
    """Enhanced order creation with payment validation"""
    try:
        # Validate required payment fields
        required_payment_fields = ["payment_details", "payment_method", "payment_status"]
        for field in required_payment_fields:
            if field not in order_data:
                raise ValueError(f"Missing required field: {field}")
        
        order_data["created_at"] = datetime.utcnow()
        order_data["updated_at"] = datetime.utcnow()
        
        # Generate unique order number
        timestamp = int(datetime.utcnow().timestamp())
        order_data["order_number"] = f"GLX-{datetime.utcnow().year}-{timestamp}"
        
        # Add order validation
        order_data["validated"] = True
        order_data["payment_verified"] = order_data.get("payment_status") == "completed"
        
        result = self.db.orders.insert_one(order_data)
        
        # Create audit log
        audit_log = {
            "action": "order_created",
            "order_id": str(result.inserted_id),
            "user_id": order_data.get("user_id"),
            "payment_method": order_data.get("payment_method"),
            "total_amount": order_data.get("total"),
            "created_at": datetime.utcnow()
        }
        self.db.audit_logs.insert_one(audit_log)
        
        logger.info(f"Enhanced order created with ID: {result.inserted_id}")
        return str(result.inserted_id)
        
    except Exception as e:
        logger.error(f"Failed to create enhanced order: {e}")
        raise

def get_order_with_payment_details(self, order_id: str) -> Optional[Dict[str, Any]]:
    """Get order with complete payment details"""
    try:
        order = self.db.orders.find_one({"_id": ObjectId(order_id)})
        if order:
            order["_id"] = str(order["_id"])
            
            # Get related payment logs if available
            payment_logs = self.get_payment_logs(order.get("user_id"))
            order["payment_logs"] = payment_logs
            
        return order
    except Exception as e:
        logger.error(f"Failed to get order with payment details {order_id}: {e}")
        return None




# Global database instance
db_manager = DatabaseManager()

def get_database():
    """Get database manager instance"""
    return db_manager