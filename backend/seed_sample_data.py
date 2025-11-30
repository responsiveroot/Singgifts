"""
Seed Sample Data for Explore Singapore and Batik Label Collections
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'singgifts_db')]

# Sample Landmarks Data
LANDMARKS_DATA = [
    {
        "id": "merlion-park",
        "name": "The Merlion",
        "slug": "merlion-park",
        "description": "Singapore's iconic symbol - a mythical creature with a lion's head and fish body, representing the nation's history as a fishing village.",
        "image": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=600&fit=crop",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "marina-bay-sands",
        "name": "Marina Bay Sands",
        "slug": "marina-bay-sands",
        "description": "The iconic integrated resort featuring the world-famous rooftop SkyPark with infinity pool, luxury shopping, fine dining, and spectacular views of the city skyline.",
        "image": "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1200&h=600&fit=crop",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "gardens-by-the-bay",
        "name": "Gardens by the Bay",
        "slug": "gardens-by-the-bay",
        "description": "A futuristic nature park featuring the iconic Supertree Grove, Cloud Forest, and Flower Dome - a stunning blend of nature and technology.",
        "image": "https://images.unsplash.com/photo-1562992191-913952e43bef?w=1200&h=600&fit=crop",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "chinatown",
        "name": "Chinatown",
        "slug": "chinatown",
        "description": "A vibrant historic district featuring colorful shophouses, traditional temples, authentic street food, and rich Chinese cultural heritage.",
        "image": "https://images.unsplash.com/photo-1555217851-6141535bd771?w=1200&h=600&fit=crop",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "sentosa-island",
        "name": "Sentosa Island",
        "slug": "sentosa-island",
        "description": "Singapore's premier island resort destination featuring pristine beaches, Universal Studios, S.E.A. Aquarium, and endless entertainment options.",
        "image": "https://images.unsplash.com/photo-1509516498892-85b0a1f69889?w=1200&h=600&fit=crop",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]

# Sample Explore Singapore Products
ESP_PRODUCTS_DATA = [
    # Merlion Products
    {
        "id": "esp-merlion-keychain-001",
        "name": "Merlion Crystal Keychain",
        "slug": "merlion-crystal-keychain",
        "description": "Premium crystal keychain featuring Singapore's iconic Merlion. Perfect souvenir and gift.",
        "price": 15.90,
        "sale_price": 12.90,
        "landmark_id": "merlion-park",
        "stock": 100,
        "images": ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop"],
        "sku": "ESP-MER-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "esp-merlion-statue-002",
        "name": "Merlion Miniature Statue",
        "slug": "merlion-miniature-statue",
        "description": "Beautifully crafted miniature Merlion statue. A must-have Singapore collectible.",
        "price": 35.00,
        "landmark_id": "merlion-park",
        "stock": 50,
        "images": ["https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=500&h=500&fit=crop"],
        "sku": "ESP-MER-002",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    # Marina Bay Sands Products
    {
        "id": "esp-mbs-postcard-001",
        "name": "Marina Bay Sands Postcard Set",
        "slug": "mbs-postcard-set",
        "description": "Set of 10 stunning postcards featuring Marina Bay Sands from different angles.",
        "price": 12.00,
        "sale_price": 9.90,
        "landmark_id": "marina-bay-sands",
        "stock": 200,
        "images": ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop"],
        "sku": "ESP-MBS-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "esp-mbs-magnet-002",
        "name": "MBS Skyline Fridge Magnet",
        "slug": "mbs-skyline-magnet",
        "description": "High-quality ceramic fridge magnet with Marina Bay Sands skyline.",
        "price": 8.50,
        "landmark_id": "marina-bay-sands",
        "stock": 150,
        "images": ["https://images.unsplash.com/photo-1513569143478-b38b300c3c26?w=500&h=500&fit=crop"],
        "sku": "ESP-MBS-002",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    # Gardens by the Bay Products
    {
        "id": "esp-gbb-tshirt-001",
        "name": "Supertree Grove T-Shirt",
        "slug": "supertree-grove-tshirt",
        "description": "Premium cotton t-shirt featuring Gardens by the Bay's iconic Supertrees.",
        "price": 32.00,
        "sale_price": 28.00,
        "landmark_id": "gardens-by-the-bay",
        "stock": 80,
        "images": ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop"],
        "sku": "ESP-GBB-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    # Chinatown Products
    {
        "id": "esp-ct-teacup-001",
        "name": "Traditional Chinese Tea Set",
        "slug": "chinese-tea-set",
        "description": "Authentic Chinatown tea set with traditional dragon design.",
        "price": 45.00,
        "landmark_id": "chinatown",
        "stock": 40,
        "images": ["https://images.unsplash.com/photo-1582556124856-c7c0c2e36b8d?w=500&h=500&fit=crop"],
        "sku": "ESP-CT-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    # Sentosa Products
    {
        "id": "esp-sen-beach-001",
        "name": "Sentosa Beach Towel",
        "slug": "sentosa-beach-towel",
        "description": "Soft and absorbent beach towel with Sentosa Island print.",
        "price": 28.00,
        "landmark_id": "sentosa-island",
        "stock": 60,
        "images": ["https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=500&h=500&fit=crop"],
        "sku": "ESP-SEN-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]

# Sample Batik Products
BATIK_PRODUCTS_DATA = [
    {
        "id": "btk-sarong-001",
        "name": "Premium Batik Sarong",
        "slug": "premium-batik-sarong",
        "description": "Handcrafted traditional batik sarong with intricate Peranakan patterns. Made with premium cotton fabric.",
        "price": 65.00,
        "sale_price": 55.00,
        "stock": 30,
        "images": ["https://images.unsplash.com/photo-1610706502858-6a0989239446?w=500&h=500&fit=crop"],
        "sku": "BTK-SAR-001",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "btk-scarf-002",
        "name": "Batik Silk Scarf",
        "slug": "batik-silk-scarf",
        "description": "Luxurious silk scarf with hand-drawn batik designs inspired by Singapore's flora and fauna.",
        "price": 48.00,
        "stock": 50,
        "images": ["https://images.unsplash.com/photo-1601924287511-9c7c1c3e7722?w=500&h=500&fit=crop"],
        "sku": "BTK-SCR-002",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "btk-shirt-003",
        "name": "Men's Batik Shirt",
        "slug": "mens-batik-shirt",
        "description": "Contemporary batik shirt for men. Perfect blend of traditional craft and modern style.",
        "price": 85.00,
        "sale_price": 75.00,
        "stock": 40,
        "images": ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=500&fit=crop"],
        "sku": "BTK-SHT-003",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "btk-bag-004",
        "name": "Batik Tote Bag",
        "slug": "batik-tote-bag",
        "description": "Eco-friendly batik tote bag with vibrant Singapore-inspired patterns.",
        "price": 32.00,
        "stock": 70,
        "images": ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&h=500&fit=crop"],
        "sku": "BTK-BAG-004",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "btk-cushion-005",
        "name": "Batik Cushion Cover",
        "slug": "batik-cushion-cover",
        "description": "Beautiful batik cushion cover to add a touch of Southeast Asian elegance to your home.",
        "price": 25.00,
        "stock": 90,
        "images": ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop"],
        "sku": "BTK-CSH-005",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]

async def seed_data():
    """Seed sample data into collections"""
    print("="*60)
    print("SEEDING SAMPLE DATA")
    print("="*60)
    
    # Seed Landmarks
    print("\n📍 Seeding Landmarks...")
    for landmark in LANDMARKS_DATA:
        existing = await db.landmarks.find_one({"id": landmark["id"]})
        if existing:
            print(f"  ✓ Landmark '{landmark['name']}' already exists")
        else:
            await db.landmarks.insert_one(landmark)
            print(f"  + Created landmark: {landmark['name']}")
    
    # Seed Explore Singapore Products
    print("\n🌏 Seeding Explore Singapore Products...")
    for product in ESP_PRODUCTS_DATA:
        existing = await db.explore_singapore_products.find_one({"id": product["id"]})
        if existing:
            print(f"  ✓ Product '{product['name']}' already exists")
        else:
            await db.explore_singapore_products.insert_one(product)
            print(f"  + Created product: {product['name']}")
    
    # Seed Batik Products
    print("\n🎨 Seeding Batik Label Products...")
    for product in BATIK_PRODUCTS_DATA:
        existing = await db.batik_products.find_one({"id": product["id"]})
        if existing:
            print(f"  ✓ Product '{product['name']}' already exists")
        else:
            await db.batik_products.insert_one(product)
            print(f"  + Created product: {product['name']}")
    
    # Print Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    landmarks_count = await db.landmarks.count_documents({})
    esp_count = await db.explore_singapore_products.count_documents({})
    batik_count = await db.batik_products.count_documents({})
    
    print(f"\n📍 Landmarks: {landmarks_count}")
    print(f"🌏 Explore Singapore Products: {esp_count}")
    print(f"🎨 Batik Label Products: {batik_count}")
    print("\n✅ Sample data seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
    client.close()
