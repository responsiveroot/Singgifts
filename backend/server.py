from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from email_utils import send_order_confirmation_email, send_welcome_email

from models import *
from auth import get_current_user, get_current_user_optional, get_current_admin_user, get_password_hash, verify_password, create_access_token
from utils import slugify, generate_sku, generate_otp
from admin_routes import admin_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# LLM API Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== AUTHENTICATION ROUTES ==============

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class VerifyOtpRequest(BaseModel):
    email: str
    otp: str

@api_router.post("/auth/register")
async def register(register_data: RegisterRequest):
    """Register new user with email/password"""
    existing_user = await db.users.find_one({"email": register_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    otp = generate_otp()
    await db.otps.insert_one({
        "email": register_data.email,
        "otp": otp,
        "password_hash": get_password_hash(register_data.password),
        "name": register_data.name,
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "OTP sent to email", "otp": otp}

@api_router.post("/auth/verify-otp")
async def verify_otp(otp_data: VerifyOtpRequest, response: Response):
    """Verify OTP and create user"""
    otp_doc = await db.otps.find_one({"email": otp_data.email, "otp": otp_data.otp})
    if not otp_doc:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    expires_at = datetime.fromisoformat(otp_doc['expires_at'])
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")
    
    user = User(
        email=otp_data.email,
        name=otp_doc['name'],
        password_hash=otp_doc['password_hash']
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    session_token = create_access_token({"sub": user.id})
    session = UserSession(
        user_id=user.id,
        session_token=session_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    
    session_dict = session.model_dump()
    session_dict['created_at'] = session_dict['created_at'].isoformat()
    session_dict['expires_at'] = session_dict['expires_at'].isoformat()
    await db.user_sessions.insert_one(session_dict)
    
    await db.otps.delete_one({"email": otp_data.email})
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60
    )
    
    return {"message": "Registration successful", "session_token": session_token, "user": user}

@api_router.post("/auth/login")
async def login(login_data: LoginRequest, response: Response):
    """Login with email/password"""
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not user.get('password_hash'):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(login_data.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    otp = generate_otp()
    await db.login_otps.insert_one({
        "email": login_data.email,
        "otp": otp,
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "OTP sent to email", "otp": otp}

@api_router.post("/auth/admin-login")
async def admin_login(login_data: LoginRequest, response: Response):
    """Direct admin login without OTP"""
    print(f"DEBUG: Admin login attempt for: {login_data.email}")
    
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    
    if not user:
        print(f"DEBUG: User not found: {login_data.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    print(f"DEBUG: User found, is_admin: {user.get('is_admin')}")
    
    if not user.get('is_admin', False):
        print(f"DEBUG: User is not admin")
        raise HTTPException(status_code=403, detail="Admin access required")
    
    print(f"DEBUG: Testing password verification...")
    password_valid = verify_password(login_data.password, user['password_hash'])
    print(f"DEBUG: Password valid: {password_valid}")
    
    if not password_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create session directly
    session_token = create_access_token({"sub": user['id']})
    session = UserSession(
        user_id=user['id'],
        session_token=session_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    
    session_dict = session.model_dump()
    session_dict['created_at'] = session_dict['created_at'].isoformat()
    session_dict['expires_at'] = session_dict['expires_at'].isoformat()
    await db.user_sessions.insert_one(session_dict)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=604800
    )
    
    return {"message": "Login successful", "session_token": session_token, "user": user}

@api_router.post("/auth/verify-login-otp")
async def verify_login_otp(otp_data: VerifyOtpRequest, response: Response):
    """Verify login OTP and create session"""
    otp_doc = await db.login_otps.find_one({"email": otp_data.email, "otp": otp_data.otp})
    if not otp_doc:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    expires_at = datetime.fromisoformat(otp_doc['expires_at'])
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")
    
    user = await db.users.find_one({"email": otp_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    session_token = create_access_token({"sub": user['id']})
    session = UserSession(
        user_id=user['id'],
        session_token=session_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    
    session_dict = session.model_dump()
    session_dict['created_at'] = session_dict['created_at'].isoformat()
    session_dict['expires_at'] = session_dict['expires_at'].isoformat()
    await db.user_sessions.insert_one(session_dict)
    
    await db.login_otps.delete_one({"email": otp_data.email})
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60
    )
    
    return {"message": "Login successful", "session_token": session_token, "user": user}

@api_router.get("/auth/session-data")
async def get_session_data(request: Request):
    """Process Emergent Auth session_id"""
    session_id = request.headers.get('X-Session-ID')
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    import aiohttp
    async with aiohttp.ClientSession() as session:
        async with session.get(
            'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
            headers={'X-Session-ID': session_id}
        ) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            data = await resp.json()
    
    user = await db.users.find_one({"email": data['email']}, {"_id": 0})
    if not user:
        user = User(
            email=data['email'],
            name=data['name'],
            picture=data['picture']
        )
        user_dict = user.model_dump()
        user_dict['created_at'] = user_dict['created_at'].isoformat()
        await db.users.insert_one(user_dict)
    else:
        user = User(**user)
    
    session = UserSession(
        user_id=user.id,
        session_token=data['session_token'],
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    
    session_dict = session.model_dump()
    session_dict['created_at'] = session_dict['created_at'].isoformat()
    session_dict['expires_at'] = session_dict['expires_at'].isoformat()
    await db.user_sessions.insert_one(session_dict)
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "session_token": data['session_token']
    }

@api_router.get("/auth/me")
async def get_me(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current user"""
    user = await get_current_user(request, db, session_token)
    return user

@api_router.put("/users/profile")
async def update_user_profile(request: Request, session_token: Optional[str] = Cookie(None)):
    """Update user profile"""
    user = await get_current_user(request, db, session_token)
    data = await request.json()
    
    # Update only name (email cannot be changed)
    await db.users.update_one(
        {"id": user['id']},
        {"$set": {"name": data.get('name', user['name'])}}
    )
    
    updated_user = await db.users.find_one({"id": user['id']}, {"_id": 0})
    return updated_user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout user"""
    token = session_token or request.headers.get('Authorization', '').replace('Bearer ', '')
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token")
    return {"message": "Logged out successfully"}

# ============== CATEGORY ROUTES ==============

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    """Get all categories"""
    categories = await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return categories

@api_router.get("/categories/{category_id}", response_model=Category)
async def get_category(category_id: str):
    """Get single category"""
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@api_router.post("/categories", response_model=Category)
async def create_category(category_data: CategoryCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    """Create new category (Admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    category = Category(
        name=category_data.name,
        slug=slugify(category_data.name),
        description=category_data.description,
        image_url=category_data.image_url,
        subcategories=category_data.subcategories
    )
    
    category_dict = category.model_dump()
    category_dict['created_at'] = category_dict['created_at'].isoformat()
    await db.categories.insert_one(category_dict)
    
    return category

# ============== PRODUCT ROUTES ==============

@api_router.get("/products/new-arrivals")
async def get_new_arrivals(limit: int = 24):
    """Get new arrivals (products from last 30 days)"""
    # Calculate date 30 days ago
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    # Find products created in last 30 days
    products = await db.products.find(
        {"created_at": {"$gte": thirty_days_ago.isoformat()}},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    return products

@api_router.get("/products/by-location/{location}")
async def get_products_by_location(location: str, limit: int = 50):
    """Get products by Singapore landmark location"""
    products = await db.products.find(
        {"location": location},
        {"_id": 0}
    ).limit(limit).to_list(length=limit)
    
    return products

@api_router.get("/products", response_model=List[Product])
async def get_products(
    limit: int = 100, 
    search: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None,
    category_id: Optional[str] = None,
    is_featured: Optional[bool] = None,
    is_bestseller: Optional[bool] = None,
    skip: int = 0
):
    """Get products with advanced filters and sorting"""
    # Build query
    query = {}
    
    # Search filter
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    # Category filter (support both 'category' and 'category_id' for backward compatibility)
    if category:
        query["category_id"] = category
    elif category_id:
        query["category_id"] = category_id
    
    # Legacy filters
    if is_featured is not None:
        query["is_featured"] = is_featured
    if is_bestseller is not None:
        query["is_bestseller"] = is_bestseller
    
    # Price range filter
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["price"] = price_query
    
    # Sorting
    sort_order = []
    if sort_by == "price_asc":
        sort_order = [("price", 1)]
    elif sort_by == "price_desc":
        sort_order = [("price", -1)]
    elif sort_by == "newest":
        sort_order = [("created_at", -1)]
    elif sort_by == "popular":
        sort_order = [("review_count", -1)]
    elif sort_by == "rating":
        sort_order = [("rating", -1)]
    
    # Execute query
    if sort_order:
        products = await db.products.find(query, {"_id": 0}).sort(sort_order).skip(skip).limit(limit).to_list(length=None)
    else:
        products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(length=None)
    
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get single product"""
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    """Create new product (Admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    product = Product(
        name=product_data.name,
        slug=slugify(product_data.name),
        description=product_data.description,
        long_description=product_data.long_description,
        category_id=product_data.category_id,
        subcategory=product_data.subcategory,
        price=product_data.price,
        sale_price=product_data.sale_price,
        images=product_data.images,
        stock=product_data.stock,
        sku=generate_sku(),
        tags=product_data.tags
    )
    
    product_dict = product.model_dump()
    product_dict['created_at'] = product_dict['created_at'].isoformat()
    await db.products.insert_one(product_dict)
    
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    """Update product (Admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_data.model_dump()
    update_data['slug'] = slugify(product_data.name)
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated_product

# ============== CART ROUTES ==============

@api_router.get("/cart", response_model=List[dict])
async def get_cart(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user's cart"""
    user = await get_current_user(request, db, session_token)
    
    cart_items = await db.cart_items.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    
    result = []
    for item in cart_items:
        product = await db.products.find_one({"id": item['product_id']}, {"_id": 0})
        if product:
            result.append({
                "cart_item": item,
                "product": product
            })
    
    return result

@api_router.post("/cart")
async def add_to_cart(cart_data: CartItemCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    """Add item to cart"""
    user = await get_current_user(request, db, session_token)
    
    existing = await db.cart_items.find_one({
        "user_id": user['id'],
        "product_id": cart_data.product_id
    })
    
    if existing:
        new_quantity = existing['quantity'] + cart_data.quantity
        await db.cart_items.update_one(
            {"id": existing['id']},
            {"$set": {"quantity": new_quantity}}
        )
        return {"message": "Cart updated"}
    else:
        cart_item = CartItem(
            user_id=user['id'],
            product_id=cart_data.product_id,
            quantity=cart_data.quantity
        )
        
        cart_dict = cart_item.model_dump()
        cart_dict['created_at'] = cart_dict['created_at'].isoformat()
        await db.cart_items.insert_one(cart_dict)
        
        return {"message": "Added to cart"}

@api_router.delete("/cart/{cart_item_id}")
async def remove_from_cart(cart_item_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    """Remove item from cart"""
    user = await get_current_user(request, db, session_token)
    
    result = await db.cart_items.delete_one({"id": cart_item_id, "user_id": user['id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    return {"message": "Removed from cart"}

# ============== ORDER ROUTES ==============

@api_router.get("/orders", response_model=List[Order])
async def get_orders(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user's orders"""
    user = await get_current_user(request, db, session_token)
    orders = await db.orders.find({"user_id": user['id']}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    """Create new order"""
    user = await get_current_user(request, db, session_token)
    
    order = Order(
        user_id=user['id'],
        items=order_data.items,
        total_amount=order_data.total_amount,
        shipping_address=order_data.shipping_address,
        payment_method=order_data.payment_method
    )
    
    order_dict = order.model_dump()
    order_dict['created_at'] = order_dict['created_at'].isoformat()
    order_dict['updated_at'] = order_dict['updated_at'].isoformat()
    await db.orders.insert_one(order_dict)
    
    await db.cart_items.delete_many({"user_id": user['id']})
    
    return order

# ============== REVIEW ROUTES ==============

@api_router.get("/reviews/{product_id}", response_model=List[Review])
async def get_product_reviews(product_id: str):
    """Get product reviews"""
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reviews

@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    """Create product review"""
    user = await get_current_user(request, db, session_token)
    
    review = Review(
        product_id=review_data.product_id,
        user_id=user['id'],
        user_name=user['name'],
        rating=review_data.rating,
        comment=review_data.comment
    )
    
    review_dict = review.model_dump()
    review_dict['created_at'] = review_dict['created_at'].isoformat()
    await db.reviews.insert_one(review_dict)
    
    reviews = await db.reviews.find({"product_id": review_data.product_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r['rating'] for r in reviews) / len(reviews)
    await db.products.update_one(
        {"id": review_data.product_id},
        {"$set": {"rating": avg_rating, "review_count": len(reviews)}}
    )
    
    return review

# ============== DEAL ROUTES ==============

@api_router.get("/deals", response_model=List[Deal])
async def get_deals():
    """Get active deals"""
    now = datetime.now(timezone.utc).isoformat()
    deals = await db.deals.find({
        "is_active": True,
        "start_date": {"$lte": now},
        "end_date": {"$gte": now}
    }, {"_id": 0}).to_list(100)
    return deals

@api_router.post("/deals", response_model=Deal)
async def create_deal(deal_data: DealCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    """Create deal (Admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    deal = Deal(
        title=deal_data.title,
        description=deal_data.description,
        product_ids=deal_data.product_ids,
        discount_percentage=deal_data.discount_percentage,
        banner_image=deal_data.banner_image,
        start_date=deal_data.start_date,
        end_date=deal_data.end_date
    )
    
    deal_dict = deal.model_dump()
    deal_dict['created_at'] = deal_dict['created_at'].isoformat()
    deal_dict['start_date'] = deal_dict['start_date'].isoformat()
    deal_dict['end_date'] = deal_dict['end_date'].isoformat()
    await db.deals.insert_one(deal_dict)
    
    return deal

# ============== CMS ROUTES ==============

@api_router.get("/cms/{page}")
async def get_cms_sections(page: str):
    """Get CMS sections for a page"""
    sections = await db.cms_sections.find({"page": page}, {"_id": 0}).sort("order", 1).to_list(100)
    return sections

@api_router.put("/cms/{section_id}")
async def update_cms_section(section_id: str, update_data: CMSSectionUpdate, request: Request, session_token: Optional[str] = Cookie(None)):
    """Update CMS section (Admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    update_dict = update_data.model_dump(exclude_none=True)
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.cms_sections.update_one({"id": section_id}, {"$set": update_dict})
    
    section = await db.cms_sections.find_one({"id": section_id}, {"_id": 0})
    return section

# ============== AI CHAT ROUTES ==============

@api_router.post("/chat")
async def chat(chat_data: ChatRequest):
    """AI Shopping Assistant"""
    user_msg = ChatMessage(
        session_id=chat_data.session_id,
        role="user",
        message=chat_data.message
    )
    user_msg_dict = user_msg.model_dump()
    user_msg_dict['created_at'] = user_msg_dict['created_at'].isoformat()
    await db.chat_messages.insert_one(user_msg_dict)
    
    chat_client = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=chat_data.session_id,
        system_message="You are a helpful shopping assistant for SingGifts, a premium Singapore-themed e-commerce store. Help users find products, answer questions about Singapore gifts and souvenirs, and provide recommendations."
    ).with_model("openai", "gpt-4o")
    
    response = await chat_client.send_message(UserMessage(text=chat_data.message))
    
    assistant_msg = ChatMessage(
        session_id=chat_data.session_id,
        role="assistant",
        message=response
    )
    assistant_msg_dict = assistant_msg.model_dump()
    assistant_msg_dict['created_at'] = assistant_msg_dict['created_at'].isoformat()
    await db.chat_messages.insert_one(assistant_msg_dict)
    
    return {"message": response}

@api_router.post("/ai/generate-description")
async def generate_product_description(product_name: str, category: str, request: Request, session_token: Optional[str] = Cookie(None)):
    """Generate AI product description (Admin only)"""
    await get_current_admin_user(request, db, session_token)
    
    chat_client = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id="admin-gen",
        system_message="You are a product description writer for SingGifts. Generate attractive, SEO-friendly product descriptions."
    ).with_model("openai", "gpt-4o")
    
    prompt = f"Generate a short (2-3 sentences) and long (5-7 sentences) product description for: {product_name} in category {category}. Make it Singapore-themed and appealing. Return in format: SHORT: <short desc>\\nLONG: <long desc>"
    
    response = await chat_client.send_message(UserMessage(text=prompt))
    
    return {"description": response}

# ============== COUPON ROUTES ==============

class CouponValidate(BaseModel):
    code: str

@api_router.post("/coupons/validate")
async def validate_coupon(coupon_data: CouponValidate):
    """Validate coupon code"""
    coupon = await db.coupons.find_one({"code": coupon_data.code.upper()}, {"_id": 0})
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    
    # Check if coupon is active
    now = datetime.now(timezone.utc)
    if coupon.get('expires_at'):
        expires_at = datetime.fromisoformat(coupon['expires_at'])
        if now > expires_at:
            raise HTTPException(status_code=400, detail="Coupon has expired")
    
    if not coupon.get('active', True):
        raise HTTPException(status_code=400, detail="Coupon is not active")
    
    return {
        "code": coupon['code'],
        "discount_type": coupon['discount_type'],  # 'percentage' or 'fixed'
        "discount_value": coupon['discount_value'],
        "min_purchase": coupon.get('min_purchase', 0)
    }

# ============== WISHLIST ROUTES ==============

@api_router.get("/wishlist")
async def get_wishlist(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get user's wishlist"""
    user = await get_current_user(request, db, session_token)
    
    wishlist_items = await db.wishlist.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    
    # Fetch product details
    product_ids = [item['product_id'] for item in wishlist_items]
    products = await db.products.find({"id": {"$in": product_ids}}, {"_id": 0}).to_list(100)
    
    # Combine wishlist items with product details
    result = []
    for item in wishlist_items:
        product = next((p for p in products if p['id'] == item['product_id']), None)
        if product:
            result.append({
                "wishlist_item": item,
                "product": product
            })
    
    return result

@api_router.post("/wishlist/{product_id}")
async def add_to_wishlist(product_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    """Add product to wishlist"""
    user = await get_current_user(request, db, session_token)
    
    # Check if already in wishlist
    existing = await db.wishlist.find_one({"user_id": user['id'], "product_id": product_id})
    if existing:
        raise HTTPException(status_code=400, detail="Product already in wishlist")
    
    wishlist_item = {
        "id": str(uuid.uuid4()),
        "user_id": user['id'],
        "product_id": product_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.wishlist.insert_one(wishlist_item)
    return {"message": "Added to wishlist", "id": wishlist_item['id']}

@api_router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(product_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    """Remove product from wishlist"""
    user = await get_current_user(request, db, session_token)
    
    result = await db.wishlist.delete_one({"user_id": user['id'], "product_id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not in wishlist")
    
    return {"message": "Removed from wishlist"}

# ============== STRIPE PAYMENT ROUTES ==============

from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from pydantic import BaseModel
from typing import Dict

STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

class CheckoutRequest(BaseModel):
    cart_items: List[dict]
    shipping_address: dict
    currency: str = "sgd"
    frontend_origin: str
    coupon_code: Optional[str] = None

@api_router.post("/checkout/create-session")
async def create_checkout_session(checkout_req: CheckoutRequest, request: Request, session_token: Optional[str] = Cookie(None)):
    """Create Stripe checkout session (supports guest checkout)"""
    user = await get_current_user_optional(request, db, session_token)
    
    # For guest checkout, extract email from shipping address
    is_guest = user is None
    user_email = user['email'] if user else checkout_req.shipping_address.get('email', '')
    
    # Calculate total from backend (SECURITY: Never trust frontend amounts)
    subtotal = 0.0
    for item in checkout_req.cart_items:
        product = await db.products.find_one({"id": item['product_id']}, {"_id": 0})
        if product:
            price = float(product.get('sale_price') or product.get('price'))
            subtotal += price * item['quantity']
    
    # Apply coupon discount if provided
    discount_amount = 0.0
    coupon_data = None
    if checkout_req.coupon_code:
        coupon = await db.coupons.find_one({"code": checkout_req.coupon_code.upper()}, {"_id": 0})
        if coupon and coupon.get('active', True):
            # Check expiry
            now = datetime.now(timezone.utc)
            if coupon.get('expires_at'):
                expires_at = datetime.fromisoformat(coupon['expires_at'])
                if now <= expires_at:
                    # Check minimum purchase
                    if subtotal >= coupon.get('min_purchase', 0):
                        if coupon['discount_type'] == 'percentage':
                            discount_amount = (subtotal * coupon['discount_value']) / 100
                        else:  # fixed
                            discount_amount = coupon['discount_value']
                        
                        coupon_data = {
                            "code": coupon['code'],
                            "discount_type": coupon['discount_type'],
                            "discount_value": coupon['discount_value'],
                            "discount_amount": discount_amount
                        }
    
    # Calculate final amount after discount
    total_amount = max(0, subtotal - discount_amount)
    
    # Initialize Stripe Checkout
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Create success and cancel URLs
    success_url = f"{checkout_req.frontend_origin}/order-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_req.frontend_origin}/checkout"
    
    # Metadata to track order
    metadata = {
        "user_id": user['id'] if user else "guest",
        "user_email": user_email,
        "is_guest": str(is_guest),
        "currency": checkout_req.currency.upper(),
        "order_type": "ecommerce_purchase"
    }
    
    # Add coupon info to metadata if applied
    if coupon_data:
        metadata["coupon_code"] = coupon_data['code']
        metadata["discount_amount"] = str(discount_amount)
    
    # Create checkout session
    session_request = CheckoutSessionRequest(
        amount=total_amount,
        currency=checkout_req.currency.lower(),
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(session_request)
    
    # Store payment transaction
    transaction = {
        "id": str(uuid.uuid4()),
        "user_id": user['id'] if user else "guest",
        "user_email": user_email,
        "is_guest": is_guest,
        "session_id": session.session_id,
        "subtotal": subtotal,
        "discount": discount_amount,
        "amount": total_amount,
        "currency": checkout_req.currency.upper(),
        "payment_status": "pending",
        "status": "initiated",
        "cart_items": checkout_req.cart_items,
        "shipping_address": checkout_req.shipping_address,
        "coupon": coupon_data,
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request, session_token: Optional[str] = Cookie(None)):
    """Get checkout session status"""
    user = await get_current_user(request, db, session_token)
    
    # Initialize Stripe Checkout
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Get status from Stripe
    status_response: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Find transaction
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update transaction if payment completed and not already processed
    if status_response.payment_status == "paid" and transaction['payment_status'] != "paid":
        # Update transaction
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": "paid",
                "status": "completed",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Create order from transaction
        order = Order(
            user_id=transaction['user_id'],
            items=transaction['cart_items'],
            total_amount=transaction['amount'],
            shipping_address=transaction['shipping_address'],
            payment_method="stripe",
            payment_status="paid"
        )
        
        order_dict = order.model_dump()
        order_dict['created_at'] = order_dict['created_at'].isoformat()
        order_dict['updated_at'] = order_dict['updated_at'].isoformat()
        await db.orders.insert_one(order_dict)
        
        # Clear user's cart
        await db.cart_items.delete_many({"user_id": transaction['user_id']})
        
        # Send order confirmation email
        await send_order_confirmation_email(
            transaction['user_email'],
            order.id,
            transaction['amount'],
            transaction['currency']
        )
        
        return {
            "status": "completed",
            "payment_status": "paid",
            "order_id": order.id,
            "amount": status_response.amount_total / 100,
            "currency": status_response.currency
        }
    
    return {
        "status": status_response.status,
        "payment_status": status_response.payment_status,
        "amount": status_response.amount_total / 100,
        "currency": status_response.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update transaction based on webhook event
        if webhook_response.event_type == "checkout.session.completed":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "payment_status": webhook_response.payment_status,
                    "status": "completed",
                    "webhook_received_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

# Include admin router
app.include_router(admin_router, prefix="/api")

# ============== SEO ROUTES ==============

@app.get("/sitemap.xml")
async def generate_sitemap():
    """Generate XML sitemap for SEO"""
    from fastapi.responses import Response
    
    # Get all products and categories
    products = await db.products.find({}, {"_id": 0, "id": 1, "updated_at": 1}).to_list(length=1000)
    categories = await db.categories.find({}, {"_id": 0, "id": 1}).to_list(length=100)
    
    base_url = "https://gift-mart-sg.preview.emergentagent.com"
    
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Homepage
    sitemap += f'  <url><loc>{base_url}/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>\n'
    
    # Static pages
    static_pages = ['/products', '/about', '/contact', '/faq', '/privacy-policy', '/terms', '/shipping-returns']
    for page in static_pages:
        sitemap += f'  <url><loc>{base_url}{page}</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>\n'
    
    # Products
    for product in products:
        sitemap += f'  <url><loc>{base_url}/products/{product["id"]}</loc><priority>0.7</priority><changefreq>weekly</changefreq></url>\n'
    
    # Categories
    for category in categories:
        sitemap += f'  <url><loc>{base_url}/products?category={category["id"]}</loc><priority>0.6</priority><changefreq>weekly</changefreq></url>\n'
    
    sitemap += '</urlset>'
    
    return Response(content=sitemap, media_type="application/xml")

@app.get("/robots.txt")
async def robots_txt():
    """Generate robots.txt for SEO"""
    from fastapi.responses import Response
    
    robots = """User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin-login
Disallow: /api/

Sitemap: https://gift-mart-sg.preview.emergentagent.com/sitemap.xml
"""
    
    return Response(content=robots, media_type="text/plain")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()