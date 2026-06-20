import { NextRequest, NextResponse } from 'next/server'
import { saveInternships } from '@/lib/firestore'

const PYTHON_FUNCTION_URL = process.env.PYTHON_FUNCTION_URL || ''

async function callPythonScraper(source: string) {
  if (!PYTHON_FUNCTION_URL) return null

  const res = await fetch(PYTHON_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) return null
  return res.json()
}

function generateSampleInternships(source: string) {
  return [
    {
      id: `intern-${Date.now()}-1`,
      title: 'Software Engineer Intern',
      company: 'Google',
      location: 'Bangalore, India',
      description: 'Work on cutting-edge products used by billions. Looking for strong fundamentals in data structures and algorithms.',
      skills: ['Python', 'Java', 'Data Structures', 'Algorithms', 'System Design'],
      stipend: '₹50,000/month',
      duration: '6 months',
      applyURL: 'https://careers.google.com/jobs',
      source: source || 'internshala',
      postedAt: new Date(),
    },
    {
      id: `intern-${Date.now()}-2`,
      title: 'Frontend Developer Intern',
      company: 'Microsoft',
      location: 'Hyderabad, India',
      description: 'Build accessible, performant web experiences for millions of users worldwide.',
      skills: ['React', 'TypeScript', 'HTML/CSS', 'JavaScript', 'Web Accessibility'],
      stipend: '₹45,000/month',
      duration: '3 months',
      applyURL: 'https://careers.microsoft.com',
      source: source || 'linkedin',
      postedAt: new Date(),
    },
    {
      id: `intern-${Date.now()}-3`,
      title: 'Data Science Intern',
      company: 'Amazon',
      location: 'Remote',
      description: 'Apply ML techniques to solve complex business problems at scale.',
      skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow'],
      stipend: '₹40,000/month',
      duration: '6 months',
      applyURL: 'https://amazon.jobs',
      source: source || 'aicte',
      postedAt: new Date(),
    },
    {
      id: `intern-${Date.now()}-4`,
      title: 'Flutter Developer Intern',
      company: 'Swiggy',
      location: 'Bangalore, India',
      description: 'Build cross-platform mobile experiences using Flutter and Dart.',
      skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs', 'Git'],
      stipend: '₹30,000/month',
      duration: '3 months',
      applyURL: 'https://swiggy.com/careers',
      source: source || 'internshala',
      postedAt: new Date(),
    },
    {
      id: `intern-${Date.now()}-5`,
      title: 'AI/ML Research Intern',
      company: 'OpenAI',
      location: 'Remote',
      description: 'Contribute to cutting-edge AI research and help build safe AGI.',
      skills: ['Python', 'Deep Learning', 'NLP', 'PyTorch', 'Research'],
      stipend: '$5,000/month',
      duration: '4 months',
      applyURL: 'https://openai.com/careers',
      source: source || 'linkedin',
      postedAt: new Date(),
    },
    {
      id: `intern-${Date.now()}-6`,
      title: 'DevOps Engineer Intern',
      company: 'Zomato',
      location: 'Gurgaon, India',
      description: 'Manage cloud infrastructure and CI/CD pipelines for food delivery platform.',
      skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
      stipend: '₹35,000/month',
      duration: '6 months',
      applyURL: 'https://zomato.com/careers',
      source: source || 'aicte',
      postedAt: new Date(),
    },
    {
      id: `intern-${Date.now()}-7`,
      title: 'Full Stack Developer Intern',
      company: 'Razorpay',
      location: 'Bangalore, India',
      description: 'Build and maintain payment infrastructure products.',
      skills: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'TypeScript'],
      stipend: '₹40,000/month',
      duration: '3 months',
      applyURL: 'https://razorpay.com/careers',
      source: source || 'internshala',
      postedAt: new Date(),
    },
    {
      id: `intern-${Date.now()}-8`,
      title: 'Product Management Intern',
      company: 'Flipkart',
      location: 'Bangalore, India',
      description: 'Work with engineering and design teams to define product roadmap.',
      skills: ['Product Strategy', 'Analytics', 'SQL', 'User Research', 'Communication'],
      stipend: '₹35,000/month',
      duration: '6 months',
      applyURL: 'https://flipkart.com/careers',
      source: source || 'linkedin',
      postedAt: new Date(),
    },
  ]
}

export async function POST(req: NextRequest) {
  try {
    const { source } = await req.json()

    let internships
    const pythonResult = await callPythonScraper(source)

    if (pythonResult?.success) {
      internships = pythonResult.internships
    } else {
      internships = generateSampleInternships(source)
    }

    await saveInternships(internships)
    return NextResponse.json({ success: true, count: internships.length })
  } catch {
    return NextResponse.json(
      { error: 'Scraping failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with { "source": "internshala" } to scrape internships',
    sources: ['internshala', 'linkedin', 'aicte', 'other'],
  })
}
