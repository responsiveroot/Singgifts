"""
Data Migration Script: Separate Product Collections
This script moves products from the general products collection to:
- explore_singapore_products (products with location field)
- batik_products (products with is_batik_label=True)
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'singgifts_db')]

async def create_landmarks():
    """Create default landmarks from existing location data"""
    print("\n=== Creating Landmarks ===")
    
    # Get unique locations from products
    products = await db.products.find({"location": {"$exists": True, "$ne": None, "$ne": ""}}, {"_id": 0}).to_list(1000)
    locations = list(set(p.get("location") for p in products if p.get("location")))
    
    print(f"Found {len(locations)} unique locations: {locations}")
    
    # Create landmarks for each location
    landmark_map = {}
    for location in locations:
        # Check if landmark already exists
        existing = await db.landmarks.find_one({"name": location}, {"_id": 0})
        if existing:
            landmark_map[location] = existing["id"]
            print(f"  ✓ Landmark '{location}' already exists")
            continue
        
        landmark = {
            "id": f"landmark-{location.lower().replace(' ', '-')}",
            "name": location,
            "slug": location.lower().replace(" ", "-"),
            "description": f"Explore products from {location}",
            "image": "",
            "created_at": "2025-11-30T00:00:00+00:00",
            "updated_at": "2025-11-30T00:00:00+00:00"
        }
        
        await db.landmarks.insert_one(landmark)
        landmark_map[location] = landmark["id"]
        print(f"  + Created landmark: {location}")
    
    return landmark_map

async def migrate_explore_singapore_products(landmark_map):
    """Move products with location to explore_singapore_products"""
    print("\n=== Migrating Explore Singapore Products ===")
    
    products = await db.products.find(
        {"location": {"$exists": True, "$ne": None, "$ne": ""}},
        {"_id": 0}
    ).to_list(1000)
    
    print(f"Found {len(products)} products with locations")
    
    migrated = 0
    for product in products:
        location = product.get("location")
        landmark_id = landmark_map.get(location)
        
        if not landmark_id:
            print(f"  ! Warning: No landmark found for location '{location}'")
            continue
        
        # Check if already migrated
        existing = await db.explore_singapore_products.find_one({"id": product["id"]})
        if existing:
            print(f"  ✓ Product '{product['name']}' already in explore_singapore_products")
            continue
        
        # Create new explore singapore product
        esp_product = {
            **product,
            "landmark_id": landmark_id
        }
        
        # Remove fields not needed
        esp_product.pop("location", None)
        esp_product.pop("category_id", None)
        esp_product.pop("is_on_deal", None)
        esp_product.pop("is_batik_label", None)
        esp_product.pop("deal_percentage", None)
        
        # Update SKU prefix
        if product.get("sku"):
            esp_product["sku"] = product["sku"].replace("SG-", "ESP-")
        
        await db.explore_singapore_products.insert_one(esp_product)
        migrated += 1
        print(f"  + Migrated: {product['name']} → {location}")
    
    # Delete migrated products from general products
    if migrated > 0:
        result = await db.products.delete_many({"location": {"$exists": True, "$ne": None, "$ne": ""}})
        print(f"  ✓ Removed {result.deleted_count} products from general products collection")
    
    print(f"\n✅ Migrated {migrated} Explore Singapore products")

async def migrate_batik_products():
    """Move products with is_batik_label to batik_products"""
    print("\n=== Migrating Batik Label Products ===")
    
    products = await db.products.find(
        {"is_batik_label": True},
        {"_id": 0}
    ).to_list(1000)
    
    print(f"Found {len(products)} Batik Label products")
    
    migrated = 0
    for product in products:
        # Check if already migrated
        existing = await db.batik_products.find_one({"id": product["id"]})
        if existing:
            print(f"  ✓ Product '{product['name']}' already in batik_products")
            continue
        
        # Create new batik product
        batik_product = {**product}
        
        # Remove fields not needed
        batik_product.pop("location", None)
        batik_product.pop("category_id", None)
        batik_product.pop("is_on_deal", None)
        batik_product.pop("is_batik_label", None)
        batik_product.pop("deal_percentage", None)
        
        # Update SKU prefix
        if product.get("sku"):
            batik_product["sku"] = product["sku"].replace("SG-", "BTK-")
        
        await db.batik_products.insert_one(batik_product)
        migrated += 1
        print(f"  + Migrated: {product['name']}")
    
    # Delete migrated products from general products
    if migrated > 0:
        result = await db.products.delete_many({"is_batik_label": True})
        print(f"  ✓ Removed {result.deleted_count} products from general products collection")
    
    print(f"\n✅ Migrated {migrated} Batik Label products")

async def clean_general_products():
    """Remove unnecessary fields from general products"""
    print("\n=== Cleaning General Products ===")
    
    # Remove location, is_batik_label fields from remaining products
    result = await db.products.update_many(
        {},
        {"$unset": {"location": "", "is_batik_label": ""}}
    )
    
    print(f"✓ Cleaned {result.modified_count} general products")

async def print_summary():
    """Print summary of collections"""
    print("\n" + "="*60)
    print("MIGRATION SUMMARY")
    print("="*60)
    
    general_count = await db.products.count_documents({})
    landmarks_count = await db.landmarks.count_documents({})
    esp_count = await db.explore_singapore_products.count_documents({})
    batik_count = await db.batik_products.count_documents({})
    
    print(f"\n📦 General Products: {general_count}")
    print(f"🗺️  Landmarks: {landmarks_count}")
    print(f"🌏 Explore Singapore Products: {esp_count}")
    print(f"🎨 Batik Label Products: {batik_count}")
    print("\n✅ Migration Complete!")

async def main():
    """Run migration"""
    print("="*60)
    print("PRODUCT COLLECTIONS MIGRATION")
    print("="*60)
    
    try:
        # Step 1: Create landmarks
        landmark_map = await create_landmarks()
        
        # Step 2: Migrate Explore Singapore products
        await migrate_explore_singapore_products(landmark_map)
        
        # Step 3: Migrate Batik products
        await migrate_batik_products()
        
        # Step 4: Clean general products
        await clean_general_products()
        
        # Step 5: Print summary
        await print_summary()
        
    except Exception as e:
        print(f"\n❌ Error during migration: {str(e)}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
