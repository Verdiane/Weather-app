from flask import Flask, render_template
import os
from dotenv import load_dotenv

load_dotenv()

# We have a default template folder
app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

@app.route("/")
def load_page():
    api_key = os.getenv("OPENWEATHER_API_KEY")
    print("API Key from .env:", api_key)
    return render_template("index.html", api_key=api_key)

