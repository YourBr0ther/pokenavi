
from flask import Flask, render_template
import requests
import json

with open("./Python/api.txt") as file:
    api_key = file.read()

with open("./Charmeleon_string.txt") as file:
    initial_prompt = file.read()

def new_chat_gpt_prompt(prompt, initial_prompt=None, history=None):
    if history is None:
        history = []

    if initial_prompt is not None:
        history.append({"role": "system", "content": initial_prompt})

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    messages = history + [{"role": "user", "content": prompt}]
    body = {
        "model": "gpt-3.5-turbo",
        "messages": messages,
        "temperature": 0.7
    }

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        data=json.dumps(body)
    )

    json_response = response.json()

    if "choices" not in json_response:
        print(f"Error in API response: {json_response}")
        return None

    return json_response["choices"][0]["message"]["content"]

prompt = "Hey Char! What is my name?"


if response:
    print(response)
else:
    print("An error occurred while processing the request.")

@app.route("/")
def index():
    response = new_chat_gpt_prompt(prompt, initial_prompt=initial_prompt)
    return render_template("index.html",)