from sqlalchemy.orm import Session
from decimal import Decimal

class StatsService:
    @staticmethod
    def calculate_price_badge(current_price: Decimal) -> str:
        # MVP Logic: Simplified logic for recurrent/low prices.
        # In a real scenario, this would aggregate historical data from `price_records`.
        if current_price < Decimal('10.00'):
            return "Abaixo da Média"
        return "Preço Recorrente"
