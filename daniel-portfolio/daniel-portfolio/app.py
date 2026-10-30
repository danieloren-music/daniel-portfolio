import os, re, requests
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
EMAIL_RE = re.compile(r"[^@\s]+@[^@\s]+\.[^@\s]+")


@app.route("/")
def index():
    return render_template("index.html")


@app.post("/contact")
def contact():
    d = request.get_json(silent=True) or {}
    if d.get("website"):  # honeypot: bots fill this hidden field
        return jsonify(ok=True)
    name = str(d.get("name", "")).strip()[:100]
    email = str(d.get("email", "")).strip()[:150]
    message = str(d.get("message", "")).strip()[:3000]
    if not (name and message and EMAIL_RE.fullmatch(email)):
        return jsonify(ok=False, error="Please fill in all fields with a valid email."), 400

    key, to = os.environ.get("RESEND_API_KEY"), os.environ.get("TO_EMAIL")
    if not (key and to):
        return jsonify(ok=False, error="Contact form is not configured yet."), 500
    try:
        r = requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {key}"},
            json={
                "from": os.environ.get("FROM_EMAIL", "Portfolio <onboarding@resend.dev>"),
                "to": [to],
                "reply_to": email,
                "subject": f"Portfolio message from {name}",
                "text": f"From: {name} <{email}>\n\n{message}",
            },
            timeout=15,
        )
        r.raise_for_status()
    except requests.RequestException:
        return jsonify(ok=False, error="Could not send right now. Please use LinkedIn."), 502
    return jsonify(ok=True)


if __name__ == "__main__":
    app.run(debug=True)
