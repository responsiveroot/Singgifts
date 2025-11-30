"""
Fix all broken images in the database with reliable placeholder images
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'singgifts_db')]

# Use reliable placeholder images
LANDMARK_IMAGES = {
    "merlion-park": "https://picsum.photos/seed/merlion/1200/600",
    "marina-bay-sands": "https://picsum.photos/seed/marinabay/1200/600",
    "gardens-by-the-bay": "https://picsum.photos/seed/gardens/1200/600",
    "chinatown": "https://picsum.photos/seed/chinatown/1200/600",
    "sentosa-island": "https://picsum.photos/seed/sentosa/1200/600"
}

PRODUCT_IMAGE_SEEDS = [
    "keychain", "statue", "postcard", "magnet", "tshirt", 
    "teacup", "towel", "sarong", "scarf", "shirt", 
    "bag", "cushion", "gift", "souvenir", "craft"
]

async def fix_landmark_images():
    """Update landmark images"""
    print("\n🖼️  Fixing Landmark Images...")
    
    for landmark_id, image_url in LANDMARK_IMAGES.items():
        result = await db.landmarks.update_one(
            {"id": landmark_id},
            {"$set": {"image": image_url}}
        )
        if result.modified_count > 0:
            print(f"  ✓ Updated: {landmark_id}")

async def fix_product_images(collection_name, seed_prefix):
    """Update product images in a collection"""
    print(f"\n🖼️  Fixing {collection_name} Images...")
    
    products = await db[collection_name].find({}, {"_id": 0}).to_list(1000)
    
    for idx, product in enumerate(products):
        seed = f"{seed_prefix}{idx % len(PRODUCT_IMAGE_SEEDS)}"
        new_image = f"https://picsum.photos/seed/{seed}/500/500"
        
        result = await db[collection_name].update_one(
            {"id": product["id"]},
            {"$set": {"images": [new_image]}}
        )
        
        if result.modified_count > 0:
            print(f"  ✓ Updated: {product['name']}")

async def main():
    print("="*60)
    print("FIXING ALL IMAGE URLS")
    print("="*60)
    
    try:
        # Fix landmark images
        await fix_landmark_images()
        
        # Fix Explore Singapore product images
        await fix_product_images("explore_singapore_products", "esp")
        
        # Fix Batik product images
        await fix_product_images("batik_products", "batik")
        
        # Fix general product images
        await fix_product_images("products", "product")
        
        print("\n" + "="*60)
        print("✅ All images fixed!")
        print("="*60)
        print("\nNote: Using Picsum Photos (Lorem Picsum)")
        print("- Reliable and fast CDN")
        print("- Consistent image delivery")
        print("- You can replace with real images via admin panel")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
