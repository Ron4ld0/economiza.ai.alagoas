import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

try:
    print("Testing Google GenAI Interactions API...")
    api_key = os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    
    response = client.interactions.create(
        model='gemini-3.6-flash',
        config=types.InteractionConfig(
            system_instruction="You are a helpful assistant.",
            temperature=0.1,
            response_mime_type="application/json",
        ),
        contents="Say hello in JSON.",
    )
    print("Success:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Error: {e}")
