import os
import firebase_admin
from firebase_admin import credentials, firestore, messaging
from flask import Flask, request, jsonify
from scrapers.internship_scraper import (
    scrape_internshala,
    scrape_linkedin,
    scrape_aicte,
)
from ai.openai_service import analyze_resume, generate_cover_letter, recommend_internships

if not firebase_admin._apps:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)


@app.route('/api/scrape', methods=['POST'])
def scrape_all_internships():
    """Scrape internships from all sources."""
    data = request.get_json() or {}
    source = data.get('source', 'all')

    internships = []
    if source in ('all', 'internshala'):
        internships.extend(scrape_internshala())
    if source in ('all', 'linkedin'):
        internships.extend(scrape_linkedin())
    if source in ('all', 'aicte'):
        internships.extend(scrape_aicte())

    batch = db.batch()
    for internship in internships:
        doc_ref = db.collection('internships').document()
        batch.set(doc_ref, {
            **internship,
            'postedAt': firestore.SERVER_TIMESTAMP,
        })
    batch.commit()

    return jsonify({'success': True, 'count': len(internships), 'internships': internships})


@app.route('/api/analyze-resume', methods=['POST'])
def analyze_resume_endpoint():
    """Analyze a resume and return ATS score and suggestions."""
    data = request.get_json() or {}
    resume_text = data.get('resumeText', '')
    user_skills = data.get('skills', [])

    analysis = analyze_resume(resume_text, user_skills)
    return jsonify(analysis)


@app.route('/api/generate-cover-letter', methods=['POST'])
def generate_cover_letter_endpoint():
    """Generate a cover letter for a specific company and role."""
    data = request.get_json() or {}
    result = generate_cover_letter(
        company=data.get('company', ''),
        role=data.get('role', ''),
        skills=data.get('skills', []),
        name=data.get('name', ''),
    )
    return jsonify({'content': result})


@app.route('/api/alerts', methods=['POST'])
def send_daily_alerts():
    """Send daily internship alerts to users with FCM tokens."""
    users = db.collection('users').stream()
    sent_count = 0

    for user_doc in users:
        user_data = user_doc.to_dict()
        if not user_data.get('fcmToken'):
            continue

        internships = scrape_internshala(keywords=user_data.get('skills', []))
        if internships:
            message = messaging.Message(
                notification=messaging.Notification(
                    title='New Internships Found!',
                    body=f"Found {len(internships)} new internships matching your profile",
                ),
                token=user_data['fcmToken'],
            )
            try:
                messaging.send(message)
                sent_count += 1
            except Exception as e:
                print(f"Failed to send notification: {e}")

    return jsonify({'success': True, 'sent': sent_count})


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'version': '1.0.0'})


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
