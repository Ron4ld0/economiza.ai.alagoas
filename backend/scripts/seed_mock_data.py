import os
import sys
from decimal import Decimal
import random
import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.core.database import engine, Base, SessionLocal
from src.models.establishments import Establishment
from src.models.products_master import ProductMaster
from src.models.price_records import PriceRecord
from src.models.users import User

def seed():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    print("Checking if data already exists...")
    if db.query(ProductMaster).first():
        print("Data already exists. Skipping seed.")
        return

    print("Seeding Establishments...")
    # Mocking coordinates around Maceió Centro: lat = -9.6659, lng = -35.7350
    # point format: POINT(lng lat)
    estabs = [
        Establishment(
            cnpj="00000000000191",
            corporate_name="Mercado Central de Maceió",
            trade_name="Mercadão Centro",
            address="Rua do Comércio, 100, Centro, Maceió - AL",
            location="POINT(-35.7350 -9.6659)"
        ),
        Establishment(
            cnpj="00000000000292",
            corporate_name="Supermercado Ponta Verde",
            trade_name="Super Ponta Verde",
            address="Av. Silvio Carlos Viana, 500, Ponta Verde, Maceió - AL",
            location="POINT(-35.7011 -9.6640)"
        ),
        Establishment(
            cnpj="00000000000393",
            corporate_name="Atacadão Tabuleiro",
            trade_name="Atacado Tabuleiro",
            address="Av. Durval de Góes Monteiro, 3000, Tabuleiro, Maceió - AL",
            location="POINT(-35.7533 -9.5898)"
        )
    ]
    db.add_all(estabs)
    db.commit()

    print("Seeding Products...")
    prods = [
        ProductMaster(
            gtin_ean="7891000100103",
            canonical_name="Leite Integral Parmalat 1L"
        ),
        ProductMaster(
            gtin_ean="7891010041289",
            canonical_name="Café Torrado e Moído Pilão 500g"
        ),
        ProductMaster(
            gtin_ean="7894900700046",
            canonical_name="Refrigerante Coca-Cola 2L"
        )
    ]
    db.add_all(prods)
    db.commit()

    print("Seeding Prices...")
    now = datetime.datetime.utcnow()
    prices = [
        # Leite
        PriceRecord(product_id=prods[0].id, establishment_id=estabs[0].id, unit_price=Decimal("5.50"), raw_description="LEITE INT PARMALAT 1L", issued_at=now),
        PriceRecord(product_id=prods[0].id, establishment_id=estabs[1].id, unit_price=Decimal("6.20"), raw_description="LEITE PARMALAT 1L", issued_at=now),
        PriceRecord(product_id=prods[0].id, establishment_id=estabs[2].id, unit_price=Decimal("4.99"), raw_description="LT PARMALAT INTEGRAL 1L", issued_at=now),
        
        # Café
        PriceRecord(product_id=prods[1].id, establishment_id=estabs[0].id, unit_price=Decimal("15.90"), raw_description="CAFE PILAO 500G", issued_at=now),
        PriceRecord(product_id=prods[1].id, establishment_id=estabs[1].id, unit_price=Decimal("17.50"), raw_description="CAFE TRAD PILAO 500G", issued_at=now),
        
        # Coca
        PriceRecord(product_id=prods[2].id, establishment_id=estabs[0].id, unit_price=Decimal("8.99"), raw_description="COCA COLA 2L PET", issued_at=now),
        PriceRecord(product_id=prods[2].id, establishment_id=estabs[2].id, unit_price=Decimal("7.89"), raw_description="REFRIGERANTE COCA COLA 2L", issued_at=now)
    ]
    db.add_all(prices)
    db.commit()
    
    print("Seed completed successfully!")

if __name__ == "__main__":
    seed()
