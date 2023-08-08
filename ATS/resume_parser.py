
import datetime
import PyPDF2
import docx
import textract
import nltk
from nltk.corpus import stopwords
import spacy
import re
from PyPDF2 import PdfReader
import fitz
import pdfminer
import pdfplumber

nltk.download('punkt')
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))
nlp = spacy.load('en_core_web_sm')

def extract_text_from_pdf(file_path):
    with pdfplumber.open(file_path) as pdf:
        text = ''
        for page in pdf.pages:
            text += page.extract_text()
    return text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

def extract_text_from_doc(file_path):
    return textract.process(file_path, encoding='utf-8').decode('utf-8')


def extract_skills(text):
    doc = nlp(text)
    skills = []

    for entity in doc.ents:
        if entity.label_ == 'ORG' and entity.text.lower() not in stop_words:
            skills.append(entity.text)

    return skills

def extract_experience_and_education(text):
    experience_keywords = ['work experience', 'professional experience', 'employment history', 'experience']
    education_keywords = ['education', 'academic qualifications', 'educational qualifications']

    experience_section = ''
    education_section = ''

    lines = text.lower().split('\n')
    for i, line in enumerate(lines):
        for exp_keyword in experience_keywords:
            if exp_keyword in line:
                experience_section = ' '.join(lines[i + 1:])
                break

        for edu_keyword in education_keywords:
            if edu_keyword in line:
                if experience_section:  # Ensure education section comes before experience
                    education_section = ' '.join(lines[:i])
                else:
                    education_section = ' '.join(lines[i + 1:])
                break

    return experience_section.strip(), education_section.strip()

def parse_resume(file_path):
    text = extract_text_from_pdf(file_path) if file_path.endswith('.pdf') else extract_text_from_docx(file_path)
    print("%%%%%%%1233", text)
    # Extract name, email, and phone using regular expressions
    name = re.findall(r'(?i)\b(?:[a-z][a-z]+)\b', text)[0]
    email = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)[0]
    phone = re.findall(r'(?:(?:\+|00)\d{1,3}\s?)?(?:\d{2,4}\s?)?\d{2,4}\s?\d{2,4}\s?\d{2,4}', text)[0]
    print("^^^^^^^", email)
    print(phone)
    # Extract education using keyword-based parsing
    """ education_keywords = ['Education']
    start_index = -1
    for keyword in education_keywords:
        if keyword in text.lower():
            start_index = text.lower().index(keyword)
            break
    end_index = text.lower().find('EXPERIENCE', start_index) if start_index != -1 else -1
    education = text[start_index:end_index].strip() if start_index != -1 else ''

    # Extract experience using keyword-based parsing
    experience_keywords = ['Experience','work experience', 'professional experience', 'employment history', "EXPERIENCE"]
    start_index = -1
    for keyword in experience_keywords:
        if keyword in text.lower():
            start_index = text.lower().index(keyword)
            break
    experience = text[start_index:].strip() if start_index != -1 else '' """
    # resume_parser.py (updated)
# ...
    experience_section, education_section = extract_experience_and_education(text)

    print("&&&&&&&&&&&&", experience_section)
    # Extract skills using NLP
    skills = ', '.join(extract_skills(text))
    print("$$$$$$$$$$", education_section)



