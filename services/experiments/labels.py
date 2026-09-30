"""Annotation labels Jev can assign to one resume line.

Later UI draws these labels on the page. Jev only picks a label.
It does not rewrite the line.
"""

LABELS: dict[str, str] = {
    "name": "The person's name, usually one prominent line.",
    "headline": "Target role or professional title under the name.",
    "contact": "Email, phone, location, or profile link.",
    "summary": "Short profile or objective paragraph.",
    "section_heading": "A heading that names a section, such as Experience or Education.",
    "experience_header": "A job line with role, employer, or dates.",
    "experience_description": "A bullet or sentence describing work in a job.",
    "education": "School, degree, or study dates.",
    "skills": "A skill, tool, or skill list.",
    "project": "A personal or side project, including its description.",
    "volunteer": "Volunteer role, organization, or volunteer description.",
    "reference": "A reference person or reference contact.",
    "award": "An award or honor.",
    "certification": "A certificate, license, or credential.",
    "language": "A spoken language and optional proficiency.",
    "publication": "A paper, article, talk, or other publication.",
    "other": "Text that fits none of the labels above.",
}
