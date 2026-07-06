# 🏦 Bank Chatbot

An AI-powered virtual banking assistant that lets customers get instant answers to common banking queries — checking balances, transferring money, blocking a card, checking loan status, viewing transaction history, and locating ATMs/branches — through a simple chat interface, instead of waiting on hold or navigating a full banking app.

**Live Demo:** [bank-chatbot-lyart.vercel.app](https://bank-chatbot-lyart.vercel.app)

---

## 📖 Table of Contents

- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture & Workflow](#-architecture--workflow)
- [Screenshots](#-screenshots)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Admin Panel](#-admin-panel)
- [Future Improvements](#-future-improvements)
- [Author](#-author)

---

## 🎯 Problem Statement

Traditional banking support is slow — customers wait on IVR calls or raise tickets for simple, repetitive queries (balance checks, card blocking, transaction history, FAQs). **Bank Chatbot** solves this by combining a trained conversational AI model with a rule-based FAQ layer, so routine queries are answered instantly, 24/7, while more complex intents are still handled through structured conversation flows.

## ✨ Features

- 💬 **Conversational chat interface** for natural-language banking queries (login, check balance, transfer money, block card, loan status, transaction history, ATM/branch locator).
- 🧠 **NLU-driven intent recognition** using Rasa, so the bot understands varied phrasings of the same request.
- 🔍 **FAQ-first response layer** — checks a MongoDB-backed FAQ collection before falling back to the Rasa model, for fast, consistent answers to common questions.
- ✍️ **Typo tolerance** — fuzzy-matches user input against known commands (e.g., "chek balance" → "check balance") using `difflib`.
- 🗂️ **Chat logging** — every conversation is stored in MongoDB for auditing and analysis.
- 🔐 **Admin panel** to log in, view chat logs, manage (add/update/delete) FAQs, view usage stats, and export chat logs as CSV.
- 🌐 **CORS-enabled REST API** so the frontend and backend can be deployed and scaled independently.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, JavaScript, HTML, CSS |
| Backend API | Python, Flask, Flask-CORS |
| Conversational AI | Rasa (NLU + Core) |
| Database | MongoDB (chat logs & FAQs) |
| Deployment | Vercel (frontend), Gunicorn (backend) |

## 🧩 Architecture & Workflow

```
┌────────────┐      HTTP (chat message)      ┌──────────────────┐
│   React    │ ─────────────────────────────▶ │   Flask API      │
│  Frontend  │ ◀───────────────────────────── │   (app.py)       │
└────────────┘        bot response            └────────┬─────────┘
                                                          │
                                      1. Check FAQ collection (MongoDB)
                                                          │  if no match
                                                          ▼
                                              ┌────────────────────┐
                                              │   Rasa NLU/Core     │
                                              │  (webhook endpoint) │
                                              └─────────┬──────────┘
                                                          │ intent + response
                                                          ▼
                                              ┌────────────────────┐
                                              │  MongoDB chat_logs  │
                                              │  (every chat saved) │
                                              └────────────────────┘
```

**Flow:**
1. User types a message in the React chat widget.
2. The frontend sends the message to the Flask `/chat` endpoint.
3. The backend first tries to correct typos and match the message against the FAQ collection in MongoDB.
4. If no FAQ matches, the message is forwarded to the Rasa webhook for intent classification and response generation.
5. The bot's response is returned to the frontend and the full exchange is logged to MongoDB.
6. Admins can review logs, manage FAQs, and export data through dedicated admin routes.

## 📸 Screenshots
### 🏠 Home Page

<p align="center">
  <img src="screenshots/home.png" alt="Home Page" width="900">
</p>

### 💬 Chat Interface

<p align="center">
  <img src="screenshots/chat-interface.png" alt="Chat Interface" width="900">
</p>

### 🤖 Chat Conversation

<p align="center">
  <img src="screenshots/chat-conversation.png" alt="Chat Conversation" width="900">
</p>

### 🔐 Admin Login

<p align="center">
  <img src="screenshots/admin-login.png" alt="Admin Login" width="900">
</p>

### 📊 Admin Dashboard

<p align="center">
  <img src="screenshots/admin-dashboard.png" alt="Admin Dashboard" width="900">
</p>

### 📝 FAQ Management

<p align="center">
  <img src="screenshots/faq-management.png" alt="FAQ Management" width="900">
</p>

### 📂 Chat Logs

<p align="center">
  <img src="screenshots/chat-logs.png" alt="Chat Logs" width="900">
</p>

### 📈 Usage Statistics

<p align="center">
  <img src="screenshots/stats.png" alt="Usage Statistics" width="900">
</p>

## 📁 Project Structure

```
Bank_Chatbot/
├── frontend/          # React chat UI
├── rasa_bot/          # Rasa NLU/Core project (intents, stories, domain, actions)
├── app.py             # Flask backend — chat routing, FAQ lookup, admin APIs
├── requirements.txt   # Python backend dependencies
├── .vscode/           # Editor config
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.8+
- MongoDB Atlas (or local MongoDB) connection string
- Rasa (`pip install rasa`)

### 1. Clone the repository
```bash
git clone https://github.com/Kartik-Sable-777/Bank_Chatbot.git
cd Bank_Chatbot
```

### 2. Set up the Rasa bot
```bash
cd rasa_bot
pip install rasa
rasa train
rasa run --enable-api --cors "*"
# In a separate terminal, run the action server if custom actions are used:
rasa run actions
```

### 3. Set up the Flask backend
```bash
cd ..
pip install -r requirements.txt
```
Before running, set your own MongoDB URI and Rasa webhook URL as environment variables (recommended) instead of hardcoding them, then update `app.py` to read from `os.environ`:
```bash
export MONGO_URI="your-mongodb-connection-string"
export RASA_URL="http://localhost:5005/webhooks/rest/webhook"
```
Run the backend:
```bash
python app.py
```
The API will be available at `http://localhost:5000`.

### 4. Set up the frontend
```bash
cd frontend
npm install
npm start
```
The chat UI will be available at `http://localhost:3000` and will communicate with the Flask API.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/chat` | Send a user message, get bot's response |
| POST | `/admin/login` | Admin authentication |
| GET | `/admin/logs` | Fetch recent chat logs |
| GET | `/admin/faqs` | Fetch all FAQs |
| POST | `/admin/add-faq` | Add a new FAQ |
| PUT | `/admin/update-faq/<id>` | Update an existing FAQ |
| DELETE | `/admin/delete-faq/<id>` | Delete an FAQ |
| GET | `/admin/stats` | Get total chats & FAQ counts |
| GET | `/admin/export-csv` | Export all chat logs as CSV |

*Admin routes require an `admin: true` header after successful login.*

## 🔐 Admin Panel

The admin panel lets a bank representative:
- Review live chat logs
- Add, edit, or remove FAQ entries that the bot answers directly (without hitting the NLU model)
- View basic usage statistics
- Export the full chat history as a CSV report

## 🔮 Future Improvements

- Move secrets (MongoDB URI, admin credentials) to environment variables / a secrets manager instead of hardcoding them.
- Add JWT-based admin authentication instead of a static username/password.
- Add unit tests for the Flask routes and Rasa NLU pipeline.
- Support multi-language queries.
- Add real transaction/account integration behind proper authentication for production use.

## 👤 Author

**Kartik Sable**
- GitHub: [@Kartik-Sable-777](https://github.com/Kartik-Sable-777)
