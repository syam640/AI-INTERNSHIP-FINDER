import firebase_admin
from firebase_admin import credentials, firestore, messaging
import functions_framework
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


@functions_framework.http
def scrape_all_internships(request):
    """HTTP Cloud Function to scrape internships from all sources."""
    internships = []
    internships.extend(scrape_internshala())
    internships.extend(scrape_linkedin())
    internships.extend(scrape_aicte())

    batch = db.batch()
    for internship in internships:
        doc_ref = db.collection('internships').document()
        batch.set(doc_ref, {
            **internship,
            'postedAt': firestore.SERVER_TIMESTAMP,
        })
    batch.commit()

    return {'success': True, 'count': len(internships)}


@functions_framework.http
def analyze_resume_endpoint(request):
    """HTTP Cloud Function to analyze a resume."""
    data = request.get_json()
    resume_text = data.get('resumeText', '')
    user_skills = data.get('skills', [])

    analysis = analyze_resume(resume_text, user_skills)
    return analysis


@functions_framework.http
def generate_cover_letter_endpoint(request):
    """HTTP Cloud Function to generate a cover letter."""
    data = request.get_json()
    result = generate_cover_letter(
        company=data.get('company', ''),
        role=data.get('role', ''),
        skills=data.get('skills', []),
        name=data.get('name', ''),
    )
    return {'content': result}


@functions_framework.cloud_event
def send_daily_alerts(event):
    """Cloud Function triggered by Cloud Scheduler to send daily internship alerts."""
    users = db.collection('users').stream()

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
            except Exception as e:
                print(f"Failed to send notification: {e}")
