import json
from datetime import datetime
from flask import Flask, render_template, jsonify, request, abort, redirect
import os
os.chdir(os.path.dirname(__file__))  # change CWD to where flask_app.py lives
import datetime
from datetime import datetime
import random
import requests
from urllib.parse import urlparse
from dotenv import load_dotenv
load_dotenv()
from requests.auth import HTTPBasicAuth

print("API KEY PRESENT:", "COMPANIES_HOUSE_API_KEY" in os.environ)

siteMap = [
    '/',
    '/blog',
    '/about/reading',
    '/art/photography',
    '/art/prints',
    '/art/drawing',
    '/research/abulafia',
    '/YWABM'
]

domain = 'https://1sobel.pythonanywhere.com/'
app = Flask(__name__)

@app.route('/')
def home():
    return render_template('base.html',
                         current_date=datetime.now().strftime('%Y-%m-%d'))





@app.route('/go', methods=['POST'])
def go():

    headerRouteInput = request.form.get('headerRouteInput', '').strip()

    # Remove leading slash and tilde if user included it
    if headerRouteInput.startswith('/'):
        headerRouteInput = headerRouteInput[1:]
    if headerRouteInput.startswith('~/'):
        headerRouteInput = headerRouteInput[2:]

    # Build the full URL
    full_url = f'{domain}{headerRouteInput}'

    return redirect(full_url)







""" Blog Page """
def getBlogPosts():
    posts = []

    def getSuffix(day):
        if day == 1 or day == 21 or day == 31:
            return 'st'
        elif day == 2 or day == 22:
            return 'nd'
        elif day == 3 or day == 23:
            return 'rd'
        else:
            return 'th'

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
                    displayDate = displayDate + ' ' + postDateSplit[0][2:]

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
                           siteMap = siteMap,
                           headerRouteDisplay = '~/Blog',
                           posts=BLOGPOSTS)



""" Art Pages """
@app.route('/art/<category>')
def art(category):
    category = category.lower()
    files = {
        "drawing": "static/resources/images/art/drawing/Drawing.json",
        "photography": "static/resources/images/art/photography/Photography.json",
        "prints": "static/resources/images/art/prints/Prints.json"
    }

    if category not in files:
        return "Not Found", 404


    with open(files[category]) as f:
        artData = json.load(f)
        artData = sorted(
            artData,
            key=lambda x: datetime.strptime(x['date'], "%y-%m-%d"),
            reverse=True
        )

    return render_template(
        'art.html',
        headerRouteDisplay='~/art/' + category,
        siteMap = siteMap,
        artData=artData,
        headerRoute=category
    )



""" Reading Page """

with open('static/resources/data/reading.json', 'r') as f:
    bookData = json.load(f)
    for book in bookData:
        random.seed(book['pages'] * 1)

        alingments = ['end', 'start', 'center']
        directions = ['', '-']
        direction = directions[random.randint(0,1)]

        randomNumbers = {

            # these are NOT the final values. they're seeds for the stuff we dont have
            # in the JSON but want to be consistent.
            # i did it this way because JS doesn't have random.seed(). this stops books
            # jumping all over the place when you reload etc.
            # it does also impove performance slightly to do all the random generation once
            # per server restart, rather on every page load. which i guess is nice.
            # everything is a string bc why not do that conversion here as well, thats how css wants
            # it at the end.

            'zIndex':         random.randint(3,80),
            'border':         str(random.randint(1,3)) + 'px outset #00000080',
            'marginRight':    str(random.randint(0,2)) + 'px',
            'borderRadius':   str(random.randint(0,4)) + 'px',
            'alignItems':     str(alingments[random.randint(0,2)]),
            'rotation':       direction + str(random.uniform(0,0.0021)) + 'turn',
            'rotationY':      str(random.uniform(-15,15)) + 'deg',
            'paddingTop':     str(random.randint(0,13)) + 'px',
            'paddingBottom':  str(random.randint(0,10)) + 'px',
            'translateX':     str(random.uniform(-2,2)) + 'px',
            'titleSizeINT':   random.uniform(3,6),
            'authorSizeINT':  random.randint(0,5),
            'fontWeightINT':  random.uniform(0,9),
            'heightINT':      random.randint(550,700),
            'raiseAmountINT': random.uniform(3,4),
            'brightness':     'brightness(' + str(random.uniform(0.9,1)) + ')',
        }

        book['randomNumbers'] = randomNumbers
@app.route('/about/reading')
def readingReccs():
    return render_template('reading.html',
                           siteMap = siteMap,
                           headerRouteDisplay = '~/about/reading',
                           books = bookData)


""" Abulafia Port """
@app.route('/research/abulafia/chsearch', methods=['GET'])
def companiesHouseSearch():
    print('chsearchcalled')
    rawQuery = request.args.get("query", "").strip()
    searchType = request.args.get("searchType",'').strip()

    searchUrls = {
        'companyList': 'https://api.company-information.service.gov.uk/search/companies',
        'companyDetails': 'https://api.company-information.service.gov.uk/company/',
        'officerList': 'https://api.company-information.service.gov.uk/company/',
        'officerDetails': 'https://api.company-information.service.gov.uk/officers/',
    }

    baseUrl = searchUrls[searchType]

    API_KEY = os.environ["COMPANIES_HOUSE_API_KEY"]

    if not rawQuery:
        return jsonify({"error": "No search term provided"}), 400

    if len(rawQuery) > 100:
        return jsonify({"error": "Query too long"}), 400


    query = rawQuery


    if searchType == 'companyList':
        response = requests.get(
            baseUrl,
            params={
                "q": query,
                "items_per_page": 20
            },
            auth=HTTPBasicAuth(API_KEY, ""),
            timeout=5
        )

    elif searchType == 'companyDetails':
        response = requests.get(
            baseUrl + query,
            auth=HTTPBasicAuth(API_KEY, ""),
            timeout=5
        )

    elif searchType == 'officerList':
        officers = requests.get(
            baseUrl + query + '/officers',
            auth=HTTPBasicAuth(API_KEY, ""),
            timeout=5
        )

        pwsc = requests.get(
            baseUrl + query + '/persons-with-significant-control',
            auth=HTTPBasicAuth(API_KEY, ""),
            timeout=5
        )

        pwsc.raise_for_status()
        officers.raise_for_status()

        combined_data = {
            'officers': officers.json(),
            'pwsc': pwsc.json()
        }

        return jsonify(combined_data)

    elif searchType == 'officerDetails':
        response = requests.get(
            baseUrl + query + '/appointments',
            auth=HTTPBasicAuth(API_KEY, ""),
            timeout=5
        )

    elif searchType == 'TESTofficerSelfDetails':
        print(query)
        queryArray = query.split('~')
        response = requests.get(
            baseUrl + queryArray[0] + '/appointments/' + queryArray[1],
            auth=HTTPBasicAuth(API_KEY, ""),
            timeout=5
        )

    response.raise_for_status()
    return jsonify(response.json())

@app.route('/research/abulafia')
def abulafia():
    return render_template('abulafia.html',
                           siteMap = siteMap,
                           headerRouteDisplay = '~/research/abulafia')





if __name__ == '__main__':
    app.run(debug=True)
