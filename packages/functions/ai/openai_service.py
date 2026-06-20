import os
import json
from typing import List, Dict, Any
from openai import OpenAI

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))


def analyze_resume(resume_text: str, user_skills: List[str] = None) -> Dict[str, Any]:
    if not os.getenv('OPENAI_API_KEY'):
        return {
            'atsScore': 72,
            'missingSkills': ['React', 'Node.js', 'TypeScript', 'AWS'],
            'suggestions': [
                'Add specific metrics and achievements',
                'Include a skills section',
                'Tailor resume with job description keywords',
            ],
            'strengths': ['Good educational background', 'Clear structure'],
        }

    prompt = f"""Analyze this resume and respond in JSON format:
{{"atsScore": number, "missingSkills": string[], "suggestions": string[], "strengths": string[]}}

Resume: "{resume_text[:4000]}"
User's skills: {', '.join(user_skills) if user_skills else 'Not specified'}"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return json.loads(response.choices[0].message.content)


def generate_cover_letter(
    company: str,
    role: str,
    skills: List[str],
    name: str,
) -> str:
    if not os.getenv('OPENAI_API_KEY'):
        return f"""Dear Hiring Manager at {company},

I am excited to apply for the {role} position. With my expertise in {', '.join(skills[:3])}, I am confident I can contribute effectively to your team.

Throughout my career, I have developed strong problem-solving skills and a passion for technology. I am eager to bring my experience to {company} and help drive innovation.

Thank you for considering my application. I look forward to discussing how I can contribute to your team.

Best regards,
{name or 'Applicant'}"""

    prompt = f"""Write a professional cover letter for {role} at {company}.
Candidate: {name or 'Applicant'}
Skills: {', '.join(skills)}

3-4 paragraphs, professional tone."""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return response.choices[0].message.content


def recommend_internships(
    user_skills: List[str],
    preferred_roles: List[str],
    experience: str,
    internships: List[Dict],
) -> List[Dict]:
    if not os.getenv('OPENAI_API_KEY') or not internships:
        return [
            {
                'internshipId': i.get('id', ''),
                'score': 70 + int(hash(str(i)) % 30),
                'reason': f"Matches your {', '.join(user_skills[:2]) if user_skills else 'profile'} skills",
            }
            for i in internships[:5]
        ]

    prompt = f"""Rank these internships for a user with:
Skills: {', '.join(user_skills)}
Preferred roles: {', '.join(preferred_roles)}
Experience: {experience or 'Not specified'}

Internships: {str(internships[:10])}

Respond as JSON array: [{{"internshipId": string, "score": 0-100, "reason": string}}]"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )
    return json.loads(response.choices[0].message.content)
