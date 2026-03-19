from flask import Flask, request, jsonify, Response   # ✅ added Response
from flask_cors import CORS
import requests
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import difflib
import csv   # ✅ added

VALID_COMMANDS = [
    "login",
    "logout",
    "check balance",
    "transfer money",
    "block card",
    "loan",
    "transaction history",
    "atm",
    "branch"
]

def correct_input(user_input):
    match = difflib.get_close_matches(user_input, VALID_COMMANDS, n=1, cutoff=0.6)
    return match[0] if match else user_input


# ============================
# INIT
# ============================

app = Flask(__name__)
CORS(app)

RASA_URL = "https://tranquil-clarita-nonvisceral.ngrok-free.dev/webhooks/rest/webhook"


# ============================
# MONGODB (FIXED SINGLE DB)
# ============================

client = MongoClient("mongodb+srv://kartiksable777:nWx2kgPepVmJgFhT@cluster0.1x4eth.mongodb.net/?appName=Cluster0")
db = client["bankbot"]

chat_collection = db["chat_logs"]
faq_collection = db["faqs"]


# ============================
# ADMIN CONFIG
# ============================

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "1234"


# ============================
# HELPER FUNCTIONS
# ============================

def log_chat(sender, user_msg, bot_msg):
    try:
        chat_collection.insert_one({
            "sender": sender,
            "user_message": user_msg,
            "bot_response": bot_msg,
            "timestamp": datetime.now()
        })
    except:
        pass  # 🔥 prevent crash


def get_faq_response(user_message):
    try:
        faq = faq_collection.find_one({
            "question": {"$regex": user_message, "$options": "i"}
        })
        return faq["answer"] if faq else None
    except:
        return None


def is_admin(request):
    return request.headers.get("admin") == "true"


# ============================
# ADMIN LOGIN
# ============================

@app.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.json

    if (
        data.get("username") == ADMIN_USERNAME and
        data.get("password") == ADMIN_PASSWORD
    ):
        return jsonify({"success": True})

    return jsonify({"success": False}), 401


# ============================
# ADMIN ROUTES
# ============================

@app.route("/admin/logs", methods=["GET"])
def get_logs():
    if not is_admin(request):
        return jsonify({"error": "Unauthorized"}), 403

    logs = list(chat_collection.find().sort("timestamp", -1).limit(50))

    for log in logs:
        log["_id"] = str(log["_id"])

    return jsonify(logs)


@app.route("/admin/faqs", methods=["GET"])
def get_faqs():
    if not is_admin(request):
        return jsonify({"error": "Unauthorized"}), 403

    faqs = list(faq_collection.find())

    for faq in faqs:
        faq["_id"] = str(faq["_id"])

    return jsonify(faqs)


@app.route("/admin/add-faq", methods=["POST"])
def add_faq():
    if not is_admin(request):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json

    if not data.get("question") or not data.get("answer"):
        return jsonify({"error": "Invalid input"}), 400

    faq_collection.insert_one({
        "question": data["question"],
        "answer": data["answer"]
    })

    return jsonify({"message": "FAQ added"})


@app.route("/admin/delete-faq/<id>", methods=["DELETE"])
def delete_faq(id):
    if not is_admin(request):
        return jsonify({"error": "Unauthorized"}), 403

    try:
        result = faq_collection.delete_one({"_id": ObjectId(id)})

        if result.deleted_count:
            return jsonify({"message": "Deleted"})
        return jsonify({"error": "Not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/admin/update-faq/<id>", methods=["PUT"])
def update_faq(id):
    if not is_admin(request):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json

    faq_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "question": data["question"],
            "answer": data["answer"]
        }}
    )

    return jsonify({"message": "Updated"})


@app.route("/admin/stats", methods=["GET"])
def get_stats():
    if not is_admin(request):
        return jsonify({"error": "Unauthorized"}), 403

    return jsonify({
        "total_chats": chat_collection.count_documents({}),
        "total_faqs": faq_collection.count_documents({})
    })


# ============================
# ✅ EXPORT CSV (NEW FEATURE)
# ============================

@app.route("/admin/export-csv", methods=["GET"])
def export_csv():
    if not is_admin(request):
        return jsonify({"error": "Unauthorized"}), 403

    logs = list(chat_collection.find().sort("timestamp", -1))

    def generate():
        yield "User Message,Bot Response,Timestamp\n"

        for log in logs:
            user = str(log.get("user_message", "")).replace(",", " ")
            bot = str(log.get("bot_response", "")).replace(",", " ")
            time = str(log.get("timestamp", ""))

            yield f"{user},{bot},{time}\n"

    return Response(
        generate(),
        mimetype="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=chat_logs.csv"
        }
    )


# ============================
# CHAT ROUTE (FINAL FIX)
# ============================

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        user_message = data.get("message", "").strip().lower()
        sender = data.get("sender")

        if not user_message:
            return jsonify([{"text": "Please type something."}])

        # 🔥 typo correction
        user_message = correct_input(user_message)

        # ============================
        # FAQ FIRST
        # ============================
        faq_answer = get_faq_response(user_message)

        if faq_answer:
            log_chat(sender, user_message, faq_answer)
            return jsonify([{"text": faq_answer}])

        # ============================
        # RASA CALL (SAFE)
        # ============================
        try:
            rasa_response = requests.post(
                RASA_URL,
                json={"sender": sender, "message": user_message},
                timeout=5
            )

            if rasa_response.status_code != 200:
                raise Exception("Rasa failed")

            bot_messages = rasa_response.json()

        except Exception as rasa_error:
            print("RASA ERROR:", rasa_error)
            return jsonify([{"text": "Bot is not responding. Try again."}])

        # ============================
        # SAFE RESPONSE
        # ============================
        if not bot_messages:
            return jsonify([{"text": "I didn’t understand that. Try again."}])

        bot_text = " ".join(
            [msg.get("text", "") for msg in bot_messages if msg.get("text")]
        )

        if not bot_text:
            bot_text = "I’m processing your request..."

        # ============================
        # SAVE CHAT
        # ============================
        log_chat(sender, user_message, bot_text)

        return jsonify(bot_messages)

    except Exception as e:
        print("ERROR:", e)
        return jsonify([{"text": "Server error. Please try again."}])


# ============================
# CORS FIX
# ============================

@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response


# ============================
# RUN
# ============================

if __name__ == "__main__":
    app.run(port=5000, debug=True)