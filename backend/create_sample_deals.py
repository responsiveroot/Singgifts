"""
Script to create sample deals for products
Run: python create_sample_deals.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta, timezone
import random

# MongoDB connection
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "singgifts"

async def create_sample_deals():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🎯 Creating sample deals...")
    
    # Get all products from all collections
    regular_products = await db.products.find({}).to_list(1000)
    explore_products = await db.explore_singapore_products.find({}).to_list(1000)
    batik_products = await db.batik_label_products.find({}).to_list(1000)
    
    all_products = []
    for p in regular_products:
        p['collection'] = 'products'
        all_products.append(p)
    for p in explore_products:
        p['collection'] = 'explore_singapore_products'
        all_products.append(p)
    for p in batik_products:
        p['collection'] = 'batik_label_products'
        all_products.append(p)
    
    if not all_products:
        print("❌ No products found in any collection. Please add products first.")
        print("   Collections checked: products, explore_singapore_products, batik_label_products")
        return
    
    print(f"📦 Found {len(all_products)} products across all collections")
    print(f"   - Regular: {len(regular_products)}")
    print(f"   - Explore Singapore: {len(explore_products)}")
    print(f"   - Batik Label: {len(batik_products)}\n")
    
    # Select 10 random products for deals
    deal_products = random.sample(all_products, min(10, len(all_products)))
    
    # Define deal types
    deals = [
        {
            "percentage": 20,
            "start_offset_days": 0,
            "end_offset_days": 7,
            "name": "Week Sale"
        },
        {
            "percentage": 30,
            "start_offset_days": 0,
            "end_offset_days": 3,
            "name": "Flash Sale"
        },
        {
            "percentage": 15,
            "start_offset_days": 1,
            "end_offset_days": 14,
            "name": "New Arrival Discount"
        },
        {
            "percentage": 40,
            "start_offset_days": 0,
            "end_offset_days": 2,
            "name": "Weekend Blowout"
        },
        {
            "percentage": 25,
            "start_offset_days": -2,
            "end_offset_days": 5,
            "name": "Mid-Season Sale"
        },
    ]
    
    updated_count = 0
    
    for i, product in enumerate(deal_products):
        deal = deals[i % len(deals)]
        
        start_date = datetime.now(timezone.utc) + timedelta(days=deal["start_offset_days"])
        end_date = datetime.now(timezone.utc) + timedelta(days=deal["end_offset_days"])
        
        await db.products.update_one(
            {"id": product["id"]},
            {
                "$set": {
                    "is_on_deal": True,
                    "deal_percentage": deal["percentage"],
                    "deal_start_date": start_date,
                    "deal_end_date": end_date
                }
            }
        )
        
        updated_count += 1
        print(f"✅ Added {deal['percentage']}% deal to: {product['name']} ({deal['name']})")
        print(f"   📅 {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    
    print(f"\n🎉 Successfully created {updated_count} sample deals!")
    print("\n📊 Deal Summary:")
    print("   - Active deals: Products with current date between start and end dates")
    print("   - Upcoming deals: Products with start date in the future")
    print("   - Expired deals: Products with end date in the past")
    print("\n💡 Visit /admin/deals to manage all deals")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_sample_deals())
