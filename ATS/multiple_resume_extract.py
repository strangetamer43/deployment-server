import os
import re
import pdfplumber
import docx
import spacy
import textract
from nltk.corpus import stopwords
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import pymongo
from pymongo import MongoClient
import threading

app = Flask(__name__)
stop_words = set(stopwords.words('english'))
nlp = spacy.load('en_core_web_sm')

# MongoDB configuration






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
    # Use NLP techniques to extract skills
    # For simplicity, we'll just use a pattern matching approach in this example
    doc = nlp(text)
    skills = []
    for entity in doc.ents:
        if entity.label_ == 'ORG' and entity.text.lower() not in stop_words:
            skills.append(entity.text)
    return skills

def extract_contact_info(text):
    # Use regular expressions to extract contact information
    name_pattern = re.compile(r'(?i)\b(?:[a-z][a-z]+)\b')
    email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
    phone_pattern = re.compile(r'(?:(?:\+|00)\d{1,3}\s?)?(?:\d{2,4}\s?)?\d{2,4}\s?\d{2,4}\s?\d{2,4}')
    
    name_matches = re.findall(name_pattern, text)
    email_matches = re.findall(email_pattern, text)
    phone_matches = re.findall(phone_pattern, text)

    name = name_matches[0] if name_matches else None
    email = email_matches[0] if email_matches else None
    phone = phone_matches[0] if phone_matches else None

    return name, email, phone


def extract_experience_and_education(text):
    # Use regular expressions to extract experience and education
    experience_pattern = re.compile(
        r"(experience)\s*(.+)",
        re.IGNORECASE | re.DOTALL
    )
    education_pattern = re.compile(
        r"(education)\s*(.+)",
        re.IGNORECASE | re.DOTALL
    )

    experience_section = re.search(experience_pattern, text)
    education_section = re.search(education_pattern, text)

    experience_text = experience_section.group(2).strip() if experience_section else ''
    education_text = education_section.group(2).strip() if education_section else ''

    return experience_text, education_text



def parse_resume(file_path):
    # Extract text from the resume based on its format
    if file_path.endswith('.pdf'):
        text = extract_text_from_pdf(file_path)
    elif file_path.endswith('.docx'):
        text = extract_text_from_docx(file_path)
    else:
        text = extract_text_from_doc(file_path)

    # Extract contact information
    name, email, phone = extract_contact_info(text)

    # Extract experience and education sections
    experience_section, education_section = extract_experience_and_education(text)

    # Extract skills using NLP or pattern matching
    skills = ', '.join(extract_skills(text))

    result = {
        'name': name,
        'email': email,
        'phone': phone,
        'skills': skills,
        'experience': experience_section,
        'education': education_section,
    }

    return result
def process_resume(file_path):
    try:
        result = parse_resume(file_path)
        print(result)
    except Exception as e:
        print(f"Error parsing resume {file_path}: {e}")

@app.route('/parse_resume', methods=['POST'])
def parse_resume_endpoint():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file uploaded'})

    resume_files = request.files.getlist('resume')

    # Save the uploaded files to temporary locations
    upload_folder = 'uploads'
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    filenames = []
    for resume_file in resume_files:
        filename = secure_filename(resume_file.filename)
        file_path = os.path.join(upload_folder, filename)
        resume_file.save(file_path)
        filenames.append(file_path)

    try:
        # Process resumes using multi-threading
        threads = []
        for file_path in filenames:
            thread = threading.Thread(target=process_resume, args=(file_path,))
            threads.append(thread)
            thread.start()

        # Wait for all threads to finish
        for thread in threads:
            thread.join()

        return jsonify({'success': 'Resumes parsed and saved successfully'})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
