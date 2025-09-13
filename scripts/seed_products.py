import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_database
from datetime import datetime

def seed_products():
    db = get_database()
    
    # Clear existing products
    db.products.delete_many({})
    
    products = [
        {
            "name": "Arduino Uno R3",
            "sku": "ARD-UNO-R3",
            "category": "Microcontrollers",
            "price": 25.99,
            "description": "Popular microcontroller board based on ATmega328P",
            "long_description": "The Arduino Uno R3 is a microcontroller board based on the ATmega328P. It has 14 digital input/output pins (of which 6 can be used as PWM outputs), 6 analog inputs, a 16 MHz ceramic resonator, a USB connection, a power jack, an ICSP header, and a reset button.",
            "images": ["/arduino-uno-front.png", "/arduino-uno-back.png"],
            "in_stock": True,
            "stock_quantity": 150,
            "rating": 4.8,
            "reviews_count": 1250,
            "specifications": {
                "Microcontroller": "ATmega328P",
                "Operating Voltage": "5V",
                "Digital I/O Pins": "14",
                "Analog Input Pins": "6",
                "Flash Memory": "32KB",
                "Clock Speed": "16MHz"
            },
            "features": [
                "USB connectivity for easy programming",
                "Built-in LED on pin 13",
                "Reset button for easy restart",
                "Compatible with Arduino IDE"
            ],
            "applications": [
                "IoT projects and prototyping",
                "Educational electronics learning",
                "Home automation systems",
                "Robotics and motor control"
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Raspberry Pi 4 Model B",
            "sku": "RPI-4B-4GB",
            "category": "Single Board Computers",
            "price": 75.00,
            "description": "Powerful single-board computer with 4GB RAM",
            "long_description": "The Raspberry Pi 4 Model B is the newest Raspberry Pi computer made, and the Pi Foundation knows you can always make a good thing better! And what could make the Pi 4 better than the 3? How about a faster processor, USB 3.0 ports, and updated Gigabit Ethernet chip with PoE capability?",
            "images": ["/raspberry-pi-4-board.png"],
            "in_stock": True,
            "stock_quantity": 85,
            "rating": 4.9,
            "reviews_count": 2100,
            "specifications": {
                "CPU": "Quad-core ARM Cortex-A72",
                "RAM": "4GB LPDDR4",
                "Storage": "MicroSD",
                "Connectivity": "WiFi, Bluetooth, Ethernet",
                "USB Ports": "2x USB 3.0, 2x USB 2.0"
            },
            "features": [
                "Quad-core 64-bit ARM Cortex-A72 CPU",
                "Dual-band 802.11ac wireless networking",
                "Bluetooth 5.0",
                "Two USB 3.0 and two USB 2.0 ports"
            ],
            "applications": [
                "Desktop computer replacement",
                "IoT and home automation hub",
                "Media center and streaming",
                "Educational programming projects"
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "ESP32 Development Board",
            "sku": "ESP32-DEV-KIT",
            "category": "Microcontrollers",
            "price": 12.50,
            "description": "WiFi and Bluetooth enabled microcontroller",
            "long_description": "The ESP32 is a series of low-cost, low-power system on a chip microcontrollers with integrated Wi-Fi and dual-mode Bluetooth. The ESP32 series employs a Tensilica Xtensa LX6 microprocessor in both dual-core and single-core variations.",
            "images": ["/esp32-microcontroller.png"],
            "in_stock": True,
            "stock_quantity": 200,
            "rating": 4.7,
            "reviews_count": 890,
            "specifications": {
                "CPU": "Dual-core Xtensa LX6",
                "WiFi": "802.11 b/g/n",
                "Bluetooth": "v4.2 BR/EDR and BLE",
                "GPIO Pins": "30",
                "Flash Memory": "4MB"
            },
            "features": [
                "Built-in WiFi and Bluetooth",
                "Low power consumption",
                "Rich peripheral interfaces",
                "Arduino IDE compatible"
            ],
            "applications": [
                "IoT sensor networks",
                "WiFi mesh networking",
                "Bluetooth beacon projects",
                "Smart home devices"
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    result = db.products.insert_many(products)
    print(f"Inserted {len(result.inserted_ids)} products")
    
    # Create categories
    categories = [
        {
            "name": "Microcontrollers",
            "slug": "microcontrollers",
            "description": "Microcontroller boards and development kits",
            "is_active": True,
            "sort_order": 1,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Single Board Computers",
            "slug": "single-board-computers",
            "description": "Complete computer systems on a single board",
            "is_active": True,
            "sort_order": 2,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Prototyping",
            "slug": "prototyping",
            "description": "Breadboards, jumper wires, and prototyping supplies",
            "is_active": True,
            "sort_order": 3,
            "created_at": datetime.utcnow()
        }
    ]
    
    db.categories.delete_many({})
    result = db.categories.insert_many(categories)
    print(f"Inserted {len(result.inserted_ids)} categories")

if __name__ == "__main__":
    seed_products()
    print("Database seeded successfully!")
