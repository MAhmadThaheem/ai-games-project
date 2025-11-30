import os
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

# --- CONFIGURATION ---
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("⚠️ WARNING: GEMINI_API_KEY not found in .env")
else:
    genai.configure(api_key=api_key)

def load_knowledge_base():
    """Reads the text file containing the AI's instructions."""
    try:
        # Calculate path: backend/app/services/ -> up to app -> into data -> file
        current_dir = Path(__file__).resolve().parent
        kb_path = current_dir.parent / "data" / "knowledge_base.txt"
        
        with open(kb_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"❌ Error loading knowledge base: {e}")
        # Fallback system prompt if file is missing
        return "You are Nexus, an AI assistant for AI Games Hub. Please answer questions about the site."

def get_nexus_response(user_message: str) -> str:
    """Calls Gemini API with the project context from file."""
    if not api_key:
        return "Error: Chatbot API Key missing on server configuration."
    
    try:
        # Load the latest prompt from the file every time a request comes in
        # (This allows you to edit the .txt file without restarting the server!)
        system_instruction = load_knowledge_base()
        # Create the model
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_instruction
        )
        
        # Generate response
        response = model.generate_content(user_message)
        return response.text
        
    except Exception as e:
        print(f"Gemini Error: {e}")
        return "I'm having trouble connecting to my neural network right now. Please try again later."