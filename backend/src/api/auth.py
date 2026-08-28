from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.users import User
import jwt
import datetime
import random
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Auth"])

SECRET_KEY = "my_super_secret_key_for_economiza_ai"
ALGORITHM = "HS256"

# Em memória para MVP (Ideal: Redis ou Tabela no DB com TTL)
email_codes = {}

class EmailRequest(BaseModel):
    email: str
    name: Optional[str] = None

class EmailVerify(BaseModel):
    email: str
    code: str

class GoogleLogin(BaseModel):
    id_token: str
    email: str
    name: str
    google_id: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/email/request")
def request_email_code(req: EmailRequest, db: Session = Depends(get_db)):
    if not req.email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    code = str(random.randint(100000, 999999))
    email_codes[req.email] = {
        "code": code,
        "name": req.name
    }
    
    # Simula o envio do e-mail imprimindo no terminal
    print("="*50)
    print(f"📧 EMAIL MOCK SEND 📧")
    print(f"To: {req.email}")
    print(f"Subject: Seu código de acesso - Economiza.AI")
    print(f"Body: Seu código é {code}")
    print("="*50)
    
    return {"message": "Código enviado para o e-mail (ver terminal)"}

@router.post("/email/verify")
def verify_email_code(req: EmailVerify, db: Session = Depends(get_db)):
    record = email_codes.get(req.email)
    
    if not record or record["code"] != req.code:
        raise HTTPException(status_code=401, detail="Código inválido ou expirado")
        
    # Check if user exists
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user:
        # Create user
        user = User(email=req.email, name=record.get("name"))
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Remove code after use
    del email_codes[req.email]
        
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "user": {"id": str(user.id), "name": user.name, "email": user.email}}

@router.post("/google")
def google_sso(req: GoogleLogin, db: Session = Depends(get_db)):
    # Aqui validaríamos o id_token real do Google, mas para MVP vamos confiar no payload do frontend
    user = db.query(User).filter(User.email == req.email).first()
    
    if not user:
        user = User(email=req.email, name=req.name, google_id=req.google_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.google_id = req.google_id
        user.name = req.name
        db.commit()
        db.refresh(user)
        
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "user": {"id": str(user.id), "name": user.name, "email": user.email}}
