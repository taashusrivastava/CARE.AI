"""CareAI Backend - FastAPI server with JWT auth, JSON file DB, and OpenAI chatbot."""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
import os
import json
import logging
import uuid
import jwt
import bcrypt
import asyncio
import random
import math
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta
try:
    from twilio.rest import Client as TwilioClient
except Exception:
    TwilioClient = None

load_dotenv()

ROOT_DIR = Path(__file__).parent
DB_FILE = ROOT_DIR / 'db.json'

JWT_SECRET = os.environ.get('JWT_SECRET', 'careai-dev-secret-key-change-in-production')
JWT_ALGO = os.environ.get('JWT_ALGORITHM', 'HS256')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '').strip()
# If the key is empty or still the placeholder, the chat will use a local fallback.
HAS_OPENAI = bool(OPENAI_API_KEY) and OPENAI_API_KEY != 'YOUR_OPENAI_API_KEY'
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '').strip()
# Twilio config (optional)
TWILIO_SID = os.environ.get('TWILIO_ACCOUNT_SID', '').strip()
TWILIO_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '').strip()
TWILIO_FROM = os.environ.get('TWILIO_FROM_NUMBER', '').strip()
HAS_TWILIO = bool(TWILIO_SID and TWILIO_TOKEN and TWILIO_FROM and TwilioClient)

# ---------- JSON File Database ----------
def _load_db():
    if DB_FILE.exists():
        try:
            return json.loads(DB_FILE.read_text('utf-8'))
        except:
            pass
    return {"users": [], "contacts": [], "caregivers": [], "medicines": [], "appointments": [], "appointment_preparations": [], "chat_sessions": [], "chat_messages": [], "family_members": [], "reminders": [], "notifications": []}

def _save_db(data):
    DB_FILE.write_text(json.dumps(data, indent=2, default=str), 'utf-8')

class JSONCollection:
    def __init__(self, name):
        self.name = name

    def _reload(self):
        return _load_db().get(self.name, [])

    def _save(self, items):
        d = _load_db()
        d[self.name] = items
        _save_db(d)

    async def find_one(self, query, projection=None):
        return await asyncio.to_thread(self._find_one_sync, query, projection)

    def _find_one_sync(self, query, projection=None):
        for item in self._reload():
            if all(item.get(k) == v for k, v in query.items()):
                if projection:
                    return {k: item[k] for k in projection if k in item and k != "_id"}
                return {k: v for k, v in item.items() if k != "_id"}
        return None

    async def insert_one(self, doc):
        items = self._reload()
        items.append(doc)
        self._save(items)

    async def update_one(self, query, update):
        items = self._reload()
        for item in items:
            if all(item.get(k) == v for k, v in query.items()):
                if "$set" in update:
                    item.update(update["$set"])
                self._save(items)
                return type('Obj', (), {'matched_count': 1})()
        return type('Obj', (), {'matched_count': 0})()

    async def delete_one(self, query):
        items = self._reload()
        items = [i for i in items if not all(i.get(k) == v for k, v in query.items())]
        self._save(items)

    async def delete_many(self, query):
        items = self._reload()
        items = [i for i in items if not all(i.get(k) == v for k, v in query.items())]
        self._save(items)

    async def find(self, query=None, projection=None, sort=None):
        items = self._reload()
        if query:
            items = [i for i in items if all(i.get(k) == v for k, v in query.items())]
        if projection:
            items = [{k: i[k] for k in projection if k in i and k != "_id"} for i in items]
        else:
            items = [{k: v for k, v in i.items() if k != "_id"} for i in items]
        if sort:
            sk, sd = sort[0]
            items.sort(key=lambda x: x.get(sk, ""), reverse=(sd > 0))
        return items

class JSONDB:
    def __getattr__(self, name):
        return JSONCollection(name)

db = JSONDB()

app = FastAPI(title="CareAI API")
api = APIRouter(prefix="/api")
security = HTTPBearer()

# ---------- Models ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

class RegisterIn(BaseModel):
    full_name: str
    email: str
    password: str

class LoginIn(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    full_name: str
    email: str

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

class Caregiver(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    relationship: Optional[str] = None
    permissions: List[str] = []

class CaregiverIn(BaseModel):
    name: str
    phone: str
    relationship: Optional[str] = None
    permissions: List[str] = []

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
    date: str
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

class AppointmentPreparation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    appointment_id: str
    user_id: str
    main_concern: str
    symptoms: List[str]
    started_when: str
    better_worse: str
    questions: List[str]
    relevant_records: Optional[str] = None
    recent_measurements: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AppointmentPreparationIn(BaseModel):
    main_concern: str
    symptoms: List[str]
    started_when: str
    better_worse: str
    questions: List[str]
    relevant_records: Optional[str] = None
    recent_measurements: Optional[str] = None

class ChatMsgIn(BaseModel):
    session_id: str
    text: str
    mode: str = "health"
    language: str = "english"

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

class MedicineLookupIn(BaseModel):
    name: str

class HealthScoreIn(BaseModel):
    sleep_hours: float = 7.0
    water_glasses: int = 6
    bmi: float = 22.0
    heart_rate: int = 72
    exercise_minutes: int = 30
    stress_level: int = 3
    diet_quality: int = 3

class FamilyMemberIn(BaseModel):
    name: str
    relationship: str
    age: int
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    medications: Optional[str] = None
    vaccination_schedule: Optional[str] = None
    contact_number: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class EmergencyAlertIn(BaseModel):
    type: str  # fall, no_movement, high_heart_rate
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    heart_rate: Optional[int] = None

class Reminder(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str = "medication"  # medication, appointment, follow_up_test, hydration, activity, sleep, report_follow_up
    title: str
    schedule_time: str = "09:00"
    days: List[str] = []
    notes: Optional[str] = None
    enabled: bool = True
    # Optional phone number to call when the reminder fires (for call-type reminders)
    contact_phone: Optional[str] = None
    # Date string (YYYY-MM-DD) of last trigger to avoid duplicate firing
    last_triggered: Optional[str] = None

class ReminderIn(BaseModel):
    type: str = "medication"
    title: str
    schedule_time: str = "09:00"
    days: List[str] = []
    notes: Optional[str] = None
    enabled: bool = True
    contact_phone: Optional[str] = None
    last_triggered: Optional[str] = None

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
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user

@api.post("/auth/register", response_model=AuthOut)
async def register(inp: RegisterIn):
    existing = await db.users.find_one({"email": inp.email.lower()})
    if existing:
        raise HTTPException(400, "Email already registered")
    uid = str(uuid.uuid4())
    pwd_hash = await asyncio.to_thread(
        lambda: bcrypt.hashpw(inp.password.encode(), bcrypt.gensalt()).decode()
    )
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
    if not user:
        raise HTTPException(401, "Invalid credentials")
    valid = await asyncio.to_thread(
        lambda: bcrypt.checkpw(inp.password.encode(), user["password_hash"].encode())
    )
    if not valid:
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
    doc = await db.users.find_one({"id": user["id"]})
    return doc.get("profile", {})

# ---------- Emergency Contacts ----------
@api.get("/contacts", response_model=List[Contact])
async def list_contacts(user=Depends(current_user)):
    return await db.contacts.find({"user_id": user["id"]})

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
    doc = await db.contacts.find_one({"id": cid})
    return doc

@api.delete("/contacts/{cid}")
async def del_contact(cid: str, user=Depends(current_user)):
    await db.contacts.delete_one({"id": cid, "user_id": user["id"]})
    return {"ok": True}

# ---------- Caregiver Mode ----------
@api.get("/caregivers", response_model=List[Caregiver])
async def list_caregivers(user=Depends(current_user)):
    return await db.caregivers.find({"user_id": user["id"]})

@api.post("/caregivers", response_model=Caregiver)
async def add_caregiver(inp: CaregiverIn, user=Depends(current_user)):
    caregiver = Caregiver(**inp.model_dump())
    await db.caregivers.insert_one({**caregiver.model_dump(), "user_id": user["id"]})
    return caregiver

@api.put("/caregivers/{cid}", response_model=Caregiver)
async def update_caregiver(cid: str, inp: CaregiverIn, user=Depends(current_user)):
    res = await db.caregivers.update_one({"id": cid, "user_id": user["id"]}, {"$set": inp.model_dump()})
    if not res.matched_count:
        raise HTTPException(404, "Caregiver not found")
    doc = await db.caregivers.find_one({"id": cid})
    return doc

@api.delete("/caregivers/{cid}")
async def del_caregiver(cid: str, user=Depends(current_user)):
    await db.caregivers.delete_one({"id": cid, "user_id": user["id"]})
    return {"ok": True}

# ---------- Medicines ----------
@api.get("/medicines", response_model=List[Medicine])
async def list_meds(user=Depends(current_user)):
    return await db.medicines.find({"user_id": user["id"]})

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
    return await db.appointments.find({"user_id": user["id"]})

@api.post("/appointments", response_model=Appointment)
async def add_appt(inp: AppointmentIn, user=Depends(current_user)):
    a = Appointment(**inp.model_dump())
    await db.appointments.insert_one({**a.model_dump(), "user_id": user["id"]})
    return a

@api.delete("/appointments/{aid}")
async def del_appt(aid: str, user=Depends(current_user)):
    await db.appointments.delete_one({"id": aid, "user_id": user["id"]})
    return {"ok": True}

@api.get("/appointments/{aid}/preparation", response_model=AppointmentPreparation)
async def get_appointment_preparation(aid: str, user=Depends(current_user)):
    prep = await db.appointment_preparations.find_one({"appointment_id": aid, "user_id": user["id"]})
    if not prep:
        raise HTTPException(404, "Preparation not found")
    return prep

@api.post("/appointments/{aid}/preparation", response_model=AppointmentPreparation)
async def create_appointment_preparation(aid: str, inp: AppointmentPreparationIn, user=Depends(current_user)):
    appt = await db.appointments.find_one({"id": aid, "user_id": user["id"]})
    if not appt:
        raise HTTPException(404, "Appointment not found")
    prep = AppointmentPreparation(
        appointment_id=aid,
        user_id=user["id"],
        main_concern=inp.main_concern,
        symptoms=inp.symptoms,
        started_when=inp.started_when,
        better_worse=inp.better_worse,
        questions=inp.questions,
        relevant_records=inp.relevant_records,
        recent_measurements=inp.recent_measurements,
    )
    await db.appointment_preparations.insert_one(prep.model_dump())
    return prep

# ---------- Reminders ----------
@api.get("/reminders", response_model=List[Reminder])
async def list_reminders(user=Depends(current_user)):
    """List all reminders for the current user."""
    return await db.reminders.find({"user_id": user["id"]})

@api.post("/reminders", response_model=Reminder)
async def add_reminder(inp: ReminderIn, user=Depends(current_user)):
    """Create a new reminder."""
    r = Reminder(**inp.model_dump())
    await db.reminders.insert_one({**r.model_dump(), "user_id": user["id"]})
    return r

@api.put("/reminders/{rid}", response_model=Reminder)
async def update_reminder(rid: str, inp: ReminderIn, user=Depends(current_user)):
    """Update a reminder (including toggling enabled on/off)."""
    res = await db.reminders.update_one({"id": rid, "user_id": user["id"]}, {"$set": inp.model_dump()})
    if not res.matched_count:
        raise HTTPException(404, "Reminder not found")
    doc = await db.reminders.find_one({"id": rid})
    return doc

@api.delete("/reminders/{rid}")
async def del_reminder(rid: str, user=Depends(current_user)):
    """Delete a reminder."""
    await db.reminders.delete_one({"id": rid, "user_id": user["id"]})
    return {"ok": True}

# ---------- Predictors ----------
@api.post("/predict/heart")
async def predict_heart(inp: HeartIn):
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
    if h <= 0:
        raise HTTPException(400, "Invalid height")
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

# ---------- MEDICINE DATABASE (AI Medicine Scanner) ----------
MEDICINE_DB = {
    "paracetamol": {
        "name": "Paracetamol (Acetaminophen)",
        "uses": "Reduces fever, relieves mild to moderate pain (headache, toothache, muscle aches)",
        "side_effects": "Nausea, rash, liver damage (with overdose), allergic reactions",
        "dosage": "Adults: 500-1000mg every 4-6 hours, max 4000mg/day. Children: 10-15mg/kg every 4-6 hours",
        "expiry_info": "Usually 2-3 years from manufacture. Do not use after expiry (risk of liver toxicity)",
        "alternatives": ["Ibuprofen", "Aspirin", "Naproxen"],
        "drug_interactions": ["Warfarin (increased bleeding risk)", "Alcohol (increased liver toxicity)", "Carbamazepine"],
        "storage": "Store below 25°C, protect from light"
    },
    "ibuprofen": {
        "name": "Ibuprofen",
        "uses": "Reduces inflammation, fever, relieves pain (arthritis, menstrual cramps, muscle pain)",
        "side_effects": "Stomach upset, heartburn, nausea, dizziness, fluid retention",
        "dosage": "Adults: 200-400mg every 4-6 hours, max 1200mg/day OTC. Take with food",
        "expiry_info": "2-3 years from manufacture. Discard if tablets are discolored or crumbling",
        "alternatives": ["Paracetamol", "Naproxen", "Diclofenac"],
        "drug_interactions": ["Aspirin (increased bleeding)", "Blood thinners", "ACE inhibitors", "Diuretics"],
        "storage": "Store at room temperature, keep dry"
    },
    "amoxicillin": {
        "name": "Amoxicillin",
        "uses": "Bacterial infections: ear infections, strep throat, pneumonia, urinary tract infections",
        "side_effects": "Diarrhea, rash, nausea, vomiting, allergic reactions (rash, swelling, anaphylaxis)",
        "dosage": "Adults: 250-500mg every 8 hours OR 875mg every 12 hours. Complete full course",
        "expiry_info": "2 years from manufacture. Check for discoloration or foul odor",
        "alternatives": ["Amoxicillin-clavulanate", "Cephalexin", "Azithromycin"],
        "drug_interactions": ["Oral contraceptives (reduced effectiveness)", "Warfarin", "Methotrexate"],
        "storage": "Store below 25°C, capsules in dry place, suspension refrigerate"
    },
    "omeprazole": {
        "name": "Omeprazole",
        "uses": "Gastric acid reduction: GERD, heartburn, stomach ulcers, Zollinger-Ellison syndrome",
        "side_effects": "Headache, abdominal pain, diarrhea, nausea, flatulence, vitamin B12 deficiency (long-term)",
        "dosage": "Adults: 20-40mg once daily before a meal (usually breakfast). 14-day max OTC",
        "expiry_info": "2-3 years. Discard if capsules are soft or leaking",
        "alternatives": ["Pantoprazole", "Esomeprazole", "Ranitidine", "Famotidine"],
        "drug_interactions": ["Clopidogrel (reduced efficacy)", "Methotrexate", "Warfarin", "Cilostazol"],
        "storage": "Store at room temperature, protect from moisture"
    },
    "metformin": {
        "name": "Metformin",
        "uses": "Type 2 diabetes management, insulin resistance, PCOS (off-label)",
        "side_effects": "Nausea, diarrhea, stomach upset, metallic taste, lactic acidosis (rare-serious)",
        "dosage": "Adults: 500-850mg 1-3 times daily with meals. Max 2550mg/day extended release",
        "expiry_info": "2-3 years. Do not use if tablets are cracked or changed color",
        "alternatives": ["Metformin ER", "Glipizide", "Pioglitazone", "Empagliflozin"],
        "drug_interactions": ["Contrast dye (stop 48h before/after)", "Alcohol", "Cimetidine", "Topiramate"],
        "storage": "Store below 25°C, protect from light and moisture"
    },
    "cetirizine": {
        "name": "Cetirizine (Zyrtec)",
        "uses": "Allergy relief: hay fever, seasonal allergies, hives, itchy/watery eyes",
        "side_effects": "Drowsiness, dry mouth, fatigue, dizziness, headache",
        "dosage": "Adults: 10mg once daily. Children 6-12: 5-10mg daily",
        "expiry_info": "2-3 years. Discard if tablets show discoloration",
        "alternatives": ["Loratadine", "Fexofenadine", "Diphenhydramine", "Levocetirizine"],
        "drug_interactions": ["Alcohol (increased sedation)", "CNS depressants", "Theophylline"],
        "storage": "Store at room temperature, keep dry"
    },
    "aspirin": {
        "name": "Aspirin (Acetylsalicylic Acid)",
        "uses": "Pain relief, fever reduction, anti-inflammatory, low-dose for heart attack/stroke prevention",
        "side_effects": "Stomach irritation, heartburn, bleeding, tinnitus (ringing in ears with overdose)",
        "dosage": "Pain: 325-650mg every 4-6 hours. Heart prevention: 81-100mg daily. Take with food",
        "expiry_info": "2-3 years. Discard if tablets smell like vinegar (acetic acid)",
        "alternatives": ["Ibuprofen", "Naproxen", "Paracetamol", "Clopidogrel"],
        "drug_interactions": ["Warfarin (increased bleeding)", "Other NSAIDs", "Methotrexate", "ACE inhibitors"],
        "storage": "Store below 25°C in airtight container, protect from moisture"
    },
    "levothyroxine": {
        "name": "Levothyroxine (Synthroid)",
        "uses": "Hypothyroidism treatment, thyroid hormone replacement, thyroid cancer suppression",
        "side_effects": "Hair loss (temporary), heat sensitivity, sweating, palpitations (if dose too high)",
        "dosage": "Adults: 25-200mcg once daily on empty stomach, 30-60 min before breakfast. Individualized",
        "expiry_info": "2-3 years. Very stable if stored properly",
        "alternatives": ["Liothyronine (T3)", "Natural desiccated thyroid", "Armour Thyroid"],
        "drug_interactions": ["Calcium/iron supplements (take 4h apart)", "Warfarin", "PPIs", "Estrogen"],
        "storage": "Store at room temperature, protect from light and moisture"
    },
    "atorvastatin": {
        "name": "Atorvastatin (Lipitor)",
        "uses": "Lowers cholesterol (LDL), reduces risk of heart attack, stroke, angina",
        "side_effects": "Muscle pain, joint pain, diarrhea, increased blood sugar, liver enzyme elevation",
        "dosage": "Adults: 10-80mg once daily. Can be taken any time of day",
        "expiry_info": "2-3 years. Discard if tablets show discoloration",
        "alternatives": ["Rosuvastatin", "Simvastatin", "Pravastatin", "Ezetimibe"],
        "drug_interactions": ["Grapefruit juice (avoid)", "Warfarin", "Antifungals", "HIV protease inhibitors"],
        "storage": "Store at room temperature, protect from light and moisture"
    },
    "salbutamol": {
        "name": "Salbutamol (Albuterol)",
        "uses": "Asthma relief, COPD exacerbation, wheezing, exercise-induced bronchospasm",
        "side_effects": "Tremor, nervousness, increased heart rate, headache, muscle cramps",
        "dosage": "Inhaler: 1-2 puffs (100-200mcg) every 4-6 hours as needed. Max 8 puffs/day",
        "expiry_info": "2 years from manufacture. Check inhaler counter. Discard if canister is empty",
        "alternatives": ["Levalbuterol", "Ipratropium", "Formoterol", "Terbutaline"],
        "drug_interactions": ["Beta-blockers (reduced efficacy)", "Diuretics", "MAOIs", "TCAs"],
        "storage": "Store at room temperature. Do not puncture canister"
    },
    "losartan": {
        "name": "Losartan (Cozaar)",
        "uses": "Hypertension, diabetic nephropathy, heart failure, stroke prevention",
        "side_effects": "Dizziness, low blood pressure, hyperkalemia, cough (less than ACE inhibitors)",
        "dosage": "Adults: 25-100mg once or twice daily. Start 25-50mg daily",
        "expiry_info": "2-3 years. Discard if tablets are cracked or discolored",
        "alternatives": ["Valsartan", "Irbesartan", "Telmisartan", "Enalapril", "Lisinopril"],
        "drug_interactions": ["Potassium supplements/sparing diuretics", "NSAIDs", "Lithium", "Rifampin"],
        "storage": "Store at room temperature, protect from moisture"
    },
    "amlodipine": {
        "name": "Amlodipine (Norvasc)",
        "uses": "Hypertension, coronary artery disease, angina (chronic stable and vasospastic)",
        "side_effects": "Swelling in ankles/feet, flushing, dizziness, palpitations, fatigue",
        "dosage": "Adults: 2.5-10mg once daily. Start 5mg daily",
        "expiry_info": "2-3 years. Discard if tablets are discolored",
        "alternatives": ["Nifedipine", "Felodipine", "Verapamil", "Diltiazem"],
        "drug_interactions": ["Simvastatin (limit to 20mg)", "Grapefruit juice", "CYP3A4 inhibitors"],
        "storage": "Store at room temperature, protect from light"
    },
    "doxycycline": {
        "name": "Doxycycline",
        "uses": "Bacterial infections: acne, Lyme disease, malaria prophylaxis, respiratory infections, STIs",
        "side_effects": "Photosensitivity (sunburn risk), nausea, diarrhea, esophagitis, yeast infections",
        "dosage": "Adults: 100mg every 12 hours on day 1, then 100mg daily. Take with full glass of water",
        "expiry_info": "2-3 years. Outdated tetracyclines can cause kidney damage (Fanconi syndrome)",
        "alternatives": ["Minocycline", "Tetracycline", "Azithromycin", "Amoxicillin"],
        "drug_interactions": ["Antacids/calcium/iron (take 2-3h apart)", "Warfarin", "Oral contraceptives"],
        "storage": "Store below 25°C. Protect from light and moisture"
    },
    "prednisolone": {
        "name": "Prednisolone",
        "uses": "Anti-inflammatory/immunosuppressant: asthma, allergies, rheumatoid arthritis, IBD, autoimmune conditions",
        "side_effects": "Weight gain, increased appetite, insomnia, mood changes, high blood sugar, bone thinning",
        "dosage": "Dose varies by condition (5-60mg daily). Taper dose, do not stop abruptly",
        "expiry_info": "2-3 years. Discard if tablets are crumbling or discolored",
        "alternatives": ["Prednisone", "Dexamethasone", "Methylprednisolone", "Hydrocortisone"],
        "drug_interactions": ["NSAIDs (increased GI bleeding)", "Warfarin", "Diabetes medications", "Vaccines"],
        "storage": "Store at room temperature, protect from light"
    },
    "sertraline": {
        "name": "Sertraline (Zoloft)",
        "uses": "Depression, anxiety disorders, OCD, PTSD, PMDD, social anxiety",
        "side_effects": "Nausea, insomnia, fatigue, sexual dysfunction, dry mouth, weight changes",
        "dosage": "Adults: 25-200mg once daily. Start 25-50mg daily, gradually increase",
        "expiry_info": "2-3 years. Discard if capsules are leaking or discolored",
        "alternatives": ["Fluoxetine", "Citalopram", "Escitalopram", "Venlafaxine"],
        "drug_interactions": ["MAOIs (avoid 14-day washout)", "Warfarin", "NSAIDs (increased bleeding)", "Sumatriptan"],
        "storage": "Store below 25°C, protect from moisture"
    },
    "furosemide": {
        "name": "Furosemide (Lasix)",
        "uses": "Edema from heart failure, kidney disease, liver cirrhosis; hypertension",
        "side_effects": "Dehydration, electrolyte imbalance (low K, Mg), dizziness, frequent urination",
        "dosage": "Adults: 20-80mg once or twice daily. Individualized based on response",
        "expiry_info": "2-3 years. Discard if tablets are discolored",
        "alternatives": ["Hydrochlorothiazide", "Torsemide", "Bumetanide", "Spironolactone"],
        "drug_interactions": ["Digoxin", "Lithium", "NSAIDs", "Corticosteroids", "Aminoglycosides"],
        "storage": "Store at room temperature, protect from light and moisture"
    },
    "diclofenac": {
        "name": "Diclofenac (Voltaren)",
        "uses": "Anti-inflammatory: arthritis, acute pain, dental pain, menstrual cramps, gout",
        "side_effects": "Stomach pain, ulcers, bleeding, increased BP, kidney issues, liver enzyme elevation",
        "dosage": "Adults: 50mg 2-3 times daily (oral). Topical gel: 4g 3-4 times daily. Take with food",
        "expiry_info": "2-3 years. Discard if gel changes color or tablets are crumbling",
        "alternatives": ["Ibuprofen", "Naproxen", "Celecoxib", "Ketorolac"],
        "drug_interactions": ["Blood thinners", "Aspirin", "Lithium", "Methotrexate", "ACE inhibitors"],
        "storage": "Store at room temperature. Gel: keep tightly closed"
    },
    "azithromycin": {
        "name": "Azithromycin (Z-Pak)",
        "uses": "Respiratory infections, skin infections, STIs (chlamydia, gonorrhea), ear infections",
        "side_effects": "Nausea, diarrhea, abdominal pain, QT prolongation (rare), hearing changes",
        "dosage": "Adults: 500mg day 1, then 250mg days 2-5 (total 1.5g). STIs: 1g single dose",
        "expiry_info": "2-3 years. Discard if tablets are discolored or suspension is expired",
        "alternatives": ["Erythromycin", "Clarithromycin", "Doxycycline", "Amoxicillin"],
        "drug_interactions": ["Warfarin", "Digoxin", "Antacids (take 2h apart)", "Statins"],
        "storage": "Store below 25°C, protect from moisture. Suspension: refrigerate"
    },
    "gabapentin": {
        "name": "Gabapentin (Neurontin)",
        "uses": "Neuropathic pain, epilepsy/seizures, restless leg syndrome, fibromyalgia (off-label)",
        "side_effects": "Drowsiness, dizziness, ataxia, weight gain, blurred vision, swelling in legs",
        "dosage": "Adults: 300-600mg 3 times daily. Start low and titrate up. Max 3600mg/day",
        "expiry_info": "2-3 years. Discard if capsules are leaking or showing discoloration",
        "alternatives": ["Pregabalin", "Carbamazepine", "Lamotrigine", "Topiramate"],
        "drug_interactions": ["Alcohol (increased sedation)", "CNS depressants", "Antacids", "Hydrocodone"],
        "storage": "Store below 25°C, protect from moisture"
    },
    "pantoprazole": {
        "name": "Pantoprazole (Protonix)",
        "uses": "GERD, erosive esophagitis, Zollinger-Ellison syndrome, stomach ulcer prevention",
        "side_effects": "Headache, nausea, abdominal pain, diarrhea, vitamin B12 deficiency (long-term)",
        "dosage": "Adults: 20-40mg once daily. For severe: 40mg twice daily. 8-week max OTC",
        "expiry_info": "2-3 years. Discard if tablets are discolored",
        "alternatives": ["Omeprazole", "Esomeprazole", "Lansoprazole", "Famotidine"],
        "drug_interactions": ["Warfarin", "Methotrexate", "Atazanavir", "Clopidogrel"],
        "storage": "Store at room temperature, protect from moisture"
    }
}

@api.post("/medicines/info")
async def medicine_info(inp: MedicineLookupIn):
    """Look up medicine information by name (fuzzy match)."""
    query = inp.name.lower().strip()
    # Direct match
    if query in MEDICINE_DB:
        return MEDICINE_DB[query]
    # Fuzzy match
    for key, info in MEDICINE_DB.items():
        if query in key or key in query:
            return info
    # Partial match in name
    for key, info in MEDICINE_DB.items():
        if any(word in key or key in word for word in query.split()):
            return info
    raise HTTPException(404, f"Medicine '{inp.name}' not found in database")

@api.get("/medicines/list")
async def medicine_list():
    """List all available medicines in the database."""
    return {"medicines": sorted(MEDICINE_DB.keys())}

@api.post("/medicines/scan")
async def medicine_scan(inp: MedicineLookupIn):
    """Handle OCR scanned medicine name and return info."""
    return await medicine_info(inp)

# ---------- Health Knowledge Graph ----------
# Builds a graph connecting: Symptoms -> Body system -> Health topic -> Tests -> Specialists -> Facilities
KNOWLEDGE_GRAPH = {
    "Common Cold": {
        "body_system": "Respiratory System",
        "symptoms": ["cough", "sore throat", "runny nose", "sneezing", "mild fever", "fatigue"],
        "tests": ["Nasal swab (if severe)"],
        "specialist": "General Physician",
        "facilities": ["Primary Care Clinic", "Outpatient Department"],
    },
    "Influenza (Flu)": {
        "body_system": "Respiratory System",
        "symptoms": ["fever", "body pain", "fatigue", "cough", "headache", "chills"],
        "tests": ["Flu PCR", "CBC"],
        "specialist": "General Physician",
        "facilities": ["Primary Care Clinic", "Infectious Disease Center"],
    },
    "Migraine": {
        "body_system": "Nervous System",
        "symptoms": ["headache", "nausea", "sensitivity to light", "vomiting"],
        "tests": ["Neurological exam"],
        "specialist": "Neurologist",
        "facilities": ["Neurology Clinic", "Imaging Center"],
    },
    "Gastroenteritis": {
        "body_system": "Digestive System",
        "symptoms": ["diarrhea", "vomiting", "abdominal pain", "fever", "nausea"],
        "tests": ["Stool culture", "CBC"],
        "specialist": "Gastroenterologist",
        "facilities": ["Gastro Clinic", "Diagnostic Lab"],
    },
    "Dengue": {
        "body_system": "Circulatory System",
        "symptoms": ["high fever", "body pain", "rash", "headache", "fatigue", "vomiting"],
        "tests": ["NS1 antigen", "CBC", "Platelet count"],
        "specialist": "Physician / Infectious Disease",
        "facilities": ["Infectious Disease Center", "Multispecialty Hospital"],
    },
    "COVID-19": {
        "body_system": "Respiratory System",
        "symptoms": ["fever", "cough", "sore throat", "loss of taste", "loss of smell", "fatigue"],
        "tests": ["RT-PCR", "Rapid antigen"],
        "specialist": "Pulmonologist / Physician",
        "facilities": ["COVID Testing Center", "Pulmonology Department"],
    },
    "Hypertension": {
        "body_system": "Circulatory System",
        "symptoms": ["headache", "dizziness", "blurred vision", "chest pain"],
        "tests": ["BP monitoring", "ECG"],
        "specialist": "Cardiologist",
        "facilities": ["Cardiology Department", "Multispecialty Hospital"],
    },
    "Anemia": {
        "body_system": "Circulatory System",
        "symptoms": ["fatigue", "pale skin", "dizziness", "shortness of breath"],
        "tests": ["CBC", "Iron studies"],
        "specialist": "Hematologist / Physician",
        "facilities": ["Hematology Center", "Diagnostic Lab"],
    },
    "Asthma": {
        "body_system": "Respiratory System",
        "symptoms": ["shortness of breath", "wheezing", "cough", "chest tightness"],
        "tests": ["Spirometry", "Peak flow"],
        "specialist": "Pulmonologist",
        "facilities": ["Pulmonology Department", "Allergy & Asthma Clinic"],
    },
}

NODE_TYPE_COLORS = {
    "symptom": "#f43f5e",      # rose
    "system": "#8b5cf6",        # violet
    "topic": "#0ea5e9",         # sky
    "test": "#f59e0b",          # amber
    "specialist": "#10b981",    # emerald
    "facility": "#6366f1",      # indigo
}

@api.get("/graph")
async def knowledge_graph():
    """Return the full health knowledge graph as nodes + edges."""
    nodes = []
    edges = []
    seen = {}

    def add_node(nid, label, ntype):
        if nid not in seen:
            seen[nid] = len(nodes)
            nodes.append({"id": nid, "label": label, "type": ntype,
                          "color": NODE_TYPE_COLORS.get(ntype, "#64748b")})
        return seen[nid]

    def add_edge(a, b, relation):
        edges.append({"source": a, "target": b, "relation": relation})

    for topic, info in KNOWLEDGE_GRAPH.items():
        topic_id = "topic:" + topic
        add_node(topic_id, topic, "topic")

        # Topic -> Body system
        sys_id = "system:" + info["body_system"]
        add_node(sys_id, info["body_system"], "system")
        add_edge(topic_id, sys_id, "part of")

        # Symptoms -> Topic
        for sym in info["symptoms"]:
            sym_id = "symptom:" + sym
            add_node(sym_id, sym, "symptom")
            add_edge(sym_id, topic_id, "indicates")

        # Topic -> Tests
        for test in info["tests"]:
            test_id = "test:" + test
            add_node(test_id, test, "test")
            add_edge(topic_id, test_id, "diagnosed by")

        # Topic -> Specialist
        spec_id = "specialist:" + info["specialist"]
        add_node(spec_id, info["specialist"], "specialist")
        add_edge(topic_id, spec_id, "treated by")

        # Specialist -> Facilities
        for fac in info["facilities"]:
            fac_id = "facility:" + fac
            add_node(fac_id, fac, "facility")
            add_edge(spec_id, fac_id, "available at")

    return {"nodes": nodes, "edges": edges, "types": NODE_TYPE_COLORS}

# ---------- Health Score ----------
@api.post("/health-score/calculate")
async def calculate_health_score(inp: HealthScoreIn, user=Depends(current_user)):
    """Calculate personalized health score based on lifestyle factors."""
    score = 100.0
    
    # Sleep (ideal: 7-9 hours)
    if inp.sleep_hours < 5 or inp.sleep_hours > 10:
        score -= 15
    elif inp.sleep_hours < 6 or inp.sleep_hours > 9:
        score -= 8
    elif inp.sleep_hours < 7:
        score -= 3
    
    # Water intake (ideal: 6-8 glasses)
    if inp.water_glasses < 4:
        score -= 12
    elif inp.water_glasses < 6:
        score -= 6
    elif inp.water_glasses > 10:
        score -= 2
    
    # BMI (ideal: 18.5-24.9)
    if inp.bmi < 16 or inp.bmi > 35:
        score -= 15
    elif inp.bmi < 18.5 or inp.bmi >= 30:
        score -= 8
    elif inp.bmi >= 25:
        score -= 4
    
    # Heart rate (ideal: 60-100 bpm)
    if inp.heart_rate < 40 or inp.heart_rate > 140:
        score -= 10
    elif inp.heart_rate < 50 or inp.heart_rate > 110:
        score -= 5
    elif inp.heart_rate > 100:
        score -= 2
    
    # Exercise (ideal: 150+ min/week or ~30min/day)
    if inp.exercise_minutes < 10:
        score -= 15
    elif inp.exercise_minutes < 20:
        score -= 8
    elif inp.exercise_minutes < 30:
        score -= 3
    
    # Stress (ideal: 1-3 out of 10)
    if inp.stress_level >= 8:
        score -= 15
    elif inp.stress_level >= 6:
        score -= 8
    elif inp.stress_level >= 4:
        score -= 3
    
    # Diet quality (ideal: 4-5 out of 5)
    if inp.diet_quality <= 1:
        score -= 15
    elif inp.diet_quality <= 2:
        score -= 8
    elif inp.diet_quality <= 3:
        score -= 3
    
    score = max(0, min(100, round(score, 1)))
    
    # Generate tips
    tips = []
    if inp.sleep_hours < 7:
        tips.append("Try to get 7-9 hours of sleep. Establish a consistent bedtime routine.")
    if inp.water_glasses < 6:
        tips.append("Increase water intake to 6-8 glasses daily. Keep a water bottle handy.")
    if inp.bmi < 18.5 or inp.bmi >= 25:
        tips.append("Work towards a healthy BMI (18.5-24.9) with balanced diet and exercise.")
    if inp.exercise_minutes < 30:
        tips.append("Aim for at least 30 minutes of moderate exercise daily.")
    if inp.stress_level >= 5:
        tips.append("Practice stress management: meditation, deep breathing, or gentle walks.")
    if inp.diet_quality <= 3:
        tips.append("Include more fruits, vegetables, lean protein, and whole grains in your diet.")
    if inp.heart_rate > 100:
        tips.append("Monitor your resting heart rate. Consider cardiovascular exercise to lower it.")
    if not tips:
        tips.append("Great work! Maintain your healthy habits and stay consistent.")
    
    # Determine category
    if score >= 85:
        category = "Excellent"
    elif score >= 70:
        category = "Good"
    elif score >= 50:
        category = "Fair"
    else:
        category = "Needs Improvement"
    
    return {
        "score": score,
        "category": category,
        "tips": tips,
        "breakdown": {
            "sleep": {"score": max(0, 15 - (15 * abs(inp.sleep_hours - 7.5) / 3)), "value": inp.sleep_hours},
            "water": {"score": max(0, 12 - (2 * abs(inp.water_glasses - 7))), "value": inp.water_glasses},
            "bmi": {"score": max(0, 15 - (3 * abs(inp.bmi - 22) / 5)), "value": inp.bmi},
            "heart_rate": {"score": max(0, 10 - (0.2 * abs(inp.heart_rate - 72))), "value": inp.heart_rate},
            "exercise": {"score": max(0, 15 - (0.5 * abs(inp.exercise_minutes - 30))), "value": inp.exercise_minutes},
            "stress": {"score": max(0, 15 - (2 * inp.stress_level)), "value": inp.stress_level},
            "diet": {"score": max(0, 15 - (4 * (5 - inp.diet_quality))), "value": inp.diet_quality},
        }
    }

# ---------- Family Healthcare Dashboard ----------
@api.get("/family")
async def list_family(user=Depends(current_user)):
    """List all family members for the current user."""
    return await db.family_members.find({"user_id": user["id"]})

@api.post("/family")
async def add_family_member(inp: FamilyMemberIn, user=Depends(current_user)):
    """Add a family member."""
    member = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": inp.name,
        "relationship": inp.relationship,
        "age": inp.age,
        "gender": inp.gender,
        "blood_group": inp.blood_group,
        "medical_history": inp.medical_history,
        "allergies": inp.allergies,
        "medications": inp.medications,
        "vaccination_schedule": inp.vaccination_schedule,
        "contact_number": inp.contact_number,
        "emergency_contact_phone": inp.emergency_contact_phone,
        "created_at": now_iso()
    }
    await db.family_members.insert_one(member)
    return member

@api.delete("/family/{fid}")
async def delete_family_member(fid: str, user=Depends(current_user)):
    """Delete a family member."""
    await db.family_members.delete_one({"id": fid, "user_id": user["id"]})
    return {"ok": True}

@api.put("/family/{fid}")
async def update_family_member(fid: str, inp: FamilyMemberIn, user=Depends(current_user)):
    """Update a family member."""
    update_data = inp.model_dump(exclude_none=True)
    update_data["updated_at"] = now_iso()
    res = await db.family_members.update_one({"id": fid, "user_id": user["id"]}, {"$set": update_data})
    if not res.matched_count:
        raise HTTPException(404, "Family member not found")
    return await db.family_members.find_one({"id": fid})

# ---------- Emergency Detection ----------
@api.post("/emergency/trigger")
async def trigger_emergency(inp: EmergencyAlertIn, user=Depends(current_user)):
    """Handle emergency detection alert from the frontend."""
    contacts = await db.contacts.find({"user_id": user["id"]})
    profile = user.get("profile", {})
    
    alert_types = {
        "fall": "🚨 Fall detected! The user may have fallen and needs immediate assistance.",
        "no_movement": "⚠️ No movement detected. The user may be unconscious or injured.",
        "high_heart_rate": f"💓 Critical heart rate alert: {inp.heart_rate or 'Unknown'} BPM. Immediate medical attention may be needed."
    }
    
    message = alert_types.get(inp.type, "🚨 Emergency alert from CareAI")
    
    medical_info = ""
    if profile.get("medical_history"):
        medical_info += f"Medical History: {profile['medical_history']}. "
    if profile.get("allergies"):
        medical_info += f"Allergies: {profile['allergies']}. "
    if profile.get("chronic_diseases"):
        medical_info += f"Chronic Conditions: {profile['chronic_diseases']}. "
    if profile.get("blood_group"):
        medical_info += f"Blood Group: {profile['blood_group']}. "
    
    location_info = ""
    if inp.location_lat and inp.location_lng:
        location_info = f"📍 Location: https://www.google.com/maps?q={inp.location_lat},{inp.location_lng}"
    
    # Log the emergency
    emergency_log = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "type": inp.type,
        "message": message,
        "location_lat": inp.location_lat,
        "location_lng": inp.location_lng,
        "heart_rate": inp.heart_rate,
        "created_at": now_iso(),
        "contacts_notified": [c.get("phone") for c in contacts if c.get("phone")],
        "medical_info": medical_info,
        "location_info": location_info
    }
    
    # Return emergency details that the frontend can use to trigger calls/SMS
    return {
        "emergency": emergency_log,
        "message": message,
        "contacts": [
            {"name": c["name"], "phone": c["phone"]} for c in contacts if c.get("phone")
        ],
        "medical_info": medical_info.strip(),
        "location_info": location_info,
        "alert_message": f"{message}\n\nPatient: {user.get('full_name', 'Unknown')}\n{medical_info}\n{location_info}"
    }

@api.get("/emergency/history")
async def emergency_history(user=Depends(current_user)):
    """Get emergency alert history."""
    return []  # Simplified - could store in DB for production

# ---------- Chatbot with Medical History ----------
SYSTEM_MSG = """You are CareAI, a warm, friendly, and knowledgeable AI health assistant.
You help users understand symptoms, medicines, wellness, and general health questions.
Guidelines:
- Always be warm, empathetic, and reassuring.
- Provide clear, accurate, and practical health information.
- Clearly state that you are informational only and NOT a substitute for professional medical advice.
- For urgent or emergency symptoms (chest pain, difficulty breathing, severe bleeding, etc.), advise seeking emergency care immediately.
- Do not diagnose definitively; suggest possible causes and next steps.
- Keep responses concise, well-structured, and easy to read.
"""

# ---------- AI Copilot Modes ----------
CARE_MODE_PROMPTS = {
    "health": """You are CareAI in "Health Q&A" mode. Answer general health questions clearly and
accurately. Explain conditions, treatments, and healthy habits in plain language. Keep it reassuring
and informational. Never diagnose definitively; suggest possible causes and next steps.
Always remind the user to consult a healthcare professional for personal medical advice.""",
    "symptoms": """You are CareAI in "Symptom Guide" mode. Help the user organize their symptoms.
Ask clarifying questions one at a time if needed, then summarize the symptoms, suggest possible
considerations, and provide clear next steps (monitoring, when to see a doctor, and when it is an
emergency). Be structured and use bullet points. Do not diagnose; suggest possibilities only.""",
    "report": """You are CareAI in "Report Explainer" mode. The user will paste or describe parts of a
medical report or lab results. Explain the values, terms, and findings in simple, easy-to-understand
language. Use friendly analogies. Clarify what is normal vs. out of range, but always state that
only a qualified doctor can interpret results and give treatment advice.""",
    "medicine": """You are CareAI in "Medicine Information" mode. Explain general information about
medicines: what they are commonly used for, typical dosage guidance, possible side effects, and
interactions. Always state that dosing and usage must be confirmed by a doctor or pharmacist, and
that this is educational information only. Never encourage self-medication.""",
    "wellness": """You are CareAI in "Mental Wellness" mode. Offer warm, supportive guidance on stress,
anxiety, sleep, and general wellbeing. Provide practical, evidence-informed tips and gentle
encouragement. Be empathetic and non-judgmental. If the user expresses crisis or self-harm thoughts,
urge them to contact emergency services or a trusted crisis line immediately.""",
    "doctor": """You are CareAI in "Doctor Preparation" mode. Help the user prepare for an upcoming
doctor's appointment. Help them organize their symptoms, medical history, medications, and concerns,
and suggest thoughtful questions to ask the doctor. Output a clear, structured list they can take
with them. Remind them to share this with their actual healthcare provider.""",
}

# ---------- Chat Sessions ----------
@api.get("/chat/sessions")
async def list_chat_sessions(user=Depends(current_user)):
    """List all chat sessions for the current user, newest first."""
    sessions = await db.chat_sessions.find({"user_id": user["id"]})
    sessions.sort(key=lambda s: s.get("updated_at", ""), reverse=True)
    return sessions

@api.post("/chat/session")
async def create_chat_session(user=Depends(current_user)):
    """Create a new chat session for the current user."""
    session = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "title": "New chat",
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.chat_sessions.insert_one(session)
    return session

@api.get("/chat/{session_id}/messages")
async def get_chat_messages(session_id: str, user=Depends(current_user)):
    """Fetch all messages for a chat session."""
    session = await db.chat_sessions.find_one({"id": session_id, "user_id": user["id"]})
    if not session:
        raise HTTPException(404, "Session not found")
    messages = await db.chat_messages.find({"session_id": session_id})
    return messages

@api.delete("/chat/{session_id}")
async def delete_chat_session(session_id: str, user=Depends(current_user)):
    """Delete a chat session and all its messages."""
    await db.chat_sessions.delete_one({"id": session_id, "user_id": user["id"]})
    await db.chat_messages.delete_many({"session_id": session_id})
    return {"ok": True}


# ---------- Local AI fallback (no OpenAI key required) ----------
def local_health_reply(text: str, language: str = "english") -> str:
    t = (text or "").lower()
    urgent = ["chest pain", "difficulty breathing", "shortness of breath", "severe bleeding",
              "unconscious", "stroke", "heart attack", "can't breathe", "squeezing chest"]
    if any(k in t for k in urgent):
        if language == "hindi":
            return ("⚠️ यह लक्षण गंभीर हो सकते हैं। कृपया तुरंत नजदीकी आपातकालीन सेवा को कॉल करें "
                    "या सीधे अस्पताल जाएँ। ऑनलाइन उत्तर का इंतज़ार न करें।\n\n"
                    "अगर कोई आपके साथ है, तो उसे साथ रहने के लिए कहें। यह जानकारी केवल शैक्षिक है और "
                    "आपातकालीन चिकित्सा सलाह का विकल्प नहीं है।")
        if language == "hinglish":
            return ("⚠️ Yeh symptoms serious ho sakte hain. Please turant emergency services ko call karein "
                    "ya nearest hospital chale jaayein. Online reply ka intezar mat karein.\n\n"
                    "Agar koi aapke saath hai, to use saath rehne ko kahe. Yeh message sirf informational hai, "
                    "medical advice nahi hai.")
        return ("⚠️ That combination of symptoms can be serious. Please call emergency services "
                "or go to the nearest emergency room right away. Do not wait for an online response.\n\n"
                "If someone is with you, ask them to stay with you until help arrives. "
                "This message is informational only and not a substitute for urgent medical care.")
    for key, info in MEDICINE_DB.items():
        if key in t or info["name"].split(" (")[0].lower() in t:
            return ("**%s**\n\n• Uses: %s\n• Dosage: %s\n• Side effects: %s\n"
                    "• Interactions: %s\n• Storage: %s\n\n"
                    "Always follow your doctor or pharmacist's instructions and the label. "
                    "This is educational information, not medical advice." % (
                        info["name"], info["uses"], info["dosage"], info["side_effects"],
                        ", ".join(info["drug_interactions"]), info["storage"]))
    user_syms = set(t.split())
    best = None
    for disease, info in SYMPTOM_DB.items():
        hits = user_syms & set(info["symptoms"])
        if hits and (best is None or len(hits) > best[1]):
            best = (disease, len(hits), info)
    if best:
        disease, _, info = best
        return ("Based on the symptoms you described, a possible consideration is **%s** "
                "(%s severity).\n\n• Common symptoms: %s\n• Specialist to see: %s\n"
                "• Possible tests: %s\n\nThis is a heuristic suggestion, not a diagnosis. "
                "Please consult a qualified healthcare professional for a proper evaluation." % (
                    disease, info["severity"], ", ".join(info["symptoms"]),
                    info["specialist"], ", ".join(info["tests"])))
    if any(g in t for g in ["hello", "hi ", "hi!", "hey", "good morning", "good evening"]):
        return ("Hello! 👋 I'm CareAI, your warm health assistant. I can help you with:\n\n"
                "• Understanding symptoms\n• Learning about medicines\n• Wellness and healthy habits\n\n"
                "What would you like to talk about today? (Remember, I'm here for guidance, not diagnosis.)")
    return ("I'm CareAI, your health guidance assistant. I can help you understand symptoms, "
            "learn about medicines, and get wellness tips.\n\n"
            "For example, you could ask: \"What is paracetamol used for?\" or "
            "\"I have a headache and nausea - what might that be?\"\n\n"
            "Please note this is informational guidance only and not a substitute for "
            "professional medical advice. For emergencies, always call your local emergency services.")


@api.post("/chat/message")
async def chat_message(inp: ChatMsgIn, user=Depends(current_user)):
    session = await db.chat_sessions.find_one({"id": inp.session_id, "user_id": user["id"]})
    if not session:
        raise HTTPException(404, "Session not found")

    await db.chat_messages.insert_one({
        "session_id": inp.session_id, "role": "user", "content": inp.text, "created_at": now_iso()
    })

    history = await db.chat_messages.find({"session_id": inp.session_id})
    history_list = history[-20:]

    # Get user profile for personalized context
    profile = user.get("profile", {})
    profile_context = ""
    if profile:
        parts = []
        if profile.get("medical_history"):
            parts.append(f"Medical History: {profile['medical_history']}")
        if profile.get("allergies"):
            parts.append(f"Allergies: {profile['allergies']}")
        if profile.get("current_medications"):
            parts.append(f"Current Medications: {profile['current_medications']}")
        if profile.get("chronic_diseases"):
            parts.append(f"Chronic Conditions: {profile['chronic_diseases']}")
        if profile.get("age"):
            parts.append(f"Age: {profile['age']}")
        if profile.get("blood_group"):
            parts.append(f"Blood Group: {profile['blood_group']}")
        if profile.get("gender"):
            parts.append(f"Gender: {profile['gender']}")
        if parts:
            profile_context = "\nUser Health Profile:\n" + "\n".join(parts)

    # Select mode-specific system prompt (default to health Q&A)
    mode_prompt = CARE_MODE_PROMPTS.get(inp.mode, CARE_MODE_PROMPTS["health"])

    language_prompt = ""
    if inp.language == "hindi":
        language_prompt = "Respond in Hindi using clear and friendly language. Keep the answer culturally familiar and easy to understand."
    elif inp.language == "hinglish":
        language_prompt = "Respond in Hinglish, mixing Hindi and English naturally. Keep the answer friendly, simple, and easy to understand."
    else:
        language_prompt = "Respond in English using clear and friendly language."

    system_with_context = SYSTEM_MSG + "\n" + mode_prompt + "\n" + language_prompt + profile_context + """
\nThis user's health profile is provided above. Use this information to give personalized advice.
Consider their medical history, allergies, and current medications when responding.
Always remind the user that this is informational and not a substitute for professional medical advice."""

    openai_messages = [{"role": "system", "content": system_with_context}]
    for m in history_list:
        role = "user" if m["role"] == "user" else "assistant"
        openai_messages.append({"role": role, "content": m["content"]})

    async def event_gen():
        full = ""
        if not HAS_OPENAI:
            full = local_health_reply(inp.text, inp.language)
            for i in range(0, len(full), 16):
                yield f"data: {full[i:i+16]}\n\n"
            await asyncio.sleep(0.05)
            yield "data: [DONE]\n\n"
            await db.chat_messages.insert_one({
                "session_id": inp.session_id, "role": "assistant", "content": full, "created_at": now_iso()
            })
            title_update = {"updated_at": now_iso()}
            if session.get("title") in (None, "New chat"):
                title_update["title"] = inp.text[:40]
            await db.chat_sessions.update_one({"id": inp.session_id}, {"$set": title_update})
            return
        client_openai = AsyncOpenAI(api_key=OPENAI_API_KEY)
        try:
            stream = await client_openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=openai_messages,
                max_tokens=4096,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta if chunk.choices else None
                if delta and delta.content:
                    full += delta.content
                    yield f"data: {delta.content}\n\n"
        except Exception as e:
            logger.exception("chat stream error")
            full = full or local_health_reply(inp.text)
            yield f"data: {full}\n\n"
        await db.chat_messages.insert_one({
            "session_id": inp.session_id, "role": "assistant", "content": full, "created_at": now_iso()
        })
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


@api.post('/admin/reminders/{reminder_id}/trigger')
async def admin_trigger(reminder_id: str):
    r = await db.reminders.find_one({"id": reminder_id})
    if not r:
        return JSONResponse({"error": "not found"}, status_code=404)
    await trigger_reminder(r)
    await db.reminders.update_one({"id": reminder_id}, {"$set": {"last_triggered": now_iso()}})
    return {"status": "triggered"}

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


async def trigger_reminder(rem: dict):
    """Trigger a reminder: make a call via Twilio if configured, otherwise log."""
    title = rem.get('title')
    notes = rem.get('notes') or ""
    message = f"Reminder: {title}. {notes}".strip()
    to = rem.get('contact_phone')
    user_id = rem.get('user_id')
    notif = {"reminder_id": rem.get('id'), "user_id": user_id, "message": message, "status": "pending", "created_at": now_iso()}
    async def save_notification(status, detail=None):
        n = {**notif, "status": status, "detail": detail or "", "sent_at": now_iso()}
        await db.notifications.insert_one(n)

    if HAS_TWILIO and to:
        client = TwilioClient(TWILIO_SID, TWILIO_TOKEN)
        try:
            # Attempt a voice call first
            twiml = f"<Response><Say voice=\"alice\">{message}</Say></Response>"
            client.calls.create(twiml=twiml, to=to, from_=TWILIO_FROM)
            logger.info("Triggered Twilio call to %s for reminder %s", to, rem.get('id'))
            await save_notification("sent", "call")
            return
        except Exception:
            logger.exception("Twilio call failed, attempting SMS for reminder %s", rem.get('id'))
            # fall through to try SMS
        try:
            client.messages.create(body=message, to=to, from_=TWILIO_FROM)
            logger.info("Triggered Twilio SMS for reminder %s", rem.get('id'))
            await save_notification("sent", "sms")
            return
        except Exception:
            logger.exception("Failed to send Twilio SMS for reminder %s", rem.get('id'))
            await save_notification("failed", "twilio_error")
            return
    else:
        logger.info("Reminder (no Twilio): %s", message)
        await save_notification("logged", "no_twilio")


async def reminder_worker():
    logger.info("Starting reminder worker")
    while True:
        try:
            reminders = await db.reminders.find()
            now = datetime.now(timezone.utc).astimezone()
            hhmm = now.strftime("%H:%M")
            today_date = now.strftime("%Y-%m-%d")
            today_name = now.strftime("%a")
            for r in reminders:
                try:
                    if not r.get('enabled', True):
                        continue
                    last = r.get('last_triggered')
                    # recurring on specific days
                    if r.get('days'):
                        if today_name in r.get('days', []) and last != today_date and r.get('schedule_time') == hhmm:
                            await trigger_reminder(r)
                            await db.reminders.update_one({"id": r['id']}, {"$set": {"last_triggered": today_date}})
                            # record an event in notifications collection if not already created
                            await db.notifications.insert_one({"reminder_id": r.get('id'), "user_id": r.get('user_id'), "message": f"Triggered reminder {r.get('id')}", "status": "triggered", "created_at": now_iso()})
                    else:
                        # one-off reminder
                        if not last and r.get('schedule_time') == hhmm:
                            await trigger_reminder(r)
                            await db.reminders.update_one({"id": r['id']}, {"$set": {"last_triggered": today_date}})
                            await db.notifications.insert_one({"reminder_id": r.get('id'), "user_id": r.get('user_id'), "message": f"Triggered reminder {r.get('id')}", "status": "triggered", "created_at": now_iso()})
                except Exception:
                    logger.exception("Error processing reminder %s", r.get('id'))
        except Exception:
            logger.exception("Reminder worker failure")
        await asyncio.sleep(60)


@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(reminder_worker())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
