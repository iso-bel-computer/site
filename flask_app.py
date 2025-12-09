
from datetime import datetime
from flask import Flask, render_template
import os
import datetime
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('base.html',
                         current_date=datetime.now().strftime('%Y-%m-%d')
                           )



def getSuffix(day):
    if day == 1 or day == 21 or day == 31:
        return 'st'
    elif day == 2 or day == 22:
        return 'nd'
    elif day == 3 or day == 23:
        return 'rd'
    else:
        return 'th'

def getBlogPosts():
    posts = []

    # Get the directory where flask_app.py is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    postsDir = os.path.join(base_dir, 'templates', 'blog', 'posts')

    for filename in os.listdir(postsDir):
        if filename.endswith('.html'):
            try:
                postId = filename.replace('.html','')

                # this is silly but it works well enough
                postDate = postId.split('_')[0]
                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
                        'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                postDateSplit = postDate.split('-')
                suffix = getSuffix(int(postDateSplit[2]))

                displayDate = postDateSplit[2] + suffix + ' ' + months[int(postDateSplit[1]) - 1]
                if postDateSplit[0] != datetime.now().strftime("%Y"):
                    displayDate = displayDate + ' ' + postDateSplit[0][:2]

                postTitle = postId.split('_')[1].replace('-',' ')
                posts.append({
                    'id': postId,
                    'title': postTitle,
                    'date': postDate,
                    'displayDate': displayDate,
                    'template': f'blog/posts/{filename}'

                })
            except:
                print(f'Error processing {filename}')
    return sorted(posts, key=lambda x: x['date'], reverse=True)

BLOGPOSTS = getBlogPosts()

@app.route('/blog')
def blog():
    return render_template('blog.html',
                           headerRouteDisplay = '/Blog',
                           posts=BLOGPOSTS)


if __name__ == '__main__':
    app.run(debug=True)
