
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
    postsDir = os.path.expanduser('~/site/templates/blog/posts')
    for filename in os.listdir(postsDir):
        if filename.endswith('.html'):
            print('we got to here...')
            postId = filename.replace('.html','')

            # this is silly but it works well enough
            postDate = postId.split('_')[0]
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
                      'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            postDateSplit = postDate.split('-')
            displayDate = postDateSplit[2] + months[int(postDateSplit[1]) - 1] + postDateSplit[0]


            postTitle = postId.split('_')[1].replace('-',' ')
            print(postId, postDate, postTitle)
            posts.append({
                'id': postId,
                'title': postTitle,
                'date': postDate,
                'displayDate': displayDate,
                'template': f'blog/posts/{filename}'

            })
    return sorted(posts, key=lambda x: x['date'], reverse=True)

BLOGPOSTS = getBlogPosts()

@app.route('/blog')
def blog():
    return render_template('blog.html',
                           posts=BLOGPOSTS)
