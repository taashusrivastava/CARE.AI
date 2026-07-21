"""CareAI Backend - FastAPI server with JWT auth, MongoDB, and Claude Sonnet 4.5 chatbot."""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import jwt
import bcrypt
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime, timezone, timedelta

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = os.environ.get('JWT_ALGORITHM', 'HS256')
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

app = FastAPI(title="CareAI API")
api = APIRouter(prefix="/api")
security = HTTPBearer()

# ---------- Models ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

class RegisterIn(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    full_name: str
    email: EmailStr

class AuthOut(BaseModel):
    token: str
    user: UserOut

class ProfileIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    chronic_diseases: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class Contact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    relationship: Optional[str] = None
    hospital: Optional[str] = None

class ContactIn(BaseModel):
    name: str
    phone: str
    relationship: Optional[str] = None
    hospital: Optional[str] = None

class Medicine(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    dose: str
    morning: bool = False
    afternoon: bool = False
    night: bool = False
    notes: Optional[str] = None

class MedicineIn(BaseModel):
    name: str
    dose: str
    morning: bool = False
    afternoon: bool = False
    night: bool = False
    notes: Optional[str] = None

class Appointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    doctor: str
    hospital: Optional[str] = None
    date: str  # ISO date
    time: str
    reason: Optional[str] = None
    status: str = "upcoming"

class AppointmentIn(BaseModel):
    doctor: str
    hospital: Optional[str] = None
    date: str
    time: str
    reason: Optional[str] = None
    status: str = "upcoming"

class ChatMsgIn(BaseModel):
    session_id: str
    text: str

class HeartIn(BaseModel):
    age: int
    systolic_bp: int
    cholesterol: int
    heart_rate: int
    diabetes: bool
    smoker: bool

class DiabetesIn(BaseModel):
    glucose: float
    bmi: float
    insulin: float
    age: int

class BMIIn(BaseModel):
    height_cm: float
    weight_kg: float

class SymptomsIn(BaseModel):
    symptoms: List[str]

# ---------- Auth ----------
def create_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=30)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

async def current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
        user_id = payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user

@api.post("/auth/register", response_model=AuthOut)
async def register(inp: RegisterIn):
    existing = await db.users.find_one({"email": inp.email.lower()})
    if existing:
        raise HTTPException(400, "Email already registered")
    uid = str(uuid.uuid4())
    pwd_hash = bcrypt.hashpw(inp.password.encode(), bcrypt.gensalt()).decode()
    doc = {
        "id": uid,
        "full_name": inp.full_name,
        "email": inp.email.lower(),
        "password_hash": pwd_hash,
        "created_at": now_iso(),
        "profile": {},
    }
    await db.users.insert_one(doc)
    return AuthOut(token=create_token(uid), user=UserOut(id=uid, full_name=inp.full_name, email=inp.email.lower()))

@api.post("/auth/login", response_model=AuthOut)
async def login(inp: LoginIn):
    user = await db.users.find_one({"email": inp.email.lower()})
    if not user or not bcrypt.checkpw(inp.password.encode(), user["password_hash"].encode()):
        raise HTTPException(401, "Invalid credentials")
    return AuthOut(token=create_token(user["id"]),
                   user=UserOut(id=user["id"], full_name=user["full_name"], email=user["email"]))

@api.get("/auth/me")
async def me(user=Depends(current_user)):
    return {"id": user["id"], "full_name": user["full_name"], "email": user["email"],
            "profile": user.get("profile", {})}

# ---------- Profile ----------
@api.get("/profile")
async def get_profile(user=Depends(current_user)):
    return user.get("profile", {})

@api.put("/profile")
async def update_profile(inp: ProfileIn, user=Depends(current_user)):
    await db.users.update_one({"id": user["id"]}, {"$set": {"profile": inp.model_dump(exclude_none=True)}})
    doc = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return doc.get("profile", {})

# ---------- Emergency Contacts ----------
@api.get("/contacts", response_model=List[Contact])
async def list_contacts(user=Depends(current_user)):
    docs = await db.contacts.find({"user_id": user["id"]}, {"_id": 0, "user_id": 0}).to_list(500)
    return docs

@api.post("/contacts", response_model=Contact)
async def add_contact(inp: ContactIn, user=Depends(current_user)):
    c = Contact(**inp.model_dump())
    await db.contacts.insert_one({**c.model_dump(), "user_id": user["id"]})
    return c

@api.put("/contacts/{cid}", response_model=Contact)
async def update_contact(cid: str, inp: ContactIn, user=Depends(current_user)):
    res = await db.contacts.update_one({"id": cid, "user_id": user["id"]}, {"$set": inp.model_dump()})
    if not res.matched_count:
        raise HTTPException(404, "Not found")
    doc = await db.contacts.find_one({"id": cid}, {"_id": 0, "user_id": 0})
    return doc

@api.delete("/contacts/{cid}")
async def del_contact(cid: str, user=Depends(current_user)):
    await db.contacts.delete_one({"id": cid, "user_id": user["id"]})
    return {"ok": True}

# ---------- Medicines ----------
@api.get("/medicines", response_model=List[Medicine])
async def list_meds(user=Depends(current_user)):
    return await db.medicines.find({"user_id": user["id"]}, {"_id": 0, "user_id": 0}).to_list(500)

@api.post("/medicines", response_model=Medicine)
async def add_med(inp: MedicineIn, user=Depends(current_user)):
    m = Medicine(**inp.model_dump())
    await db.medicines.insert_one({**m.model_dump(), "user_id": user["id"]})
    return m

@api.delete("/medicines/{mid}")
async def del_med(mid: str, user=Depends(current_user)):
    await db.medicines.delete_one({"id": mid, "user_id": user["id"]})
    return {"ok": True}

# ---------- Appointments ----------
@api.get("/appointments", response_model=List[Appointment])
async def list_appts(user=Depends(current_user)):
    return await db.appointments.find({"user_id": user["id"]}, {"_id": 0, "user_id": 0}).sort("date", 1).to_list(500)

@api.post("/appointments", response_model=Appointment)
async def add_appt(inp: AppointmentIn, user=Depends(current_user)):
    a = Appointment(**inp.model_dump())
    await db.appointments.insert_one({**a.model_dump(), "user_id": user["id"]})
    return a

@api.delete("/appointments/{aid}")
async def del_appt(aid: str, user=Depends(current_user)):
    await db.appointments.delete_one({"id": aid, "user_id": user["id"]})
    return {"ok": True}

# ---------- Predictors ----------
@api.post("/predict/heart")
async def predict_heart(inp: HeartIn):
    # Rule-based risk % (0-100). Approximate heuristic - NOT medical grade.
    score = 0.0
    score += max(0, (inp.age - 30)) * 0.7
    score += max(0, (inp.systolic_bp - 120)) * 0.4
    score += max(0, (inp.cholesterol - 180)) * 0.15
    score += max(0, (inp.heart_rate - 70)) * 0.3
    if inp.diabetes: score += 12
    if inp.smoker: score += 15
    risk = max(0, min(100, score))
    level = "Low" if risk < 30 else ("Moderate" if risk < 60 else "High")
    return {"risk_percent": round(risk, 1), "level": level,
            "advice": "Consult a cardiologist for evaluation." if risk >= 60 else "Maintain a healthy lifestyle and regular checkups."}

@api.post("/predict/diabetes")
async def predict_diabetes(inp: DiabetesIn):
    score = 0.0
    if inp.glucose >= 126: score += 45
    elif inp.glucose >= 100: score += 20
    if inp.bmi >= 30: score += 20
    elif inp.bmi >= 25: score += 10
    if inp.insulin > 200 or inp.insulin < 15: score += 10
    score += max(0, (inp.age - 30)) * 0.4
    risk = max(0, min(100, score))
    result = "Positive" if risk >= 50 else "Negative"
    return {"result": result, "risk_percent": round(risk, 1),
            "advice": "Please see an endocrinologist." if result == "Positive" else "Keep monitoring glucose and stay active."}

@api.post("/predict/bmi")
async def predict_bmi(inp: BMIIn):
    h = inp.height_cm / 100.0
    if h <= 0: raise HTTPException(400, "Invalid height")
    bmi = inp.weight_kg / (h * h)
    if bmi < 18.5: cat = "Underweight"
    elif bmi < 25: cat = "Normal"
    elif bmi < 30: cat = "Overweight"
    else: cat = "Obese"
    return {"bmi": round(bmi, 1), "category": cat}

# ---------- Symptom Checker ----------
SYMPTOM_DB = {
    "Common Cold": {"symptoms": ["cough", "sore throat", "runny nose", "sneezing", "mild fever", "fatigue"],
                    "specialist": "General Physician", "tests": ["Nasal swab (if severe)"], "severity": "Mild"},
    "Influenza (Flu)": {"symptoms": ["fever", "body pain", "fatigue", "cough", "headache", "chills"],
                        "specialist": "General Physician", "tests": ["Flu PCR", "CBC"], "severity": "Moderate"},
    "Migraine": {"symptoms": ["headache", "nausea", "sensitivity to light", "vomiting"],
                 "specialist": "Neurologist", "tests": ["Neurological exam"], "severity": "Moderate"},
    "Gastroenteritis": {"symptoms": ["diarrhea", "vomiting", "abdominal pain", "fever", "nausea"],
                        "specialist": "Gastroenterologist", "tests": ["Stool culture", "CBC"], "severity": "Moderate"},
    "Dengue": {"symptoms": ["high fever", "body pain", "rash", "headache", "fatigue", "vomiting"],
               "specialist": "Physician / Infectious Disease", "tests": ["NS1 antigen", "CBC", "Platelet count"], "severity": "Severe"},
    "COVID-19": {"symptoms": ["fever", "cough", "sore throat", "loss of taste", "loss of smell", "fatigue"],
                 "specialist": "Pulmonologist / Physician", "tests": ["RT-PCR", "Rapid antigen"], "severity": "Moderate"},
    "Hypertension": {"symptoms": ["headache", "dizziness", "blurred vision", "chest pain"],
                     "specialist": "Cardiologist", "tests": ["BP monitoring", "ECG"], "severity": "Serious"},
    "Anemia": {"symptoms": ["fatigue", "pale skin", "dizziness", "shortness of breath"],
               "specialist": "Hematologist / Physician", "tests": ["CBC", "Iron studies"], "severity": "Moderate"},
    "Asthma": {"symptoms": ["shortness of breath", "wheezing", "cough", "chest tightness"],
               "specialist": "Pulmonologist", "tests": ["Spirometry", "Peak flow"], "severity": "Moderate"},
}

@api.get("/symptoms/list")
async def symptoms_list():
    all_syms = sorted({s for d in SYMPTOM_DB.values() for s in d["symptoms"]})
    return {"symptoms": all_syms}

@api.post("/symptoms/check")
async def check_symptoms(inp: SymptomsIn):
    user_syms = {s.lower().strip() for s in inp.symptoms}
    if not user_syms:
        return {"results": []}
    results = []
    for disease, info in SYMPTOM_DB.items():
        matched = user_syms & set(info["symptoms"])
        if matched:
            confidence = round(100 * len(matched) / len(info["symptoms"]), 1)
            results.append({
                "disease": disease,
                "confidence": confidence,
                "matched_symptoms": sorted(matched),
                "specialist": info["specialist"],
                "tests": info["tests"],
                "severity": info["severity"],
            })
    results.sort(key=lambda r: r["confidence"], reverse=True)
    return {"results": results[:5]}

# ---------- Chatbot (Claude Sonnet 4.5) ----------
SYSTEM_MSG = (
    "You are CareAI, a friendly and empathetic AI health assistant. "
    "You provide general health information, explain symptoms, suggest possible causes, recommend specialists, "
    "explain medicines at a high level, share first-aid guidance, and give wellness, nutrition, exercise, mental health "
    "and pregnancy-related suggestions. "
    "You are NOT a doctor. Never diagnose. Always clearly distinguish between general information and medical advice. "
    "For any urgent, severe, or life-threatening symptoms (chest pain, breathing difficulty, unconsciousness, severe bleeding, "
    "stroke signs, suicidal thoughts), immediately advise the user to call local emergency services and stop giving further advice. "
    "Keep responses concise, warm, use short paragraphs and bullet lists when helpful, and always remind the user to consult "
    "a qualified healthcare professional for personal medical decisions."
)

@api.get("/chat/sessions")
async def list_sessions(user=Depends(current_user)):
    docs = await db.chat_sessions.find({"user_id": user["id"]}, {"_id": 0, "user_id": 0}).sort("updated_at", -1).to_list(100)
    return docs

@api.post("/chat/session")
async def new_session(user=Depends(current_user)):
    sid = str(uuid.uuid4())
    doc = {"id": sid, "user_id": user["id"], "title": "New chat", "created_at": now_iso(), "updated_at": now_iso()}
    await db.chat_sessions.insert_one(doc)
    return {"id": sid, "title": "New chat"}

@api.get("/chat/{session_id}/messages")
async def get_messages(session_id: str, user=Depends(current_user)):
    session = await db.chat_sessions.find_one({"id": session_id, "user_id": user["id"]})
    if not session:
        raise HTTPException(404, "Session not found")
    msgs = await db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    return msgs

@api.delete("/chat/{session_id}")
async def delete_session(session_id: str, user=Depends(current_user)):
    await db.chat_sessions.delete_one({"id": session_id, "user_id": user["id"]})
    await db.chat_messages.delete_many({"session_id": session_id})
    return {"ok": True}

@api.post("/chat/message")
async def chat_message(inp: ChatMsgIn, user=Depends(current_user)):
    session = await db.chat_sessions.find_one({"id": inp.session_id, "user_id": user["id"]})
    if not session:
        raise HTTPException(404, "Session not found")

    # Save user message
    await db.chat_messages.insert_one({
        "session_id": inp.session_id, "role": "user", "content": inp.text, "created_at": now_iso()
    })

    # Load history for context (last 20 messages)
    history = await db.chat_messages.find({"session_id": inp.session_id}, {"_id": 0}).sort("created_at", 1).to_list(20)

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=inp.session_id,
        system_message=SYSTEM_MSG,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    # Replay prior turns so LlmChat has context (excluding the just-added user msg)
    prior = history[:-1]
    for m in prior:
        # LlmChat auto-tracks history via stream_message, but we start fresh each request.
        # We'll instead include prior context as a prefix in the user message for reliability.
        pass

    # Build a prompt including history to keep it simple and reliable
    history_text = ""
    for m in prior[-12:]:
        role = "User" if m["role"] == "user" else "Assistant"
        history_text += f"\n{role}: {m['content']}"
    prompt = (history_text + f"\nUser: {inp.text}\nAssistant:").strip() if history_text else inp.text

    async def event_gen():
        full = ""
        try:
            async for ev in chat.stream_message(UserMessage(text=prompt)):
                if isinstance(ev, TextDelta):
                    full += ev.content
                    yield f"data: {ev.content}\n\n".replace("\n\n", "\ndata_end\n\n").replace("data_end", "")
                    # Simple SSE - send chunks
                elif isinstance(ev, StreamDone):
                    break
        except Exception as e:
            logger.exception("chat stream error")
            full = full or f"Sorry, I had trouble responding: {e}"
            yield f"data: {full}\n\n"
        # Save assistant message
        await db.chat_messages.insert_one({
            "session_id": inp.session_id, "role": "assistant", "content": full, "created_at": now_iso()
        })
        # Update session title/updated_at
        title_update = {"updated_at": now_iso()}
        if session.get("title") in (None, "New chat"):
            title_update["title"] = inp.text[:40]
        await db.chat_sessions.update_one({"id": inp.session_id}, {"$set": title_update})
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

# ---------- Health / Root ----------
@api.get("/")
async def root():
    return {"message": "CareAI API", "version": "1.0"}

app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
