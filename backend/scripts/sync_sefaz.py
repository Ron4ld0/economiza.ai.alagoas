import os
import sys
import json
import uuid
import datetime
import requests
from decimal import Decimal
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from src.core.database import SessionLocal
from src.models.establishments import Establishment
from src.models.products_master import ProductMaster
from src.models.price_records import PriceRecord

load_dotenv()
TOKEN = os.getenv("SEFAZ_AL_APP_TOKEN")
API_URL = "http://api.sefaz.al.gov.br/sfz-economiza-alagoas-api/api/public/produto/pesquisa"

KEYWORDS = [
    "LEITE", "ARROZ", "FEIJAO", "CAFE", "CERVEJA", 
    "COCA COLA", "CARNE", "OLEO", "ACUCAR", "MACARRAO", 
    "LINGUICA", "CARVAO", "SABONETE"
]

def fetch_keyword(db: Session, keyword: str):
    print(f"Buscando produtos com a palavra: {keyword}...")
    headers = {
        "AppToken": TOKEN,
        "Content-Type": "application/json"
    }
    
    # Coordinates for center of Maceió roughly, 15km radius
    payload = {
        "produto": {
            "descricao": keyword
        },
        "estabelecimento": {
            "geolocalizacao": {
                "latitude": -9.66599,
                "longitude": -35.735,
                "raio": 15
            }
        },
        "dias": 3,
        "pagina": 1,
        "registrosPorPagina": 100
    }
    
    response = requests.post(API_URL, json=payload, headers=headers)
    if response.status_code != 200:
        print(f"Erro ao buscar {keyword}: {response.text}")
        return
        
    data = response.json()
    items = data.get("conteudo", [])
    if not items:
        print(f"Nenhum produto encontrado para: {keyword}")
        return
        
    print(f"Encontrados {len(items)} registros para {keyword}. Ingerindo no banco de dados...")
    
    new_establishments = 0
    new_products = 0
    new_prices = 0

    for item in items:
        # 1. Establishment
        est_data = item.get("estabelecimento", {})
        cnpj = est_data.get("cnpj")
        if not cnpj: continue
        
        # Get address details
        address_dict = est_data.get("endereco") or est_data.get("endereço") or {}
        lat = address_dict.get("latitude")
        lng = address_dict.get("longitude")
        if lat is None or lng is None: continue
        
        est = db.query(Establishment).filter(Establishment.cnpj == cnpj).first()
        if not est:
            address_str = f"{address_dict.get('nomeLogradouro', '')}, {address_dict.get('numeroImovel', '')} - {address_dict.get('bairro', '')}"
            est = Establishment(
                id=uuid.uuid4(),
                cnpj=cnpj,
                corporate_name=est_data.get("razaoSocial", ""),
                trade_name=est_data.get("nomeFantasia", ""),
                address=address_str,
                location=f"SRID=4326;POINT({lng} {lat})"
            )
            db.add(est)
            db.flush() # flush to get the id
            new_establishments += 1
            
        # 2. Product
        prod_data = item.get("produto", {})
        gtin = prod_data.get("gtin") or prod_data.get("codigo") # Fallback if no GTIN
        if not gtin: continue
        
        prod = db.query(ProductMaster).filter(ProductMaster.gtin_ean == gtin).first()
        if not prod:
            prod = ProductMaster(
                id=uuid.uuid4(),
                gtin_ean=gtin,
                canonical_name=prod_data.get("descricao", "Produto Desconhecido"),
                category="Geral"
            )
            db.add(prod)
            db.flush()
            new_products += 1
            
        # 3. Price Record
        venda_data = prod_data.get("venda", {})
        valor_venda = venda_data.get("valorVenda")
        data_venda_str = venda_data.get("dataVenda")
        
        if valor_venda and data_venda_str:
            # Simple deduplication: Check if exactly the same record exists
            try:
                # SEFAZ format: 2018-10-11T13:51:47Z
                if data_venda_str.endswith("Z"):
                    data_venda_str = data_venda_str[:-1] + "+00:00"
                issued_at = datetime.datetime.fromisoformat(data_venda_str)
                
                # Check if we already have this exact price record (avoid duplicates on repeated runs)
                # We can't rely on uniqueness of (product_id, establishment_id) because prices change.
                # But for the same timestamp, it's a duplicate.
                existing_price = db.query(PriceRecord).filter(
                    PriceRecord.establishment_id == est.id,
                    PriceRecord.product_id == prod.id,
                    PriceRecord.issued_at == issued_at
                ).first()
                
                if not existing_price:
                    price = PriceRecord(
                        establishment_id=est.id,
                        product_id=prod.id,
                        raw_description=prod_data.get("descricao", ""),
                        unit_price=Decimal(str(valor_venda)),
                        issued_at=issued_at
                    )
                    db.add(price)
                    new_prices += 1
            except Exception as e:
                print(f"Erro ao parsear preço/data: {e}")
                
    db.commit()
    print(f"-> Sucesso para '{keyword}': +{new_establishments} lojas, +{new_products} produtos, +{new_prices} preços!\n")

def sync_sefaz():
    if not TOKEN:
        print("Erro: SEFAZ_AL_APP_TOKEN não configurado no .env")
        return
        
    db: Session = SessionLocal()
    print("Iniciando Sincronização com API SEFAZ-AL...")
    for kw in KEYWORDS:
        fetch_keyword(db, kw)
        
    db.close()
    print("Sincronização Finalizada!")

if __name__ == "__main__":
    sync_sefaz()
