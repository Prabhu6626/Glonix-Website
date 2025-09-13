#!/usr/bin/env python3
"""
Seed additional components data for Glonix Electronics
"""

import os
import sys
from datetime import datetime
from pymongo import MongoClient

# Database configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "glonix_electronics"

def get_database():
    """Get MongoDB database connection"""
    client = MongoClient(MONGODB_URL)
    return client[DATABASE_NAME]

def seed_components():
    """Seed comprehensive components data"""
    db = get_database()
    components = db.components
    
    # Extended component list
    component_data = [
        # Microcontrollers
        {
            "part_number": "ATMEGA328P-PU",
            "manufacturer": "Microchip Technology",
            "category": "Microcontrollers",
            "description": "8-bit AVR microcontroller with 32KB Flash",
            "package": "DIP-28",
            "price_usd": 1.85,
            "stock_quantity": 800,
            "specifications": {
                "flash_memory": "32KB",
                "ram": "2KB",
                "eeprom": "1KB",
                "operating_voltage": "1.8V - 5.5V"
            }
        },
        {
            "part_number": "PIC16F877A-I/P",
            "manufacturer": "Microchip Technology",
            "category": "Microcontrollers",
            "description": "8-bit PIC microcontroller",
            "package": "DIP-40",
            "price_usd": 3.20,
            "stock_quantity": 600,
            "specifications": {
                "flash_memory": "14.3KB",
                "ram": "368B",
                "eeprom": "256B",
                "operating_voltage": "2.0V - 5.5V"
            }
        },
        
        # Power Management
        {
            "part_number": "LM7805CT",
            "manufacturer": "STMicroelectronics",
            "category": "Voltage Regulators",
            "description": "5V positive voltage regulator",
            "package": "TO-220",
            "price_usd": 0.45,
            "stock_quantity": 1500,
            "specifications": {
                "output_voltage": "5V",
                "output_current": "1A",
                "input_voltage": "7V - 35V"
            }
        },
        {
            "part_number": "AMS1117-3.3",
            "manufacturer": "Advanced Monolithic Systems",
            "category": "Voltage Regulators",
            "description": "3.3V low dropout voltage regulator",
            "package": "SOT-223",
            "price_usd": 0.15,
            "stock_quantity": 2000,
            "specifications": {
                "output_voltage": "3.3V",
                "output_current": "1A",
                "dropout_voltage": "1.3V"
            }
        },
        
        # Sensors
        {
            "part_number": "DHT22",
            "manufacturer": "Aosong Electronics",
            "category": "Sensors",
            "description": "Digital temperature and humidity sensor",
            "package": "4-pin single row",
            "price_usd": 4.50,
            "stock_quantity": 300,
            "specifications": {
                "temperature_range": "-40°C to 80°C",
                "humidity_range": "0-100% RH",
                "accuracy": "±0.5°C, ±2% RH"
            }
        },
        {
            "part_number": "MPU6050",
            "manufacturer": "InvenSense",
            "category": "Sensors",
            "description": "6-axis gyroscope and accelerometer",
            "package": "QFN-24",
            "price_usd": 2.80,
            "stock_quantity": 400,
            "specifications": {
                "gyroscope_range": "±250, ±500, ±1000, ±2000°/sec",
                "accelerometer_range": "±2, ±4, ±8, ±16g",
                "interface": "I2C"
            }
        },
        
        # Communication
        {
            "part_number": "HC-05",
            "manufacturer": "HC",
            "category": "Communication Modules",
            "description": "Bluetooth serial module",
            "package": "Module",
            "price_usd": 6.50,
            "stock_quantity": 200,
            "specifications": {
                "bluetooth_version": "2.0+EDR",
                "range": "10m",
                "baud_rate": "9600-1382400"
            }
        },
        {
            "part_number": "NRF24L01",
            "manufacturer": "Nordic Semiconductor",
            "category": "Communication Modules",
            "description": "2.4GHz wireless transceiver",
            "package": "QFN-20",
            "price_usd": 1.20,
            "stock_quantity": 500,
            "specifications": {
                "frequency": "2.4GHz ISM band",
                "data_rate": "250kbps, 1Mbps, 2Mbps",
                "range": "100m"
            }
        },
        
        # Passive Components
        {
            "part_number": "0805-10K",
            "manufacturer": "Generic",
            "category": "Resistors",
            "description": "10K ohm SMD resistor",
            "package": "0805",
            "price_usd": 0.01,
            "stock_quantity": 10000,
            "specifications": {
                "resistance": "10K ohm",
                "tolerance": "±5%",
                "power": "1/8W"
            }
        },
        {
            "part_number": "0805-100nF",
            "manufacturer": "Generic",
            "category": "Capacitors",
            "description": "100nF ceramic capacitor",
            "package": "0805",
            "price_usd": 0.02,
            "stock_quantity": 8000,
            "specifications": {
                "capacitance": "100nF",
                "voltage": "50V",
                "tolerance": "±10%"
            }
        }
    ]
    
    print(f"🌱 Seeding {len(component_data)} components...")
    
    for component in component_data:
        component["created_at"] = datetime.utcnow()
        component["updated_at"] = datetime.utcnow()
        
        # Check if component already exists
        existing = components.find_one({"part_number": component["part_number"]})
        if existing:
            print(f"ℹ️  Component {component['part_number']} already exists")
            continue
        
        try:
            result = components.insert_one(component)
            print(f"✅ Added component: {component['part_number']} - {component['description']}")
        except Exception as e:
            print(f"❌ Failed to add component {component['part_number']}: {e}")
    
    print("✅ Component seeding completed!")

if __name__ == "__main__":
    seed_components()
