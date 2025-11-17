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
    
    # Categories with Singapore-themed images (20 categories)
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
            "name": "Batik",
            "slug": "batik",
            "description": "Traditional handcrafted Batik fabrics and accessories",
            "image_url": "https://images.unsplash.com/photo-1610706502858-6a0989239446",
            "subcategories": ["Fabrics", "Clothing", "Accessories"],
            "order": 2,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Beauty",
            "slug": "beauty",
            "description": "Premium beauty and skincare products",
            "image_url": "https://images.unsplash.com/photo-1624167479379-938f4b1c5b45",
            "subcategories": ["Skincare", "Fragrance", "Makeup"],
            "order": 3,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Chocolates",
            "slug": "chocolates",
            "description": "Artisan chocolates and confectionery",
            "image_url": "https://images.unsplash.com/photo-1511381939415-e44015466834",
            "subcategories": ["Dark Chocolate", "Milk Chocolate", "Gift Sets"],
            "order": 4,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Coffee",
            "slug": "coffee",
            "description": "Premium Singapore coffee blends",
            "image_url": "https://images.unsplash.com/photo-1447933601403-0c6688de566e",
            "subcategories": ["Beans", "Ground Coffee", "Instant Coffee"],
            "order": 5,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Electronics",
            "slug": "electronics",
            "description": "Latest tech and gadgets",
            "image_url": "https://images.unsplash.com/photo-1686455746127-02762fade30c",
            "subcategories": ["Smartphones", "Audio", "Wearables"],
            "order": 6,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fashion",
            "slug": "fashion",
            "description": "Stylish clothing and accessories",
            "image_url": "https://images.unsplash.com/photo-1749843988896-bcc365717569",
            "subcategories": ["Clothing", "Bags", "Jewelry", "Watches"],
            "order": 7,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Food",
            "slug": "food",
            "description": "Singapore's finest food and treats",
            "image_url": "https://images.unsplash.com/photo-1734304185641-b6b8eb588603",
            "subcategories": ["Snacks", "Baked Goods", "Beverages"],
            "order": 8,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Home Decor",
            "slug": "home-decor",
            "description": "Elegant home decoration and furnishings",
            "image_url": "https://images.unsplash.com/photo-1556912998-c57cc6b63cd7",
            "subcategories": ["Wall Art", "Vases", "Candles"],
            "order": 9,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Jewelry",
            "slug": "jewelry",
            "description": "Exquisite jewelry and accessories",
            "image_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
            "subcategories": ["Necklaces", "Bracelets", "Earrings"],
            "order": 10,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Kitchenware",
            "slug": "kitchenware",
            "description": "Premium kitchen tools and cookware",
            "image_url": "https://images.unsplash.com/photo-1565183928294-7d22f24ff511",
            "subcategories": ["Cookware", "Utensils", "Storage"],
            "order": 11,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Liquor",
            "slug": "liquor",
            "description": "Fine wines and premium spirits",
            "image_url": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
            "subcategories": ["Wine", "Whiskey", "Spirits"],
            "order": 12,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Peranakan",
            "slug": "peranakan",
            "description": "Traditional Peranakan heritage items",
            "image_url": "https://images.unsplash.com/photo-1582735689369-4fe89db7114c",
            "subcategories": ["Ceramics", "Textiles", "Jewelry"],
            "order": 13,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Perfumes",
            "slug": "perfumes",
            "description": "Luxury fragrances and colognes",
            "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683601",
            "subcategories": ["Men's", "Women's", "Unisex"],
            "order": 14,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Skincare",
            "slug": "skincare",
            "description": "Premium skincare and wellness products",
            "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571",
            "subcategories": ["Face Care", "Body Care", "Treatments"],
            "order": 15,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Soap",
            "slug": "soap",
            "description": "Handmade artisan soaps and bath products",
            "image_url": "https://images.unsplash.com/photo-1600857062241-98e5e6fe4aff",
            "subcategories": ["Bar Soap", "Liquid Soap", "Gift Sets"],
            "order": 16,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Tea",
            "slug": "tea",
            "description": "Premium tea blends and accessories",
            "image_url": "https://images.unsplash.com/photo-1563822249366-3a0cd3be3303",
            "subcategories": ["Green Tea", "Black Tea", "Herbal Tea"],
            "order": 17,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Travel & Gifts",
            "slug": "travel-gifts",
            "description": "Perfect gifts and souvenirs from Singapore",
            "image_url": "https://images.unsplash.com/photo-1711657973130-8affa319e7be",
            "subcategories": ["Souvenirs", "Corporate Gifts", "Travel Essentials"],
            "order": 18,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Wedgwood Fine Bone China",
            "slug": "wedgwood-fine-bone-china",
            "description": "Exquisite fine bone china tableware",
            "image_url": "https://images.unsplash.com/photo-1610701596007-11502861dcfa",
            "subcategories": ["Dinnerware", "Tea Sets", "Collectibles"],
            "order": 19,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Wax Bar",
            "slug": "wax-bar",
            "description": "Scented wax melts and candles",
            "image_url": "https://images.unsplash.com/photo-1602874801006-e24b83a8c195",
            "subcategories": ["Wax Melts", "Candles", "Diffusers"],
            "order": 20,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.categories.insert_many(categories)
    print(f"Created {len(categories)} categories")
    
    # Sample products with diverse images per category (with proper Unsplash parameters)
    category_product_images = {
        "airline-exclusives": [
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400&h=400&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=400&fit=crop&auto=format&q=80"
        ],
        "batik": [
            "https://images.unsplash.com/photo-1610706502858-6a0989239446?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop"
        ],
        "beauty": [
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop"
        ],
        "chocolates": [
            "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop&auto=format&q=80",
            "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop&auto=format&q=80"
        ],
        "coffee": [
            "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop"
        ],
        "electronics": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop"
        ],
        "fashion": [
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=400&fit=crop"
        ],
        "food": [
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=400&fit=crop"
        ],
        "home-decor": [
            "https://images.unsplash.com/photo-1556912998-c57cc6b63cd7?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1556912998-c57cc6b63cd7?w=400&h=400&fit=crop&auto=format&q=80"
        ],
        "jewelry": [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f",
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15",
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a",
            "https://images.unsplash.com/photo-1573408301185-9146fe634ad0",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908"
        ],
        "kitchenware": [
            "https://images.unsplash.com/photo-1565183928294-7d22f24ff511",
            "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1",
            "https://images.unsplash.com/photo-1556909212-d5b604d0c90d",
            "https://images.unsplash.com/photo-1588854337221-4cf9fa96b75e",
            "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c",
            "https://images.unsplash.com/photo-1584990347449-39b4aa8d6f96"
        ],
        "liquor": [
            "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
            "https://images.unsplash.com/photo-1569529465841-dfecdab7503b",
            "https://images.unsplash.com/photo-1556679343-c7306c1976bc",
            "https://images.unsplash.com/photo-1560963689-b5b4e8d8b7c0",
            "https://images.unsplash.com/photo-1470337458703-46ad1756a187",
            "https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6"
        ],
        "peranakan": [
            "https://images.unsplash.com/photo-1582735689369-4fe89db7114c",
            "https://images.unsplash.com/photo-1610701596007-11502861dcfa",
            "https://images.unsplash.com/photo-1578916171728-46686eac8d58",
            "https://images.unsplash.com/photo-1586105251261-72a756497a11",
            "https://images.unsplash.com/photo-1556911261-6bd341186b2f",
            "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2"
        ],
        "perfumes": [
            "https://images.unsplash.com/photo-1541643600914-78b084683601",
            "https://images.unsplash.com/photo-1588405748880-12d1d2a59bd0",
            "https://images.unsplash.com/photo-1594035910387-fea47794261f",
            "https://images.unsplash.com/photo-1615634260167-c8cdede054de",
            "https://images.unsplash.com/photo-1587017539504-67cfbddac569",
            "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539"
        ],
        "skincare": [
            "https://images.unsplash.com/photo-1556228578-0d85b1a4d571",
            "https://images.unsplash.com/photo-1570554886111-e80fcca6a029",
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908",
            "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b",
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
            "https://images.unsplash.com/photo-1612817288484-6f916006741a"
        ],
        "soap": [
            "https://images.unsplash.com/photo-1600857062241-98e5e6fe4aff",
            "https://images.unsplash.com/photo-1617897903246-719242758050",
            "https://images.unsplash.com/photo-1631730486572-226d1f595b68",
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108",
            "https://images.unsplash.com/photo-1621606094126-9fb7a86be8cf",
            "https://images.unsplash.com/photo-1607422285427-c97308ce48f9"
        ],
        "tea": [
            "https://images.unsplash.com/photo-1563822249366-3a0cd3be3303",
            "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9",
            "https://images.unsplash.com/photo-1597318130878-11e285564fc2",
            "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256",
            "https://images.unsplash.com/photo-1556679343-c7306c1976bc",
            "https://images.unsplash.com/photo-1544787219-7f47ccb76574"
        ],
        "travel-gifts": [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e",
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
            "https://images.unsplash.com/photo-1503220317375-aaad61436b1b",
            "https://images.unsplash.com/photo-1533105079780-92b9be482077"
        ],
        "wedgwood-fine-bone-china": [
            "https://images.unsplash.com/photo-1610701596007-11502861dcfa",
            "https://images.unsplash.com/photo-1578916171728-46686eac8d58",
            "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2",
            "https://images.unsplash.com/photo-1610701595389-c2bbbf1c99e8",
            "https://images.unsplash.com/photo-1523362628745-0c100150b504",
            "https://images.unsplash.com/photo-1610701595391-1b56f81cd829"
        ],
        "wax-bar": [
            "https://images.unsplash.com/photo-1602874801006-e24b83a8c195",
            "https://images.unsplash.com/photo-1509390144185-a342e4f7d2e1",
            "https://images.unsplash.com/photo-1603006905003-be475563bc59",
            "https://images.unsplash.com/photo-1602874801018-b3e5a1c4360e",
            "https://images.unsplash.com/photo-1587467512961-120760940e4e",
            "https://images.unsplash.com/photo-1602874801007-e574ff9af2e1"
        ]
    }
    
    products = []
    for i, cat in enumerate(categories):
        # Get product images for this category
        product_images = category_product_images.get(cat['slug'], [cat['image_url']] * 6)
        
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
                "images": [product_images[j % len(product_images)]],
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