import requests

try:
    print("Testing Assistant API endpoint...")
    response = requests.post(
        "http://localhost:8000/api/v1/assistant/chat",
        json={"text": "Onde encontro o arroz mais barato?"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Connection Error: {e}")
