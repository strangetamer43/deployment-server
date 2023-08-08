import json
import os
import re
from flask import Flask, request, jsonify
import nltk
import spacy
import pdfplumber
import docx
import textract
from nltk.corpus import stopwords
from werkzeug.utils import secure_filename
import pymongo
nltk.download('punkt')
nltk.download('stopwords')

app = Flask(__name__)
stop_words = set(stopwords.words('english'))
nlp = spacy.load('en_core_web_sm')
MONGO_URI = "mongodb+srv://usurpprivate:Usurptech2@cluster0.zl14l3v.mongodb.net/?retryWrites=true&w=majority"
DB_NAME = "resume_database"
COLLECTION_NAME = "resumes"


# MongoDB connection
mongo_client = pymongo.MongoClient(MONGO_URI)
db = mongo_client[DB_NAME]
collection = db[COLLECTION_NAME]


def extract_text_from_pdf(file_path):
    print("^^^^^^^^^^^^^^^^^^^")
    with pdfplumber.open(file_path) as pdf:
        print("&&&&&&&&&&&&")
        text = ''
        for page in pdf.pages:
            text += page.extract_text()
    print("$$$$$$$$$$$$$$", text)
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
    """ experience_keywords = ['work experience', 'professional experience', 'employment history', 'Experience']
    education_keywords = ['EDUCATION', 'academic qualifications', 'educational qualifications','education', 'Education','University']

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
    return experience_section.strip(), education_section.strip() """
    experience_section = re.search(r"experience\s*(.+)", text, re.IGNORECASE | re.DOTALL)
    education_section = re.search(r"education\s*(.+)", text, re.IGNORECASE | re.DOTALL)

    experience_text = experience_section.group(1).strip() if experience_section else ''
    education_text = education_section.group(1).strip() if education_section else ''

    return experience_text, education_text

    

def parse_resume(file_path):
    text = extract_text_from_pdf(file_path) if file_path.endswith('.pdf') else extract_text_from_docx(file_path)
    print("%%%%%%%1233", text)
    # Extract name, email, and phone using regular expressions
    name = re.findall(r'(?i)\b(?:[a-z][a-z]+)\b', text)[0]
    print("%%%%%%%%%%", name)
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
    return experience_section, education_section



# ... (imports and other functions remain the same)

@app.route('/api/parse_resume', methods=['POST'])
def parse_resume_endpoint():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file uploaded'})

    resume_file = request.files['resume']
    print(resume_file)
    if resume_file.filename == '':
        return jsonify({'error': 'No file selected'})

    # Save the uploaded file to a temporary location
    upload_folder = 'uploads'
    print("^^^^^^^^^^^^^^^^")
    if not os.path.exists(upload_folder):
        print("%%%%%%%%%")
        os.makedirs(upload_folder)
    filename = secure_filename(resume_file.filename)
    file_path = os.path.join(upload_folder, filename)

    resume_file.save(file_path)
    """ file_path = os.path.join(upload_folder, resume_file.filename)
    print(file_path)
    print("######") """
    
    print("***********", file_path)

    # Extract information from the resume
    try:
        with pdfplumber.open(file_path) as pdf:
            
            text = ''
            for page in pdf.pages:
                text += page.extract_text()
        print("text", text)
        name = re.findall(r'(?i)\b(?:[a-z][a-z]+)\b', text)[0]
        print(name)
        email = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)[0]
        print(email)
        phone = re.findall(r'(?:(?:\+|00)\d{1,3}\s?)?(?:\d{2,4}\s?)?\d{2,4}\s?\d{2,4}\s?\d{2,4}', text)[0]
        experience_section, education_section = extract_experience_and_education(text)
        skills = ', '.join(extract_skills(text))

        result = {
            'name': name,
            'phone': phone,
            'email':email,
            'skills': skills,
            'experience': experience_section,
            'education': education_section,
            "text": text,
        }
        collection.insert_one({
            'name': name,
            'phone': phone,
            'email':email,
            'skills': skills,
            'experience': experience_section,
            'education': education_section,
            "text": text,
        })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)})
    
@app.route('/api/data', methods=['GET'])
def get_data():
    data = []
    for item in collection.find():
        data.append({
            'name': item.get('name'),
            'email': item.get('email'),
            'phone': item.get('phone'),
            'skills': item.get('skills'),
            'experience': item.get('experience'),
            'education': item.get('education'),
            "text": item.get('text'),
        })
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True)
