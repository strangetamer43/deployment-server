import openai 
import os

from dotenv import load_dotenv, find_dotenv


load_dotenv()
openai.api_key = os.getenv('API_KEY')

def get_completion(prompt, model = "gpt-3.5-turbo"):
    messages = [{"role": "user", "content": prompt}]
    response = openai.ChatCompletion.create(
        model = model,
        messages = messages,
        temperature = 0
    )
    return response

prompt = """Tell me about narendra modi"""
print(get_completion(prompt))