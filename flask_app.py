
from datetime import datetime
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html',
                         current_date=datetime.now().strftime('%Y-%m-%d'))

@app.route('/blog')
def blog():
    return render_template('blog.html')
