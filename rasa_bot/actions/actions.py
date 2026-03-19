from typing import Text
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, FollowupAction
import sqlite3
from datetime import datetime, timedelta
import re

DB_NAME = "bank.db"


# =========================================================
# DATABASE SETUP
# =========================================================

def get_connection():
    return sqlite3.connect(DB_NAME)


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            account_number TEXT PRIMARY KEY,
            balance INTEGER
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_account TEXT,
            to_account TEXT,
            type TEXT,
            amount INTEGER,
            timestamp TEXT
        )
    """)

    sample_accounts = [
        ("12345678", 25000),
        ("87654321", 40000),
        ("11112222", 15000)
    ]

    for acc in sample_accounts:
        cursor.execute("INSERT OR IGNORE INTO accounts VALUES (?,?)", acc)

    conn.commit()
    conn.close()


init_db()


# =========================================================
# AUTH ROUTING
# =========================================================

class ActionAuthenticateAndRoute(Action):
    def name(self):
        return "action_authenticate_and_route"

    def run(self, dispatcher, tracker, domain):

        if tracker.get_slot("is_authenticated"):
            return [FollowupAction("action_check_balance")]

        dispatcher.utter_message(text="Please login first.")
        return [
            SlotSet("auth_pending_intent", "check_balance"),
            FollowupAction("login_form")
        ]


class ActionAuthenticateAndRouteTransactions(Action):
    def name(self):
        return "action_authenticate_and_route_transactions"

    def run(self, dispatcher, tracker, domain):

        if tracker.get_slot("is_authenticated"):
            return [FollowupAction("transaction_form")]

        dispatcher.utter_message(text="Please login first.")
        return [
            SlotSet("auth_pending_intent", "transaction_history"),
            FollowupAction("login_form")
        ]


# =========================================================
# LOGIN
# =========================================================

class ActionLogin(Action):
    def name(self):
        return "action_login"

    def run(self, dispatcher, tracker, domain):

        account_number = tracker.get_slot("account_number")

        if not account_number:
            text = tracker.latest_message.get("text")
            match = re.search(r"\d{6,12}", text)
            if match:
                account_number = match.group()

        if not account_number:
            dispatcher.utter_message(text="Please provide a valid account number.")
            return []

        account_number = str(account_number).strip()

        if not account_number.isdigit() or len(account_number) < 6:
            dispatcher.utter_message(text="Invalid account number format.")
            return []

        try:
            conn = get_connection()
            cursor = conn.cursor()

            cursor.execute(
                "SELECT balance FROM accounts WHERE account_number=?",
                (account_number,)
            )

            result = cursor.fetchone()
            conn.close()

            if not result:
                dispatcher.utter_message(text="Invalid account number.")
                return []

        except Exception as e:
            print("LOGIN ERROR:", e)
            dispatcher.utter_message(text="Login failed. Try again.")
            return []

        dispatcher.utter_message(text="Login successful.")

        pending = tracker.get_slot("auth_pending_intent")

        events = [
            SlotSet("is_authenticated", True),
            SlotSet("account_number", account_number),
            SlotSet("auth_pending_intent", None),
            SlotSet("confirmation_context", None)
        ]

        if pending == "check_balance":
            events.append(FollowupAction("action_check_balance"))

        elif pending == "transaction_history":
            events.append(FollowupAction("transaction_form"))

        return events


# =========================================================
# CHECK BALANCE (FIXED 🔥)
# =========================================================

class ActionCheckBalance(Action):
    def name(self):
        return "action_check_balance"

    def run(self, dispatcher, tracker, domain):

        acc = tracker.get_slot("account_number")

        if not acc:
            dispatcher.utter_message(text="Please login again.")
            return []

        try:
            conn = get_connection()
            cursor = conn.cursor()

            cursor.execute(
                "SELECT balance FROM accounts WHERE account_number=?",
                (acc,)
            )

            result = cursor.fetchone()
            conn.close()

            if result:
                dispatcher.utter_message(
                    text=f"Your current account balance is ₹{result[0]}."
                )
            else:
                dispatcher.utter_message(text="Account not found.")

        except Exception as e:
            print("BALANCE ERROR:", e)
            dispatcher.utter_message(text="Unable to fetch balance.")

        return []


# =========================================================
# TRANSFER
# =========================================================

class ActionSetTransferContext(Action):
    def name(self):
        return "action_set_transfer_context"

    def run(self, dispatcher, tracker, domain):
        return [SlotSet("confirmation_context", "transfer")]


class ActionTransferMoney(Action):
    def name(self):
        return "action_transfer_money"

    def run(self, dispatcher, tracker, domain):

        sender = tracker.get_slot("account_number")
        receiver = tracker.get_slot("recipient_account")
        amount = tracker.get_slot("amount")

        if not sender or not receiver or not amount:
            dispatcher.utter_message(text="Transfer details incomplete.")
            return []

        try:
            amount = int(amount)
        except:
            dispatcher.utter_message(text="Invalid amount.")
            return []

        try:
            conn = get_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT balance FROM accounts WHERE account_number=?", (sender,))
            s = cursor.fetchone()

            cursor.execute("SELECT balance FROM accounts WHERE account_number=?", (receiver,))
            r = cursor.fetchone()

            if not s or not r:
                dispatcher.utter_message(text="Invalid account details.")
                return []

            if s[0] < amount:
                dispatcher.utter_message(text="Insufficient balance.")
                return []

            new_s = s[0] - amount
            new_r = r[0] + amount

            cursor.execute("UPDATE accounts SET balance=? WHERE account_number=?", (new_s, sender))
            cursor.execute("UPDATE accounts SET balance=? WHERE account_number=?", (new_r, receiver))

            conn.commit()
            conn.close()

            dispatcher.utter_message(
                text=f"₹{amount} transferred successfully to {receiver}. Remaining balance ₹{new_s}."
            )

        except Exception as e:
            print("TRANSFER ERROR:", e)
            dispatcher.utter_message(text="Transfer failed.")

        return []


# =========================================================
# LOAN
# =========================================================

class ActionSetLoanContext(Action):
    def name(self):
        return "action_set_loan_context"

    def run(self, dispatcher, tracker, domain):
        return [SlotSet("confirmation_context", "loan")]


class ActionSubmitLoan(Action):
    def name(self):
        return "action_submit_loan"

    def run(self, dispatcher, tracker, domain):

        dispatcher.utter_message(text="Loan request submitted successfully.")

        return [SlotSet("confirmation_context", None)]


# =========================================================
# BLOCK CARD
# =========================================================

class ActionSetBlockContext(Action):
    def name(self):
        return "action_set_block_context"

    def run(self, dispatcher, tracker, domain):
        return [SlotSet("confirmation_context", "block")]


class ActionBlockCard(Action):
    def name(self):
        return "action_block_card"

    def run(self, dispatcher, tracker, domain):

        dispatcher.utter_message(text="Card blocked successfully.")

        return [SlotSet("confirmation_context", None)]


# =========================================================
# LOCATION
# =========================================================

class ActionShowLocations(Action):
    def name(self):
        return "action_show_locations"

    def run(self, dispatcher, tracker, domain):

        dispatcher.utter_message(text="Showing nearby locations.")

        return []


# =========================================================
# TRANSACTIONS
# =========================================================

class ActionShowTransactions(Action):
    def name(self):
        return "action_show_transactions"

    def run(self, dispatcher, tracker, domain):

        dispatcher.utter_message(text="Transactions displayed.")

        return []


# =========================================================
# CONFIRM / DENY
# =========================================================

class ActionHandleConfirmation(Action):
    def name(self):
        return "action_handle_confirmation"

    def run(self, dispatcher, tracker, domain):

        ctx = tracker.get_slot("confirmation_context")

        if ctx == "transfer":
            return [FollowupAction("action_transfer_money")]

        if ctx == "loan":
            return [FollowupAction("action_submit_loan")]

        if ctx == "block":
            return [FollowupAction("action_block_card")]

        dispatcher.utter_message(text="Nothing to confirm.")
        return []


class ActionHandleDenial(Action):
    def name(self):
        return "action_handle_denial"

    def run(self, dispatcher, tracker, domain):

        dispatcher.utter_message(text="Operation cancelled.")
        return [SlotSet("confirmation_context", None)]


# =========================================================
# LOGOUT
# =========================================================

class ActionLogout(Action):
    def name(self):
        return "action_logout"

    def run(self, dispatcher, tracker, domain):

        dispatcher.utter_message(text="You have been logged out successfully.")

        return [
            SlotSet("is_authenticated", False),
            SlotSet("account_number", None),
            SlotSet("confirmation_context", None)
        ]