import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from src.core.database import SessionLocal, engine
from src.models.templates import Template
from src.core.database import Base

def seed_templates():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    print("Checking if templates already exist...")
    if db.query(Template).first():
        print("Templates already exist. Skipping template seeding.")
        db.close()
        return

    print("Seeding Templates...")
    templates = [
        Template(
            name="Churrasco",
            category="Eventos",
            items=[
                {"name": "Carne (Picanha, Alcatra)", "base_qty": 0.4, "unit": "kg", "required": True},
                {"name": "Linguiça", "base_qty": 0.15, "unit": "kg", "required": True},
                {"name": "Carvão", "base_qty": 0.5, "unit": "kg", "required": True},
                {"name": "Cerveja", "base_qty": 1.5, "unit": "litros", "required": False},
                {"name": "Refrigerante", "base_qty": 0.5, "unit": "litros", "required": False},
                {"name": "Pão de Alho", "base_qty": 1.0, "unit": "unidades", "required": False},
            ]
        ),
        Template(
            name="Noite de Petiscos",
            category="Eventos",
            items=[
                {"name": "Amendoim", "base_qty": 0.1, "unit": "kg", "required": True},
                {"name": "Queijo Coalho/Provolone", "base_qty": 0.1, "unit": "kg", "required": True},
                {"name": "Batata Frita", "base_qty": 0.15, "unit": "kg", "required": True},
                {"name": "Bebidas Diversas", "base_qty": 1.0, "unit": "litros", "required": False},
            ]
        ),
        Template(
            name="Cesta Básica Individual (Mensal)",
            category="Essencial",
            items=[
                {"name": "Arroz", "base_qty": 5.0, "unit": "kg", "required": True},
                {"name": "Feijão", "base_qty": 3.0, "unit": "kg", "required": True},
                {"name": "Açúcar", "base_qty": 2.0, "unit": "kg", "required": True},
                {"name": "Café", "base_qty": 0.5, "unit": "kg", "required": True},
                {"name": "Óleo de Soja", "base_qty": 1.0, "unit": "litros", "required": True},
                {"name": "Leite", "base_qty": 4.0, "unit": "litros", "required": True},
                {"name": "Macarrão", "base_qty": 1.0, "unit": "kg", "required": True},
            ]
        )
    ]
    
    db.add_all(templates)
    db.commit()
    print(f"Successfully seeded {len(templates)} templates!")
    
    db.close()

if __name__ == "__main__":
    seed_templates()
