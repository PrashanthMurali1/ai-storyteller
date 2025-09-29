from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import faiss, pickle
from groq import Groq
import google.generativeai as genai
import os
import requests
from sentence_transformers import SentenceTransformer

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clients
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Vector index and metadata file
BASE_DIR = os.path.dirname(__file__)  # backend/
INDEX_FILE = os.path.join(BASE_DIR, "vector.index")
META_FILE = os.path.join(BASE_DIR, "metadata.pkl")


index = faiss.read_index(INDEX_FILE)
with open(META_FILE, "rb") as f:
    metadata = pickle.load(f)
embedder = SentenceTransformer("all-MiniLM-L6-v2", cache_folder="./models")

# Wikipedia APIs
WIKI_API = "https://en.wikipedia.org/w/api.php"
WIKI_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/"

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return Response(status_code=204)  # empty response, no content

@app.get("/story")
def storyteller(query: str, engine: str = "gemini"):
    """
    Storyteller endpoint.
    - engine=groq   → Llama via Groq
    - engine=gemini → Gemini 2.5 Flash
    """
    if engine == "groq":
        prompt = f"""
        The user wants to begin or continue a story: "{query}"

        Your job:
        1. Continue the story in a family-friendly way (strictly no NSFW, explicit, or harmful content).
        2. Make it engaging and immersive.
        3. At the end, always provide 2–3 numbered branching options for what the user can do next.

        Format:
        STORY: <your continuation>
        CHOICES:
        1. <option one>
        2. <option two>
        3. <option three>
        """

        resp = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )

        content = resp.choices[0].message.content.strip()
        return {"story": content}

    elif engine == "gemini":
        prompt = f"""
        The user wants to begin or continue a story: "{query}"

        Your job:
        1. Continue the story in a family-friendly way (strictly no NSFW, explicit, or harmful content).
        2. Make it engaging and immersive.
        3. At the end, always provide 2–3 numbered branching options for what the user can do next.

        Format:
        STORY: <your continuation>
        CHOICES:
        1. <option one>
        2. <option two>
        3. <option three>
        """

        model = genai.GenerativeModel("models/gemini-2.5-flash")
        resp = model.generate_content(prompt)

        return {"story": resp.text.strip()}

    else:
        return {"error": f"Unsupported engine '{engine}'. Use 'groq' or 'gemini'."}
