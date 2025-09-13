#!/usr/bin/env python3
"""
MongoDB Database Setup Script for Glonix Electronics
Creates collections, indexes, and initial data
"""

import os
import sys
from datetime import datetime
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, DuplicateKeyError
import bcrypt

# Database configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "glonix_electronics"

def get_database():
    """Get MongoDB database connection"""
    try:
        client = MongoClient(MONGODB_URL)
        # Test connection
        client.admin.command('ping')
        print(f"✅ Connected to MongoDB at {MONGODB_URL}")
        return client[DATABASE_NAME]
    except ConnectionFailure:
        print(f"❌ Failed to connect to MongoDB at {MONGODB_URL}")
        sys.exit(1)

def create_collections_and_indexes(db):
    """Create collections and indexes"""
    print("\n📁 Creating collections and indexes...")
    
    # Users collection
    users = db.users
    users.create_index([("email", ASCENDING)], unique=True)
    users.create_index([("created_at", DESCENDING)])
    print("✅ Users collection created with indexes")
    
    # Projects collection
    projects = db.projects
    projects.create_index([("user_id", ASCENDING)])
    projects.create_index([("created_at", DESCENDING)])
    projects.create_index([("status", ASCENDING)])
    projects.create_index([("service_type", ASCENDING)])
    print("✅ Projects collection created with indexes")
    
    # Quotes collection
    quotes = db.quotes
    quotes.create_index([("user_id", ASCENDING)])
    quotes.create_index([("project_id", ASCENDING)])
    quotes.create_index([("created_at", DESCENDING)])
    quotes.create_index([("status", ASCENDING)])
    print("✅ Quotes collection created with indexes")
    
    # Contact messages collection
    contact_messages = db.contact_messages
    contact_messages.create_index([("created_at", DESCENDING)])
    contact_messages.create_index([("status", ASCENDING)])
    contact_messages.create_index([("service_interest", ASCENDING)])
    print("✅ Contact messages collection created with indexes")
    
    # Components collection (for sourcing)
    components = db.components
    components.create_index([("part_number", ASCENDING)])
    components.create_index([("category", ASCENDING)])
    components.create_index([("manufacturer", ASCENDING)])
    components.create_index([("created_at", DESCENDING)])
    print("✅ Components collection created with indexes")
    
    # Orders collection
    orders = db.orders
    orders.create_index([("user_id", ASCENDING)])
    orders.create_index([("order_number", ASCENDING)], unique=True)
    orders.create_index([("created_at", DESCENDING)])
    orders.create_index([("status", ASCENDING)])
    print("✅ Orders collection created with indexes")

def create_admin_user(db):
    """Create default admin user"""
    print("\n👤 Creating admin user...")
    
    users = db.users
    admin_email = "admin@glonix.in"
    
    # Check if admin already exists
    if users.find_one({"email": admin_email}):
        print(f"ℹ️  Admin user {admin_email} already exists")
        return
    
    # Create admin user
    admin_password = "admin123"  # Change this in production
    hashed_password = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt())
    
    admin_user = {
        "email": admin_email,
        "hashed_password": hashed_password.decode('utf-8'),
        "full_name": "Glonix Administrator",
        "company": "Glonix Electronics Private Limited",
        "phone": "9444312035",
        "role": "admin",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    try:
        result = users.insert_one(admin_user)
        print(f"✅ Admin user created with ID: {result.inserted_id}")
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Password: {admin_password}")
        print("⚠️  Please change the admin password after first login!")
    except DuplicateKeyError:
        print(f"ℹ️  Admin user {admin_email} already exists")

def seed_sample_data(db):
    """Seed database with sample data"""
    print("\n🌱 Seeding sample data...")
    
    # Sample components
    components = db.components
    sample_components = [
        {
            "part_number": "STM32F103C8T6",
            "manufacturer": "STMicroelectronics",
            "category": "Microcontrollers",
            "description": "32-bit ARM Cortex-M3 microcontroller",
            "package": "LQFP-48",
            "price_usd": 2.50,
            "stock_quantity": 1000,
            "datasheet_url": "https://www.st.com/resource/en/datasheet/stm32f103c8.pdf",
            "created_at": datetime.utcnow()
        },
        {
            "part_number": "ESP32-WROOM-32",
            "manufacturer": "Espressif Systems",
            "category": "Wireless Modules",
            "description": "Wi-Fi and Bluetooth module",
            "package": "SMD-38",
            "price_usd": 3.20,
            "stock_quantity": 500,
            "datasheet_url": "https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf",
            "created_at": datetime.utcnow()
        },
        {
            "part_number": "LM358",
            "manufacturer": "Texas Instruments",
            "category": "Operational Amplifiers",
            "description": "Dual operational amplifier",
            "package": "DIP-8",
            "price_usd": 0.25,
            "stock_quantity": 2000,
            "datasheet_url": "https://www.ti.com/lit/ds/symlink/lm358.pdf",
            "created_at": datetime.utcnow()
        }
    ]
    
    for component in sample_components:
        try:
            components.insert_one(component)
            print(f"✅ Added component: {component['part_number']}")
        except DuplicateKeyError:
            print(f"ℹ️  Component {component['part_number']} already exists")
    
    print("✅ Sample data seeded successfully")

def create_database_views(db):
    """Create database views for analytics"""
    print("\n📊 Creating database views...")
    
    # User statistics view
    try:
        db.create_collection("user_stats", viewOn="users", pipeline=[
            {
                "$group": {
                    "_id": None,
                    "total_users": {"$sum": 1},
                    "active_users": {
                        "$sum": {"$cond": [{"$eq": ["$is_active", True]}, 1, 0]}
                    },
                    "users_with_company": {
                        "$sum": {"$cond": [{"$ne": ["$company", None]}, 1, 0]}
                    }
                }
            }
        ])
        print("✅ User statistics view created")
    except Exception as e:
        print(f"ℹ️  User stats view might already exist: {e}")
    
    # Project statistics view
    try:
        db.create_collection("project_stats", viewOn="projects", pipeline=[
            {
                "$group": {
                    "_id": "$service_type",
                    "count": {"$sum": 1},
                    "avg_value": {"$avg": "$estimated_value"}
                }
            }
        ])
        print("✅ Project statistics view created")
    except Exception as e:
        print(f"ℹ️  Project stats view might already exist: {e}")

def main():
    """Main setup function"""
    print("🚀 Starting Glonix Electronics Database Setup")
    print("=" * 50)
    
    # Get database connection
    db = get_database()
    
    # Create collections and indexes
    create_collections_and_indexes(db)
    
    # Create admin user
    create_admin_user(db)
    
    # Seed sample data
    seed_sample_data(db)
    
    # Create views
    create_database_views(db)
    
    print("\n" + "=" * 50)
    print("✅ Database setup completed successfully!")
    print("\n📋 Summary:")
    print(f"   • Database: {DATABASE_NAME}")
    print(f"   • Collections: users, projects, quotes, contact_messages, components, orders")
    print(f"   • Admin user: admin@glonix.in")
    print(f"   • Sample components: 3 items")
    print("\n🔧 Next steps:")
    print("   1. Update MONGODB_URL environment variable")
    print("   2. Change admin password after first login")
    print("   3. Start the FastAPI backend server")

if __name__ == "__main__":
    main()
