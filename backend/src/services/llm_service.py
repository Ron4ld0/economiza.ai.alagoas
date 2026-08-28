import json
from google import genai
from google.genai import types
from typing import Dict, Any, Optional
import os
from dotenv import load_dotenv

load_dotenv()
MODEL = "gemini-3.6-flash"

SYSTEM_PROMPT = """You are the AI assistant for "Economiza.AI Alagoas", an app that helps users save money on groceries.
Your only job is to classify the user's intent and extract parameters into a strict JSON format.

Supported Intents:
1. "calculate_template": User wants to plan a list/basket (e.g. Churrasco, Cesta Básica, Petiscos) for a specific number of people.
   - extract "template_name" (str): e.g. "Churrasco", "Cesta Básica", "Noite de Petiscos"
   - extract "people" (int): default to 4 if not specified
2. "search_product": User is asking for the price of a specific product.
   - extract "product_name" (str): e.g. "Arroz", "Cerveja"
3. "general_chat": Any other casual conversation or question.
   - extract "response" (str): your friendly reply.

You MUST respond with a valid JSON object, no markdown blocks, no extra text.

Example 1:
User: Quero fazer um churrasco para 10 pessoas
Response: {"action": "calculate_template", "template_name": "Churrasco", "people": 10}

Example 2:
User: Onde acho leite barato?
Response: {"action": "search_product", "product_name": "leite"}

Example 3:
User: Oi, como você pode me ajudar?
Response: {"action": "general_chat", "response": "Olá! Eu sou o assistente do Economiza.AI. Posso te ajudar a planejar um churrasco, montar uma cesta básica ou buscar preços de produtos pela região!"}
"""

def parse_intent(user_text: str) -> Dict[str, Any]:
    try:
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model=MODEL,
            contents=user_text,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.1,
                response_mime_type="application/json",
            )
        )
        
        content = response.text
        if not content:
            return {"action": "general_chat", "response": "Desculpe, não consegui entender."}
            
        parsed = json.loads(content)
        return parsed
    except Exception as e:
        print(f"LLM Error: {e}")
        return {"action": "general_chat", "response": "Estou enfrentando problemas técnicos de conexão com a inteligência artificial. Tente novamente mais tarde!"}

def format_bot_response(data: Dict[str, Any]) -> str:
    """Helper to convert structured backend data into a friendly bot string if needed"""
    return "Aqui estão os dados que você pediu!"
