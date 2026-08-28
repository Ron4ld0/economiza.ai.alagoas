from sqlalchemy.orm import Session
from sqlalchemy import func
from src.models.establishments import Establishment
from src.models.price_records import PriceRecord
from src.models.products_master import ProductMaster
from src.services.stats_service import StatsService

class FeedService:
    @staticmethod
    def get_feed(db: Session, lat: float, lng: float, radius_km: float, category: str = None, sort_by: str = "price_asc"):
        radius_degrees = radius_km / 111.0
        point = f'POINT({lng} {lat})'
        
        query = (
            db.query(
                PriceRecord, 
                Establishment, 
                ProductMaster,
                func.ST_Distance(Establishment.location, func.ST_GeomFromText(point, 4326)).label("distance_deg")
            )
            .join(Establishment, PriceRecord.establishment_id == Establishment.id)
            .join(ProductMaster, PriceRecord.product_id == ProductMaster.id)
            .filter(func.ST_DWithin(Establishment.location, func.ST_GeomFromText(point, 4326), radius_degrees))
        )

        if category and category.lower() != "todos":
            from sqlalchemy import or_
            cat_lower = category.lower()
            if cat_lower == "alimentação":
                query = query.filter(or_(
                    ProductMaster.canonical_name.ilike("%arroz%"),
                    ProductMaster.canonical_name.ilike("%feijão%"),
                    ProductMaster.canonical_name.ilike("%leite%"),
                    ProductMaster.canonical_name.ilike("%café%"),
                    ProductMaster.canonical_name.ilike("%açúcar%"),
                    ProductMaster.canonical_name.ilike("%óleo%"),
                    ProductMaster.canonical_name.ilike("%carne%"),
                    ProductMaster.canonical_name.ilike("%frango%"),
                    ProductMaster.canonical_name.ilike("%ovo%")
                ))
            elif cat_lower == "bebidas":
                query = query.filter(or_(
                    ProductMaster.canonical_name.ilike("%refrigerante%"),
                    ProductMaster.canonical_name.ilike("%cerveja%"),
                    ProductMaster.canonical_name.ilike("%suco%"),
                    ProductMaster.canonical_name.ilike("%água%")
                ))
            elif cat_lower == "limpeza":
                query = query.filter(or_(
                    ProductMaster.canonical_name.ilike("%sabão%"),
                    ProductMaster.canonical_name.ilike("%detergente%"),
                    ProductMaster.canonical_name.ilike("%amaciante%"),
                    ProductMaster.canonical_name.ilike("%desinfetante%")
                ))
            elif cat_lower == "higiene":
                query = query.filter(or_(
                    ProductMaster.canonical_name.ilike("%papel%"),
                    ProductMaster.canonical_name.ilike("%sabonete%"),
                    ProductMaster.canonical_name.ilike("%shampoo%"),
                    ProductMaster.canonical_name.ilike("%dental%")
                ))
            else:
                query = query.filter(ProductMaster.canonical_name.ilike(f"%{category}%"))
        else:
            # Filtro Inteligente para a aba "Todos": focar apenas em produtos essenciais
            from sqlalchemy import or_
            query = query.filter(or_(
                ProductMaster.canonical_name.ilike("%arroz%"),
                ProductMaster.canonical_name.ilike("%feijão%"),
                ProductMaster.canonical_name.ilike("%leite%"),
                ProductMaster.canonical_name.ilike("%café%"),
                ProductMaster.canonical_name.ilike("%açúcar%"),
                ProductMaster.canonical_name.ilike("%óleo%"),
                ProductMaster.canonical_name.ilike("%carne%"),
                ProductMaster.canonical_name.ilike("%frango%"),
                ProductMaster.canonical_name.ilike("%ovo%"),
                ProductMaster.canonical_name.ilike("%pão%"),
                ProductMaster.canonical_name.ilike("%papel higiênico%"),
                ProductMaster.canonical_name.ilike("%sabão em pó%"),
                ProductMaster.canonical_name.ilike("%detergente%"),
                ProductMaster.canonical_name.ilike("%macarrão%"),
                ProductMaster.canonical_name.ilike("%manteiga%")
            )).filter(~ProductMaster.canonical_name.ilike("%bala%"))\
              .filter(~ProductMaster.canonical_name.ilike("%chiclete%"))\
              .filter(~ProductMaster.canonical_name.ilike("%doce%"))\
              .filter(~ProductMaster.canonical_name.ilike("%chocolate%"))\
              .filter(~ProductMaster.canonical_name.ilike("%caramelo%"))\
              .filter(~ProductMaster.canonical_name.ilike("%bombom%"))\
              .filter(~ProductMaster.canonical_name.ilike("%pirulito%"))
            
            # Filtro Anti-Tranqueira (ignorar itens muito baratos que costumam ser unitários inúteis)
            query = query.filter(PriceRecord.unit_price >= 2.50)
            
        # Determinar ordenação
        if sort_by == "relevance":
            # Heurística MVP para "Maior Desconto":
            # Ordena por uma fórmula pseudo-aleatória determinística baseada no ID do produto
            # para misturar os produtos essenciais e não ficar só os de 50 centavos no topo.
            from sqlalchemy import cast, String
            query = query.order_by(func.md5(cast(ProductMaster.id, String)))
        elif sort_by == "distance_asc":
            query = query.order_by("distance_deg", PriceRecord.unit_price)
        elif sort_by == "popular":
            query = query.order_by(ProductMaster.id, PriceRecord.unit_price)
        else:
            # Padrão: price_asc
            query = query.order_by(PriceRecord.unit_price, "distance_deg")

        records = query.limit(100).all()
        
        feed_items = []
        seen_products = set()
        
        for record, estab, product, distance_deg in records:
            if sort_by == "popular" and product.id in seen_products:
                # Se for "popular", queremos o produto 1x (preço mais barato na região)
                continue
                
            seen_products.add(product.id)
            distance_km = round(distance_deg * 111.0, 2) if distance_deg else 0.0
            badge = StatsService.calculate_price_badge(record.unit_price)
            
            feed_items.append({
                "id": str(record.id),
                "product_name": product.canonical_name,
                "raw_description": record.raw_description,
                "price": float(record.unit_price),
                "badge": badge,
                "distance_km": distance_km,
                "establishment": {
                    "name": estab.trade_name or estab.corporate_name,
                    "address": estab.address
                }
            })
            
            # Limitar os populares a 5
            if sort_by == "popular" and len(feed_items) == 5:
                break
                
            # Limitar os normais a 50
            if len(feed_items) == 50:
                break
                
        return feed_items
