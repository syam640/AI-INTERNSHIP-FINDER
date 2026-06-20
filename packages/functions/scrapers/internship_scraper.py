import requests
from bs4 import BeautifulSoup
from typing import List, Dict
import time
import random

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
]


def scrape_internshala(keywords: List[str] = None) -> List[Dict]:
    internships = []
    headers = {'User-Agent': random.choice(USER_AGENTS)}

    try:
        url = 'https://internshala.com/internships'
        if keywords:
            url += f'/keyword-{",".join(keywords)}'

        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')

        # Individual internship container (internshala uses specific classes)
        for item in soup.select('.internship_meta')[:20]:
            try:
                title_el = item.select_one('.profile')
                company_el = item.select_one('.company_name')
                location_el = item.select_one('.location')
                stipend_el = item.select_one('.stipend')

                internships.append({
                    'title': title_el.text.strip() if title_el else 'Unknown',
                    'company': company_el.text.strip() if company_el else 'Unknown',
                    'location': location_el.text.strip() if location_el else 'India',
                    'description': title_el.text.strip() if title_el else '',
                    'stipend': stipend_el.text.strip() if stipend_el else 'Unpaid',
                    'duration': '',
                    'applyURL': '',
                    'source': 'internshala',
                    'skills': extract_skills(title_el.text.strip() if title_el else ''),
                })
            except Exception:
                continue
    except Exception as e:
        print(f"Internshala scrape error: {e}")

    return internships


def scrape_linkedin(keywords: List[str] = None) -> List[Dict]:
    internships = []
    headers = {'User-Agent': random.choice(USER_AGENTS)}

    try:
        params = {
            'keywords': ' '.join(keywords) if keywords else 'internship',
            'location': 'India',
        }
        response = requests.get(
            'https://www.linkedin.com/jobs/search/',
            params=params,
            headers=headers,
            timeout=10,
        )
        soup = BeautifulSoup(response.text, 'html.parser')

        for item in soup.select('.job-search-card')[:20]:
            try:
                title_el = item.select_one('.base-search-card__title')
                company_el = item.select_one('.base-search-card__subtitle')
                location_el = item.select_one('.job-search-card__location')

                internships.append({
                    'title': title_el.text.strip() if title_el else 'Unknown',
                    'company': company_el.text.strip() if company_el else 'Unknown',
                    'location': location_el.text.strip() if location_el else 'India',
                    'description': title_el.text.strip() if title_el else '',
                    'stipend': 'Not specified',
                    'duration': '',
                    'applyURL': '',
                    'source': 'linkedin',
                    'skills': extract_skills(title_el.text.strip() if title_el else ''),
                })
            except Exception:
                continue
    except Exception as e:
        print(f"LinkedIn scrape error: {e}")

    return internships


def scrape_aicte() -> List[Dict]:
    internships = []
    try:
        response = requests.get(
            'https://internship.aicte-india.org/',
            timeout=10,
        )
        soup = BeautifulSoup(response.text, 'html.parser')

        for item in soup.select('.internship-card')[:20]:
            try:
                title_el = item.select_one('.card-title')
                org_el = item.select_one('.organization')
                internships.append({
                    'title': title_el.text.strip() if title_el else 'AICTE Internship',
                    'company': org_el.text.strip() if org_el else 'Various',
                    'location': 'India',
                    'description': title_el.text.strip() if title_el else '',
                    'stipend': 'As per AICTE norms',
                    'duration': '',
                    'applyURL': '',
                    'source': 'aicte',
                    'skills': extract_skills(title_el.text.strip() if title_el else ''),
                })
            except Exception:
                continue
    except Exception as e:
        print(f"AICTE scrape error: {e}")

    return internships


def extract_skills(title: str) -> List[str]:
    skill_map = {
        'python': ['Python'],
        'java': ['Java'],
        'javascript': ['JavaScript'],
        'react': ['React'],
        'node': ['Node.js'],
        'flutter': ['Flutter'],
        'dart': ['Dart'],
        'machine learning': ['Machine Learning'],
        'data science': ['Data Science'],
        'frontend': ['React', 'HTML/CSS', 'JavaScript'],
        'backend': ['Node.js', 'Python', 'Java'],
        'full stack': ['React', 'Node.js', 'TypeScript'],
        'mobile': ['Flutter', 'React Native'],
        'devops': ['Docker', 'AWS', 'CI/CD'],
    }

    title_lower = title.lower()
    matched = []
    for keyword, skills in skill_map.items():
        if keyword in title_lower:
            matched.extend(skills)

    return list(set(matched))[:5] if matched else ['General']
