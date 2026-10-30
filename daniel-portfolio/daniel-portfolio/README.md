# Daniel Oren – Portfolio (Flask)

## Run locally
    python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
    pip install -r requirements.txt
    python app.py        # http://127.0.0.1:5000

## Deploy free on Render
1. Create a GitHub repo and push this folder.
2. render.com -> New -> Web Service -> connect the repo.
3. Runtime: Python 3 | Build: `pip install -r requirements.txt` | Start: `gunicorn app:app` | Plan: Free.
4. Environment variables:
   - RESEND_API_KEY  (free key from resend.com)
   - TO_EMAIL        (the email you signed up to Resend with)
   - FROM_EMAIL      (optional; default is Portfolio <onboarding@resend.dev>)
5. Deploy. Your URL will look like https://<name>.onrender.com

Note: Render's free tier sleeps after inactivity; the first visit may take ~30s.
Optional: add a free UptimeRobot ping every 5 minutes to keep it awake.
