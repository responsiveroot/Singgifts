import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import uuid

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client['singgifts_db']

async def seed_data():
    print("Seeding database...")
    
    # Clear existing data
    await db.categories.delete_many({})
    await db.products.delete_many({})
    await db.deals.delete_many({})
    await db.cms_sections.delete_many({})
    
    # Categories with Singapore-themed images
    categories = [
        {
            "id": str(uuid.uuid4()),
            "name": "Airline Exclusives",
            "slug": "airline-exclusives",
            "description": "Premium products from Singapore Airlines",
            "image_url": "https://images.unsplash.com/photo-1686455746257-0210c23f7064",
            "subcategories": ["In-Flight Collection", "Duty Free"],
            "order": 1,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Beauty",
            "slug": "beauty",
            "description": "Premium beauty and skincare products",
            "image_url": "https://images.unsplash.com/photo-1624167479379-938f4b1c5b45",
            "subcategories": ["Skincare", "Fragrance", "Makeup"],
            "order": 2,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Electronics",
            "slug": "electronics",
            "description": "Latest tech and gadgets",
            "image_url": "https://images.unsplash.com/photo-1686455746127-02762fade30c",
            "subcategories": ["Smartphones", "Audio", "Wearables"],
            "order": 3,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fashion",
            "slug": "fashion",
            "description": "Stylish clothing and accessories",
            "image_url": "https://images.unsplash.com/photo-1749843988896-bcc365717569",
            "subcategories": ["Clothing", "Bags", "Jewelry", "Watches"],
            "order": 4,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Food",
            "slug": "food",
            "description": "Singapore's finest food and treats",
            "image_url": "https://images.unsplash.com/photo-1734304185641-b6b8eb588603",
            "subcategories": ["Snacks", "Baked Goods", "Beverages"],
            "order": 5,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Travel & Gifts",
            "slug": "travel-gifts",
            "description": "Perfect gifts and souvenirs from Singapore",
            "image_url": "https://images.unsplash.com/photo-1711657973130-8affa319e7be",
            "subcategories": ["Souvenirs", "Corporate Gifts", "Travel Essentials"],
            "order": 6,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.categories.insert_many(categories)
    print(f"Created {len(categories)} categories")
    
    # Sample products
    products = []
    for i, cat in enumerate(categories):
        for j in range(6):  # 6 products per category
            product = {
                "id": str(uuid.uuid4()),
                "name": f"{cat['name']} Product {j+1}",
                "slug": f"{cat['slug']}-product-{j+1}",
                "description": f"Premium {cat['name']} product from Singapore",
                "long_description": f"This exquisite {cat['name']} product showcases the best of Singapore's craftsmanship and quality. Perfect for gifting or personal use.",
                "category_id": cat['id'],
                "price": (j+1) * 25.00,
                "sale_price": (j+1) * 20.00 if j % 2 == 0 else None,
                "images": [cat['image_url']],
                "stock": 50 + j * 10,
                "sku": f"SG-{i}{j}{uuid.uuid4().hex[:6].upper()}",
                "tags": ["singapore", "premium", cat['name'].lower()],
                "is_featured": j < 2,
                "is_bestseller": j == 0,
                "rating": 4.5 + (j % 5) * 0.1,
                "review_count": 10 + j * 5,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            products.append(product)
    
    await db.products.insert_many(products)
    print(f"Created {len(products)} products")
    
    # Create a deal
    deal = {
        "id": str(uuid.uuid4()),
        "title": "Singapore Flash Sale",
        "description": "Amazing deals on Singapore-themed products!",
        "product_ids": [p['id'] for p in products[:10]],
        "discount_percentage": 25,
        "banner_image": "https://images.unsplash.com/photo-1760884220893-aaf9c5623360",
        "start_date": datetime.now(timezone.utc).isoformat(),
        "end_date": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.deals.insert_one(deal)
    print("Created 1 deal")
    
    # Create CMS sections for homepage
    cms_sections = [
        {
            "id": str(uuid.uuid4()),
            "page": "homepage",
            "section_key": "hero",
            "content": {
                "title": "SingGifts — Singapore-Made Gifts, Delivered Fast",
                "subtitle": "Curated souvenirs, local treats, and premium corporate gifts inspired by Singapore.",
                "image": "https://images.unsplash.com/photo-1686455746257-0210c23f7064",
                "cta_text": "Shop Bestsellers",
                "cta_link": "/products?bestseller=true"
            },
            "order": 1,
            "is_visible": True,
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "page": "homepage",
            "section_key": "categories",
            "content": {
                "title": "Shop By Category",
                "subtitle": "Discover our curated collections"
            },
            "order": 2,
            "is_visible": True,
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "page": "homepage",
            "section_key": "featured",
            "content": {
                "title": "Featured Products",
                "subtitle": "Handpicked favorites from Singapore"
            },
            "order": 3,
            "is_visible": True,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.cms_sections.insert_many(cms_sections)
    print(f"Created {len(cms_sections)} CMS sections")
    
    # Create admin user
    admin = {
        "id": str(uuid.uuid4()),
        "email": "admin@singgifts.sg",
        "name": "Admin User",
        "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aho7OYeW2iCC",  # password: admin123
        "is_admin": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(admin)
    print("Created admin user (email: admin@singgifts.sg, password: admin123)")
    
    print("\n✅ Database seeded successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())