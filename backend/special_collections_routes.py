from fastapi import APIRouter, HTTPException, Request, Cookie
from typing import Optional, List
from datetime import datetime, timezone
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os
from auth import get_current_admin_user

# Get DB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'singgifts_db')]

special_router = APIRouter()

# ============== LANDMARKS MANAGEMENT ==============

@special_router.get("/api/landmarks")
async def get_landmarks():
    """Get all landmarks (public)"""
    landmarks = await db.landmarks.find({}, {"_id": 0}).to_list(1000)
    return landmarks

@special_router.post("/api/admin/landmarks")
async def create_landmark(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create new landmark (admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    data = await request.json()
    landmark = {
        "id": str(uuid.uuid4()),
        "name": data["name"],
        "slug": data.get("slug", data["name"].lower().replace(" ", "-")),
        "description": data.get("description", ""),
        "image": data.get("image", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.landmarks.insert_one(landmark)
    return {"message": "Landmark created successfully", "landmark": landmark}

@special_router.put("/api/admin/landmarks/{landmark_id}")
async def update_landmark(
    landmark_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update landmark (admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    data = await request.json()
    update_data = {
        "name": data["name"],
        "slug": data.get("slug", data["name"].lower().replace(" ", "-")),
        "description": data.get("description", ""),
        "image": data.get("image", ""),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.landmarks.update_one(
        {"id": landmark_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Landmark not found")
    
    return {"message": "Landmark updated successfully"}

@special_router.delete("/api/admin/landmarks/{landmark_id}")
async def delete_landmark(
    landmark_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete landmark (admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    # Also delete all products associated with this landmark
    await db.explore_singapore_products.delete_many({"landmark_id": landmark_id})
    
    result = await db.landmarks.delete_one({"id": landmark_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Landmark not found")
    
    return {"message": "Landmark and associated products deleted successfully"}

# ============== EXPLORE SINGAPORE PRODUCTS ==============

@special_router.get("/api/explore-singapore-products")
async def get_explore_singapore_products(
    landmark_id: Optional[str] = None
):
    """Get Explore Singapore products (public)"""
    query = {}
    if landmark_id:
        query["landmark_id"] = landmark_id
    
    products = await db.explore_singapore_products.find(query, {"_id": 0}).to_list(1000)
    return products

@special_router.post("/api/admin/explore-singapore-products")
async def create_explore_singapore_product(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create Explore Singapore product (admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    data = await request.json()
    
    product = {
        "id": str(uuid.uuid4()),
        "name": data["name"],
        "slug": data.get("slug", data["name"].lower().replace(" ", "-")),
        "description": data["description"],
        "long_description": data.get("long_description", ""),
        "price": float(data["price"]),
        "sale_price": float(data["sale_price"]) if data.get("sale_price") else None,
        "landmark_id": data["landmark_id"],
        "stock": int(data["stock"]),
        "images": data.get("images", []),
        "sku": data.get("sku", f"ESP-{str(uuid.uuid4())[:8].upper()}"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.explore_singapore_products.insert_one(product)
    return {"message": "Product created successfully", "product": product}

@special_router.put("/api/admin/explore-singapore-products/{product_id}")
async def update_explore_singapore_product(
    product_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update Explore Singapore product (admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    data = await request.json()
    update_data = {
        "name": data["name"],
        "slug": data.get("slug", data["name"].lower().replace(" ", "-")),
        "description": data["description"],
        "long_description": data.get("long_description", ""),
        "price": float(data["price"]),
        "sale_price": float(data["sale_price"]) if data.get("sale_price") else None,
        "landmark_id": data["landmark_id"],
        "stock": int(data["stock"]),
        "images": data.get("images", []),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.explore_singapore_products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product updated successfully"}

@special_router.delete("/api/admin/explore-singapore-products/{product_id}")
async def delete_explore_singapore_product(
    product_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete Explore Singapore product (admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    result = await db.explore_singapore_products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

# ============== BATIK LABEL PRODUCTS ==============

@special_router.get("/api/batik-products")
async def get_batik_products():
    """Get Batik Label products (public)"""
    products = await db.batik_products.find({}, {"_id": 0}).to_list(1000)
    return products

@special_router.post("/api/admin/batik-products")
async def create_batik_product(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create Batik product (admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    data = await request.json()
    
    product = {
        "id": str(uuid.uuid4()),
        "name": data["name"],
        "slug": data.get("slug", data["name"].lower().replace(" ", "-")),
        "description": data["description"],
        "long_description": data.get("long_description", ""),
        "price": float(data["price"]),
        "sale_price": float(data["sale_price"]) if data.get("sale_price") else None,
        "stock": int(data["stock"]),
        "images": data.get("images", []),
        "sku": data.get("sku", f"BTK-{str(uuid.uuid4())[:8].upper()}"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.batik_products.insert_one(product)
    return {"message": "Product created successfully", "product": product}

@special_router.put("/api/admin/batik-products/{product_id}")
async def update_batik_product(
    product_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update Batik product (admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    data = await request.json()
    update_data = {
        "name": data["name"],
        "slug": data.get("slug", data["name"].lower().replace(" ", "-")),
        "description": data["description"],
        "long_description": data.get("long_description", ""),
        "price": float(data["price"]),
        "sale_price": float(data["sale_price"]) if data.get("sale_price") else None,
        "stock": int(data["stock"]),
        "images": data.get("images", []),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.batik_products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product updated successfully"}

@special_router.delete("/api/admin/batik-products/{product_id}")
async def delete_batik_product(
    product_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete Batik product (admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    result = await db.batik_products.delete_one({"id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}
