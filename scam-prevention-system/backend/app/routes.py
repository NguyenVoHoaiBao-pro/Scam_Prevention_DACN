from . import app
from flask import jsonify, request, redirect
import json
import os
from urllib.parse import urlencode
import requests

# Load OAuth config
with open(os.path.join(os.path.dirname(__file__), '..', 'config.json')) as f:
    oauth_config = json.load(f)


def load_valid_users():
    users_path = os.path.join(os.path.dirname(__file__), '..', 'valid_users.json')
    with open(users_path, encoding="utf-8") as f:
        return json.load(f)


@app.route("/api/auth/login", methods=["POST"])
def email_password_login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""

    if not password or (not email and not username):
        return jsonify({"error": "email/username and password are required"}), 400

    valid_users = load_valid_users()
    matched_user = None

    for user in valid_users:
        user_email = (user.get("email") or "").strip().lower()
        user_username = (user.get("username") or "").strip().lower()
        user_password = user.get("password") or ""

        identity_match = (email and email == user_email) or (username and username == user_username)
        if identity_match and password == user_password:
            matched_user = {
                "id": user.get("id"),
                "username": user.get("username"),
                "email": user.get("email")
            }
            break

    if not matched_user:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "user": matched_user
    })


@app.route("/api/auth/google/login")
def google_login():
    params = {
        "client_id": oauth_config["GOOGLE_CLIENT_ID"],
        "redirect_uri": oauth_config["GOOGLE_REDIRECT_URI"],
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return redirect(url)


@app.route("/api/auth/google/callback")
def google_callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing code"}), 400
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": oauth_config["GOOGLE_CLIENT_ID"],
        "client_secret": oauth_config["GOOGLE_CLIENT_SECRET"],
        "redirect_uri": oauth_config["GOOGLE_REDIRECT_URI"],
        "grant_type": "authorization_code"
    }
    token_resp = requests.post(token_url, data=data)
    token_json = token_resp.json()
    access_token = token_json.get("access_token")
    if not access_token:
        return jsonify({"error": "Failed to obtain access token", "details": token_json}), 400
    userinfo_resp = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    userinfo = userinfo_resp.json()
    # Here you would register or log in the user in your DB
    return jsonify({"user": userinfo, "token": token_json})


@app.route("/api/auth/facebook/login")
def facebook_login():
    params = {
        "client_id": oauth_config["FACEBOOK_CLIENT_ID"],
        "redirect_uri": oauth_config["FACEBOOK_REDIRECT_URI"],
        "state": "random_state_string",  # Should be random in production
        "scope": "email,public_profile"
    }
    url = f"https://www.facebook.com/v17.0/dialog/oauth?{urlencode(params)}"
    return redirect(url)


@app.route("/api/auth/facebook/callback")
def facebook_callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing code"}), 400
    token_url = "https://graph.facebook.com/v17.0/oauth/access_token"
    params = {
        "client_id": oauth_config["FACEBOOK_CLIENT_ID"],
        "redirect_uri": oauth_config["FACEBOOK_REDIRECT_URI"],
        "client_secret": oauth_config["FACEBOOK_CLIENT_SECRET"],
        "code": code
    }
    token_resp = requests.get(token_url, params=params)
    token_json = token_resp.json()
    access_token = token_json.get("access_token")
    if not access_token:
        return jsonify({"error": "Failed to obtain access token", "details": token_json}), 400
    userinfo_resp = requests.get(
        "https://graph.facebook.com/me",
        params={"fields": "id,name,email,picture", "access_token": access_token}
    )
    userinfo = userinfo_resp.json()
    # Here you would register or log in the user in your DB
    return jsonify({"user": userinfo, "token": token_json})

@app.route("/")
def home():
    return jsonify({
        "message": "Scam Prevention Backend is running!"
    })

@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok"
    })

@app.route("/api/detect-text", methods=["POST"])
def detect_text():
    data = request.get_json()
    text = data.get("text", "")

    suspicious_keywords = ["otp", "chuyển khoản", "trúng thưởng", "click link", "xác minh tài khoản"]
    is_scam = any(keyword.lower() in text.lower() for keyword in suspicious_keywords)

    return jsonify({
        "input_text": text,
        "is_scam": is_scam,
        "message": "Scam detected!" if is_scam else "Text seems safe."
    })