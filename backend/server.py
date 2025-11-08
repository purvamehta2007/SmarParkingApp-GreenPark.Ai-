from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ParkingSpot(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lot_id: str
    slot_number: str
    status: str  # available, occupied, soon_available, reserved
    ev_charging: bool = False
    location: dict
    rate_per_hour: float

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    spot_id: str
    start_time: datetime
    end_time: datetime
    duration_hours: float
    amount: float
    status: str  # pending, active, completed, cancelled
    ev_charging: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    booking_id: str
    amount: float
    payment_method: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    status: str  # pending, completed, failed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Reward(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    points: int = 0
    level: str = "Eco Starter"
    carbon_saved: float = 0.0
    badges: List[str] = []
    monthly_carbon: List[dict] = []

class SharedSpace(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str
    name: str
    location: dict
    rate_per_hour: float
    available: bool = True
    slot_type: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ AUTH HELPER ============

async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)) -> Optional[User]:
    """Check session from cookie first, then Authorization header"""
    token = session_token
    
    if not token:
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
    
    if not token:
        return None
    
    session = await db.user_sessions.find_one({"session_token": token})
    if not session:
        return None
    
    if datetime.fromisoformat(session['expires_at']) < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one({"id": session['user_id']}, {"_id": 0})
    if not user_doc:
        return None
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/session-data")
async def process_session(request: Request, response: Response):
    """Process session_id from Emergent Auth"""
    session_id = request.headers.get('X-Session-ID')
    if not session_id:
        raise HTTPException(400, "Missing session ID")
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if resp.status_code != 200:
                raise HTTPException(401, "Invalid session")
            
            data = resp.json()
            
            # Check if user exists
            existing_user = await db.users.find_one({"email": data['email']}, {"_id": 0})
            
            if not existing_user:
                user = User(
                    id=data['id'],
                    email=data['email'],
                    name=data['name'],
                    picture=data.get('picture')
                )
                user_dict = user.model_dump()
                user_dict['created_at'] = user_dict['created_at'].isoformat()
                await db.users.insert_one(user_dict)
                
                # Initialize rewards for new user
                reward = Reward(user_id=user.id)
                await db.rewards.insert_one(reward.model_dump())
            else:
                user = User(**existing_user)
            
            # Create session
            session_token = data['session_token']
            expires_at = datetime.now(timezone.utc) + timedelta(days=7)
            session = UserSession(
                user_id=user.id,
                session_token=session_token,
                expires_at=expires_at
            )
            session_dict = session.model_dump()
            session_dict['expires_at'] = session_dict['expires_at'].isoformat()
            session_dict['created_at'] = session_dict['created_at'].isoformat()
            await db.user_sessions.insert_one(session_dict)
            
            # Set httpOnly cookie
            response.set_cookie(
                key="session_token",
                value=session_token,
                httponly=True,
                secure=True,
                samesite="none",
                max_age=7*24*60*60,
                path="/"
            )
            
            return {"user": user.model_dump(), "session_token": session_token}
    except Exception as e:
        raise HTTPException(500, f"Auth error: {str(e)}")

@api_router.get("/auth/me")
async def get_me(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ============ PARKING SPOTS ============

@api_router.get("/spots")
async def get_spots(status: Optional[str] = None, ev_charging: Optional[bool] = None):
    query = {}
    if status:
        query['status'] = status
    if ev_charging is not None:
        query['ev_charging'] = ev_charging
    
    spots = await db.spots.find(query, {"_id": 0}).to_list(1000)
    return spots

@api_router.get("/spots/{spot_id}")
async def get_spot(spot_id: str):
    spot = await db.spots.find_one({"id": spot_id}, {"_id": 0})
    if not spot:
        raise HTTPException(404, "Spot not found")
    return spot

# ============ BOOKINGS ============

class BookingCreate(BaseModel):
    spot_id: str
    duration_hours: float
    ev_charging: bool = False

@api_router.post("/bookings")
async def create_booking(booking_data: BookingCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    spot = await db.spots.find_one({"id": booking_data.spot_id}, {"_id": 0})
    if not spot:
        raise HTTPException(404, "Spot not found")
    
    if spot['status'] != 'available':
        raise HTTPException(400, "Spot not available")
    
    start_time = datetime.now(timezone.utc)
    end_time = start_time + timedelta(hours=booking_data.duration_hours)
    
    base_amount = spot['rate_per_hour'] * booking_data.duration_hours
    ev_charge = 50 if booking_data.ev_charging else 0
    total_amount = base_amount + ev_charge
    
    booking = Booking(
        user_id=user.id,
        spot_id=booking_data.spot_id,
        start_time=start_time,
        end_time=end_time,
        duration_hours=booking_data.duration_hours,
        amount=total_amount,
        status="pending",
        ev_charging=booking_data.ev_charging
    )
    
    booking_dict = booking.model_dump()
    booking_dict['start_time'] = booking_dict['start_time'].isoformat()
    booking_dict['end_time'] = booking_dict['end_time'].isoformat()
    booking_dict['created_at'] = booking_dict['created_at'].isoformat()
    await db.bookings.insert_one(booking_dict)
    
    # Update spot status
    await db.spots.update_one({"id": booking_data.spot_id}, {"$set": {"status": "reserved"}})
    
    return booking.model_dump()

@api_router.get("/bookings")
async def get_bookings(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    bookings = await db.bookings.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    return bookings

# ============ PREDICTIONS ============

class PredictionRequest(BaseModel):
    destination: str
    arrival_time: str
    duration: float

@api_router.post("/predict-availability")
async def predict_availability(pred: PredictionRequest):
    # Mock AI prediction
    predictions = []
    for i in range(6):
        time_slot = f"+{i*10} min"
        availability = random.randint(40, 95)
        predictions.append({
            "time": time_slot,
            "availability": availability,
            "status": "high" if availability > 70 else "medium" if availability > 50 else "low"
        })
    
    return {
        "destination": pred.destination,
        "predictions": predictions,
        "confidence": random.randint(75, 95),
        "recommended_slot": predictions[0]
    }

# ============ PAYMENTS ============

class PaymentOrder(BaseModel):
    booking_id: str

@api_router.post("/payments/create-order")
async def create_payment_order(order: PaymentOrder, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    booking = await db.bookings.find_one({"id": order.booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(404, "Booking not found")
    
    # Mock Razorpay order (test mode)
    razorpay_order_id = f"order_mock_{uuid.uuid4().hex[:12]}"
    amount_paise = int(booking['amount'] * 100)
    
    transaction = Transaction(
        user_id=user.id,
        booking_id=order.booking_id,
        amount=booking['amount'],
        payment_method="razorpay",
        razorpay_order_id=razorpay_order_id,
        status="pending"
    )
    
    trans_dict = transaction.model_dump()
    trans_dict['created_at'] = trans_dict['created_at'].isoformat()
    await db.transactions.insert_one(trans_dict)
    
    return {
        "order_id": razorpay_order_id,
        "amount": amount_paise,
        "currency": "INR",
        "booking_id": order.booking_id
    }

class PaymentVerify(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    booking_id: str

@api_router.post("/payments/verify")
async def verify_payment(payment: PaymentVerify, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    # Update transaction
    await db.transactions.update_one(
        {"razorpay_order_id": payment.razorpay_order_id},
        {"$set": {"razorpay_payment_id": payment.razorpay_payment_id, "status": "completed"}}
    )
    
    # Update booking
    await db.bookings.update_one(
        {"id": payment.booking_id},
        {"$set": {"status": "active"}}
    )
    
    # Award points
    points = random.randint(10, 30)
    carbon = round(random.uniform(0.5, 2.0), 2)
    await db.rewards.update_one(
        {"user_id": user.id},
        {"$inc": {"points": points, "carbon_saved": carbon}}
    )
    
    return {"success": True, "points_earned": points, "carbon_saved": carbon}

# ============ REWARDS ============

@api_router.get("/rewards/me")
async def get_my_rewards(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    reward = await db.rewards.find_one({"user_id": user.id}, {"_id": 0})
    if not reward:
        reward = Reward(user_id=user.id).model_dump()
        await db.rewards.insert_one(reward)
    
    # Update level based on points
    points = reward.get('points', 0)
    if points >= 500:
        level = "Green Hero"
    elif points >= 200:
        level = "Silver Saver"
    elif points >= 50:
        level = "Bronze Member"
    else:
        level = "Eco Starter"
    
    reward['level'] = level
    return reward

@api_router.get("/rewards/leaderboard")
async def get_leaderboard():
    rewards = await db.rewards.find({}, {"_id": 0}).to_list(100)
    
    # Sort by points
    sorted_rewards = sorted(rewards, key=lambda x: x.get('points', 0), reverse=True)[:10]
    
    # Enrich with user data
    leaderboard = []
    for reward in sorted_rewards:
        user = await db.users.find_one({"id": reward['user_id']}, {"_id": 0})
        if user:
            leaderboard.append({
                "name": user['name'],
                "picture": user.get('picture'),
                "points": reward.get('points', 0),
                "level": reward.get('level', 'Eco Starter'),
                "carbon_saved": reward.get('carbon_saved', 0)
            })
    
    return leaderboard

# ============ HISTORY ============

@api_router.get("/history")
async def get_history(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    bookings = await db.bookings.find({"user_id": user.id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    history = []
    for booking in bookings:
        spot = await db.spots.find_one({"id": booking['spot_id']}, {"_id": 0})
        transaction = await db.transactions.find_one({"booking_id": booking['id']}, {"_id": 0})
        
        history.append({
            "booking": booking,
            "spot": spot,
            "transaction": transaction
        })
    
    return history

# ============ WALLET ============

@api_router.get("/wallet")
async def get_wallet(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    transactions = await db.transactions.find({"user_id": user.id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    reward = await db.rewards.find_one({"user_id": user.id}, {"_id": 0})
    
    balance = reward.get('points', 0) * 0.1 if reward else 0
    
    return {
        "balance": round(balance, 2),
        "points": reward.get('points', 0) if reward else 0,
        "transactions": transactions
    }

# ============ PROFILE ============

@api_router.get("/profile")
async def get_profile(request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user

class ProfileUpdate(BaseModel):
    name: Optional[str] = None

@api_router.patch("/profile")
async def update_profile(profile_data: ProfileUpdate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": user.id}, {"$set": update_data})
    
    return {"success": True}

# ============ SHARED SPACES ============

@api_router.get("/shared-spaces")
async def get_shared_spaces():
    spaces = await db.shared_spaces.find({"available": True}, {"_id": 0}).to_list(100)
    return spaces

class SharedSpaceCreate(BaseModel):
    name: str
    location: dict
    rate_per_hour: float
    slot_type: str

@api_router.post("/shared-spaces")
async def create_shared_space(space_data: SharedSpaceCreate, request: Request, session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    space = SharedSpace(
        owner_id=user.id,
        name=space_data.name,
        location=space_data.location,
        rate_per_hour=space_data.rate_per_hour,
        slot_type=space_data.slot_type
    )
    
    space_dict = space.model_dump()
    space_dict['created_at'] = space_dict['created_at'].isoformat()
    await db.shared_spaces.insert_one(space_dict)
    
    return space.model_dump()

# ============ IOT SIMULATION ============

@api_router.post("/simulate-iot")
async def simulate_iot_update():
    """Simulate random IoT sensor updates"""
    spots = await db.spots.find({}, {"_id": 0}).to_list(1000)
    
    for spot in spots:
        if random.random() < 0.1:  # 10% chance of status change
            new_status = random.choice(['available', 'occupied', 'soon_available'])
            await db.spots.update_one(
                {"id": spot['id']},
                {"$set": {"status": new_status}}
            )
            
            # Log sensor event
            await db.sensor_events.insert_one({
                "spot_id": spot['id'],
                "status": new_status,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
    
    return {"message": "IoT simulation updated"}

# ============ SEED DATA ============

@api_router.post("/seed-data")
async def seed_data():
    """Initialize database with sample data"""
    
    # Clear existing data
    await db.spots.delete_many({})
    
    # Create sample spots
    sample_spots = [
        {
            "id": str(uuid.uuid4()),
            "lot_id": "lot_001",
            "slot_number": f"A{i+1}",
            "status": random.choice(['available', 'occupied', 'soon_available']),
            "ev_charging": i % 3 == 0,
            "location": {"lat": 28.6139 + random.uniform(-0.01, 0.01), "lng": 77.2090 + random.uniform(-0.01, 0.01)},
            "rate_per_hour": random.choice([30, 40, 50, 60])
        }
        for i in range(20)
    ]
    
    await db.spots.insert_many(sample_spots)
    
    return {"message": "Database seeded successfully", "spots_created": len(sample_spots)}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()