AI Storyteller

A simple full-stack project where the backend (FastAPI + Groq/Gemini) generates branching, family-friendly stories and the frontend (React) displays them interactively.

🚀 Getting Started
1. Clone the repo
git clone https://github.com/yourusername/ai-storyteller.git
cd ai-storyteller

🖥️ Backend (FastAPI)
Install dependencies
If you use system Python
pip install -r requirements.txt

If you use Homebrew Python (recommended venv setup)

Homebrew’s Python is “externally managed” and blocks direct pip install. Fix by creating a virtual environment:

# Create venv in project folder
python3 -m venv .venv

# Activate venv
source .venv/bin/activate

# Now install dependencies
pip install -r requirements.txt


This keeps your system Python clean and allows you to install packages normally.

Environment variables

Set your API keys (Groq, Gemini) before starting the server.

Option 1: Export in shell
export GROQ_API_KEY="your_groq_key_here"
export GOOGLE_API_KEY="your_gemini_key_here"

Option 2: Use .env

Create a .env file in backend/:

GROQ_API_KEY=your_groq_key_here
GOOGLE_API_KEY=your_gemini_key_here


The backend will auto-load this if python-dotenv is installed.

Run the backend
cd backend
uvicorn main:app --reload


The API will be live at:
👉 http://127.0.0.1:8000/story

Interactive docs:
👉 http://127.0.0.1:8000/docs

🌐 Frontend (React)
Install dependencies
cd frontend
yarn install

Start the dev server
yarn start


The app will open at 👉 http://localhost:3000
.
Hot reloading is enabled — saving changes in src/ updates the browser automatically.

⚡ Development workflow

Start backend in one terminal:

cd backend
source ../.venv/bin/activate   # only if using venv
uvicorn main:app --reload


Start frontend in another terminal:

cd frontend
yarn start

🔥 One-liner full dev setup

You can run both backend and frontend with one command using concurrently
.

1. Install concurrently
cd frontend
yarn add -D concurrently

2. Add a script in frontend/package.json
"scripts": {
  "dev": "concurrently \"cd ../backend && source ../.venv/bin/activate && uvicorn main:app --reload\" \"yarn start\""
}

3. Run everything
yarn dev


This launches:

FastAPI backend on http://127.0.0.1:8000

React frontend on http://localhost:3000

✅ Summary

Backend → uvicorn main:app --reload

Frontend → yarn start

Homebrew Python users → use a venv (python3 -m venv .venv && source .venv/bin/activate)

All-in-one → yarn dev