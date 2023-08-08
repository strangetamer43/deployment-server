# main.py
from resume_parser import parse_resume

if __name__ == '__main__':
    resume_file_path = 'resumes/laxmika_soni__resume.pdf' 
    print("**************************") # Replace this with the actual resume file path
    parse_resume(resume_file_path)
    print("&&&&&&&&&&&&&&&&&&")
