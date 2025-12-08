
from datetime import datetime
from flask import Flask, render_template
import os


app = Flask(__name__)

@app.route('/')
def home():
    return render_template('base.html',
                         current_date=datetime.now().strftime('%Y-%m-%d'))



def getBlogPosts():
    posts = []
    postsDir = 'templates/blog/posts'

    for filename in os.listdir(postsDir):
        if filename.endswith('.html'):
            postId = filename.replace('.html','')
            postDate = filename.split('_')[0].replace('-',' ')
            postTitle = filename.split('_')[1].replace('-',' ')
            posts.append({
                'id': postId,
                'title': postTitle,
                'date': postDate,
                'template': filename

            })
    return sorted(posts, key=lambda x: x['date'], reverse=True)

BLOGPOSTS = getBlogPosts()

@app.route('/blog')
def blog():
    return render_template('templates/blog.html',
                           posts=BLOGPOSTS)
