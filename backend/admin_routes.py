from fastapi import APIRouter, HTTPException, Request, Cookie, UploadFile, File
from typing import Optional
from datetime import datetime, timezone
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os
import shutil
from pathlib import Path
from auth import get_current_admin_user

# Get DB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'singgifts_db')]

admin_router = APIRouter(prefix="/admin")

# ============== IMAGE UPLOAD ==============

@admin_router.post("/upload-image")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    session_token: Optional[str] = Cookie(None)
):
    """Upload an image file and return the URL"""
    await get_current_admin_user(request, db, session_token)
    
    # Validate file type
    allowed_extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: jpg, jpeg, png, gif, webp")
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    upload_dir = Path("/app/uploads")
    upload_dir.mkdir(exist_ok=True)
    file_path = upload_dir / unique_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Return the URL path
    backend_url = "https://ecom-refinement.preview.emergentagent.com"
    image_url = f"{backend_url}/uploads/{unique_filename}"
    
    return {"url": image_url, "filename": unique_filename}

# ============== ADMIN DASHBOARD STATS ==============

@admin_router.get("/dashboard/stats")
async def get_dashboard_stats(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get admin dashboard statistics"""
    await get_current_admin_user(request, db, session_token)
    
    total_products = await db.products.count_documents({})
    total_orders = await db.payment_transactions.count_documents({"payment_status": "paid"})
    total_customers = await db.users.count_documents({"is_admin": {"$ne": True}})
    
    # Calculate total revenue
    revenue_pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.payment_transactions.aggregate(revenue_pipeline).to_list(length=1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Get recent orders
    recent_orders = await db.payment_transactions.find(
        {"payment_status": "paid"},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(length=10)
    
    # Get low stock products
    low_stock_products = await db.products.find(
        {"stock": {"$lt": 10}},
        {"_id": 0}
    ).sort("stock", 1).limit(10).to_list(length=10)
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "total_revenue": total_revenue,
        "recent_orders": recent_orders,
        "low_stock_products": low_stock_products
    }

# ============== ADMIN PRODUCT MANAGEMENT ==============

@admin_router.get("/products")
async def get_all_products_admin(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get all products for admin"""
    await get_current_admin_user(request, db, session_token)
    
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"sku": {"$regex": search, "$options": "i"}}
        ]
    if category_id:
        query["category_id"] = category_id
    
    products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(length=limit)
    total = await db.products.count_documents(query)
    
    return {"products": products, "total": total}

@admin_router.post("/products")
async def create_product_admin(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create new product"""
    await get_current_admin_user(request, db, session_token)
    
    product = await request.json()
    
    product_data = {
        "id": str(uuid.uuid4()),
        "name": product["name"],
        "slug": product.get("slug", product["name"].lower().replace(" ", "-")),
        "description": product["description"],
        "long_description": product.get("long_description", ""),
        "price": float(product["price"]),
        "sale_price": float(product.get("sale_price", 0)) if product.get("sale_price") else None,
        "category_id": product["category_id"],
        "images": product.get("images", []),
        "stock": int(product.get("stock", 0)),
        "sku": product.get("sku", f"SG-{str(uuid.uuid4())[:8].upper()}"),
        "tags": product.get("tags", []),
        "rating": 0,
        "review_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.products.insert_one(product_data)
    return {"message": "Product created successfully", "product": product_data}

@admin_router.put("/products/{product_id}")
async def update_product_admin(
    request: Request,
    product_id: str,
    session_token: Optional[str] = Cookie(None)
):
    """Update existing product"""
    await get_current_admin_user(request, db, session_token)
    
    product = await request.json()
    
    existing_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {
        "name": product.get("name", existing_product["name"]),
        "description": product.get("description", existing_product["description"]),
        "long_description": product.get("long_description", existing_product.get("long_description", "")),
        "price": float(product.get("price", existing_product["price"])),
        "sale_price": float(product["sale_price"]) if product.get("sale_price") else None,
        "category_id": product.get("category_id", existing_product["category_id"]),
        "images": product.get("images", existing_product["images"]),
        "stock": int(product.get("stock", existing_product["stock"])),
        "tags": product.get("tags", existing_product.get("tags", [])),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    return {"message": "Product updated successfully"}

@admin_router.delete("/products/{product_id}")
async def delete_product_admin(
    request: Request,
    product_id: str,
    session_token: Optional[str] = Cookie(None)
):
    """Delete product"""
    await get_current_admin_user(request, db, session_token)
    
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

# ============== ADMIN ORDER MANAGEMENT ==============

@admin_router.get("/orders")
async def get_all_orders_admin(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get all orders for admin"""
    await get_current_admin_user(request, db, session_token)
    
    query = {}
    if status:
        query["status"] = status
    
    orders = await db.payment_transactions.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    total = await db.payment_transactions.count_documents(query)
    
    return {"orders": orders, "total": total}

@admin_router.get("/orders/{order_id}")
async def get_order_details_admin(
    request: Request,
    order_id: str,
    session_token: Optional[str] = Cookie(None)
):
    """Get order details"""
    await get_current_admin_user(request, db, session_token)
    
    order = await db.payment_transactions.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order

@admin_router.put("/orders/{order_id}/status")
async def update_order_status_admin(
    request: Request,
    order_id: str,
    session_token: Optional[str] = Cookie(None)
):
    """Update order status"""
    await get_current_admin_user(request, db, session_token)
    
    data = await request.json()
    status = data.get("status")
    
    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status")
    
    result = await db.payment_transactions.update_one(
        {"id": order_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated successfully"}

# ============== ADMIN CATEGORY MANAGEMENT ==============

@admin_router.get("/categories")
async def get_all_categories_admin(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all categories for admin"""
    await get_current_admin_user(request, db, session_token)
    
    categories = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(length=100)
    
    # Add product count for each category
    for category in categories:
        product_count = await db.products.count_documents({"category_id": category["id"]})
        category["product_count"] = product_count
    
    return {"categories": categories}

@admin_router.post("/categories")
async def create_category_admin(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create new category"""
    await get_current_admin_user(request, db, session_token)
    
    category = await request.json()
    
    category_data = {
        "id": str(uuid.uuid4()),
        "name": category["name"],
        "slug": category.get("slug", category["name"].lower().replace(" ", "-")),
        "description": category.get("description", ""),
        "image_url": category.get("image_url", ""),
        "subcategories": category.get("subcategories", []),
        "order": category.get("order", 100),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.categories.insert_one(category_data)
    return {"message": "Category created successfully", "category": category_data}

@admin_router.put("/categories/{category_id}")
async def update_category_admin(
    request: Request,
    category_id: str,
    session_token: Optional[str] = Cookie(None)
):
    """Update existing category"""
    await get_current_admin_user(request, db, session_token)
    
    category = await request.json()
    
    existing_category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not existing_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = {
        "name": category.get("name", existing_category["name"]),
        "description": category.get("description", existing_category.get("description", "")),
        "image_url": category.get("image_url", existing_category.get("image_url", "")),
        "subcategories": category.get("subcategories", existing_category.get("subcategories", [])),
        "order": category.get("order", existing_category.get("order", 100)),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.categories.update_one({"id": category_id}, {"$set": update_data})
    return {"message": "Category updated successfully"}

@admin_router.delete("/categories/{category_id}")
async def delete_category_admin(
    request: Request,
    category_id: str,
    session_token: Optional[str] = Cookie(None)
):
    """Delete category"""
    await get_current_admin_user(request, db, session_token)
    
    # Check if category has products
    product_count = await db.products.count_documents({"category_id": category_id})
    if product_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete category with {product_count} products"
        )
    
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}

# ============== ADMIN CUSTOMER MANAGEMENT ==============

@admin_router.get("/customers")
async def get_all_customers_admin(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get all customers for admin"""
    await get_current_admin_user(request, db, session_token)
    
    query = {"is_admin": {"$ne": True}}
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}}
        ]
    
    customers = await db.users.find(query, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(length=limit)
    total = await db.users.count_documents(query)
    
    # Add order count for each customer
    for customer in customers:
        order_count = await db.payment_transactions.count_documents({"user_id": customer["id"], "payment_status": "paid"})
        customer["order_count"] = order_count
    
    return {"customers": customers, "total": total}

@admin_router.get("/customers/{customer_id}/orders")
async def get_customer_orders_admin(
    request: Request,
    customer_id: str,
    session_token: Optional[str] = Cookie(None)
):
    """Get customer order history"""
    await get_current_admin_user(request, db, session_token)
    
    orders = await db.payment_transactions.find(
        {"user_id": customer_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=100)
    
    return {"orders": orders}

# ============== ADMIN COUPON MANAGEMENT ==============

@admin_router.get("/coupons")
async def get_all_coupons_admin(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all coupons for admin"""
    await get_current_admin_user(request, db, session_token)
    
    coupons = await db.coupons.find({}, {"_id": 0}).sort("created_at", -1).to_list(length=100)
    return {"coupons": coupons}

@admin_router.post("/coupons")
async def create_coupon_admin(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create new coupon"""
    await get_current_admin_user(request, db, session_token)
    
    coupon = await request.json()
    
    # Check if code already exists
    existing_coupon = await db.coupons.find_one({"code": coupon["code"].upper()})
    if existing_coupon:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    
    coupon_data = {
        "id": str(uuid.uuid4()),
        "code": coupon["code"].upper(),
        "discount_type": coupon["discount_type"],
        "discount_value": float(coupon["discount_value"]),
        "min_purchase": float(coupon.get("min_purchase", 0)),
        "active": coupon.get("active", True),
        "expires_at": coupon.get("expires_at"),
        "description": coupon.get("description", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.coupons.insert_one(coupon_data)
    return {"message": "Coupon created successfully", "coupon": coupon_data}

@admin_router.put("/coupons/{coupon_id}")
async def update_coupon_admin(
    request: Request,
    coupon_id: str,
    session_token: Optional[str] = Cookie(None)
):
    """Update existing coupon"""
    await get_current_admin_user(request, db, session_token)
    
    coupon = await request.json()
    
    existing_coupon = await db.coupons.find_one({"id": coupon_id}, {"_id": 0})
    if not existing_coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    update_data = {
        "discount_type": coupon.get("discount_type", existing_coupon["discount_type"]),
        "discount_value": float(coupon.get("discount_value", existing_coupon["discount_value"])),
        "min_purchase": float(coupon.get("min_purchase", existing_coupon.get("min_purchase", 0))),
        "active": coupon.get("active", existing_coupon.get("active", True)),
        "expires_at": coupon.get("expires_at", existing_coupon.get("expires_at")),
        "description": coupon.get("description", existing_coupon.get("description", "")),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.coupons.update_one({"id": coupon_id}, {"$set": update_data})
    return {"message": "Coupon updated successfully"}

@admin_router.delete("/coupons/{coupon_id}")
async def delete_coupon_admin(
    request: Request,
    coupon_id: str,
    session_token: Optional[str] = Cookie(None)
):
    """Delete coupon"""
    await get_current_admin_user(request, db, session_token)
    
    result = await db.coupons.delete_one({"id": coupon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    return {"message": "Coupon deleted successfully"}

@admin_router.put("/coupons/{coupon_id}/toggle")
async def toggle_coupon_status_admin(
    request: Request,
    coupon_id: str,
    session_token: Optional[str] = Cookie(None)
):
    """Toggle coupon active status"""
    await get_current_admin_user(request, db, session_token)
    
    coupon = await db.coupons.find_one({"id": coupon_id}, {"_id": 0})
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    new_status = not coupon.get("active", True)
    await db.coupons.update_one(
        {"id": coupon_id},
        {"$set": {"active": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": f"Coupon {'activated' if new_status else 'deactivated'} successfully", "active": new_status}
