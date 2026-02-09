import os
from flask import Flask, render_template, jsonify, request, abort, redirect
import json; from datetime import datetime; import random; from dotenv import load_dotenv
import requests; from requests.auth import HTTPBasicAuth; from urllib.parse import urlparse

load_dotenv()
os.chdir(os.path.dirname(__file__))  # change CWD to where flask_app.py lives
app = Flask(__name__)


siteMap = [
    '', # not an empty string!!! this is the home route!!! dont remove u idiot!!
    '/projects/YWABM',
    '/projects/isoante',
    '/projects/paranoid',
    '/research/abulafia',
    '/research/councilcash',
    '/research/verisimillitude',
    '/art/photography',
    '/art/prints',
    '/art/drawing',
    '/about/reading',
    '/blog',
]

domain = 'https://www.iso-bel.computer'

"""
Reading Page

"""

with open('static/resources/data/reading.json', 'r') as f:
    bookData = json.load(f)
    for book in bookData:
        random.seed(book['pages'] * 1)

        #alingments = ['end', 'start', 'center']
        alingments = ['center']
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
            'alignItems':     str(alingments[random.randint(0,0)]),
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
                           headerRouteDisplay = '/about/reading',
                           books = bookData)




"""
Homepage & Redirect

"""

def getHomepageWindows():
    windows = []

    # Get the directory where flask_app.py is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    windowsconfig = os.path.join(base_dir, 'templates/homepage/windows.json')

    with open(windowsconfig) as f:
        windows.extend(json.load(f))

    random.shuffle(windows)

    return windows




@app.route('/')
def home():
    return render_template('home.html',
                            windows = getHomepageWindows(),
                            siteMap = siteMap,
                            books = bookData)

@app.route('/go', methods=['POST']) # this is the redirect for the header navigation
def go():

    headerRouteInput = request.form.get('headerRouteInput', '').strip()

    # Remove leading slash and tilde if user included it
    if not headerRouteInput.startswith('/'):
        headerRouteInput = headerRouteInput[1:]
    if headerRouteInput.startswith('~/'):
        headerRouteInput = headerRouteInput[2:]
    # Build the full URL
    full_url = f'{domain}{headerRouteInput}'

    return redirect(full_url)





"""
Blog Page

"""
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
                           headerRouteDisplay = '/blog',
                           posts=BLOGPOSTS)





"""
Art Pages

"""
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
        headerRouteDisplay='/art/' + category,
        siteMap = siteMap,
        artData=artData,
        headerRoute=category
    )








"""
Abulafia Port

"""
API_KEY = os.getenv("COMPANIES_HOUSE_API_KEY")
AUTH = HTTPBasicAuth(API_KEY, "")
CH_URL = 'https://api.company-information.service.gov.uk/'
TIMEOUT = 5

@app.route('/research/abulafia/fetchcompanylist', methods=['GET'])
def fetchCompanyList():
    try:
        query = request.args.get("query", "").strip()
        if not query:
            return jsonify({"error": "No search term provided"}), 400
        if len(query) > 100:
            return jsonify({"error": "Query too long"}), 400

        params = {
            "q": query,
            "items_per_page": 20
        }
        response = requests.get(
            CH_URL + 'search/companies',
            params=params,
            auth=AUTH,
            timeout=TIMEOUT
        )
        response.raise_for_status()
        return jsonify(response.json())
    except Exception:
        print(Exception)

@app.route('/research/abulafia/fetchcompanydetails', methods=['GET'])
def fetchCompanyDetails():
    try:
        companyNumber = request.args.get("companyNumber", "").strip()
        if not companyNumber:
            return jsonify({"error": "No company number provided"}), 400

        response = requests.get(
            CH_URL + f'company/{companyNumber}',
            auth=AUTH,
            timeout=TIMEOUT
        )
        response.raise_for_status()
        return jsonify(response.json())
    except Exception:
        print(Exception)

@app.route('/research/abulafia/fetchofficerlist', methods=['GET'])
def fetchOfficerList():
    try:
        companyNumber = request.args.get("companyNumber", "").strip()
        index = request.args.get("index", "0").strip()
        if not companyNumber:
            return jsonify({"error": "No company number provided"}), 400

        response = requests.get(
            CH_URL + f'company/{companyNumber}/officers?start_index={index}',
            auth=AUTH,
            timeout=TIMEOUT
        )
        print(f'company/{companyNumber}/officers?start_index={index}')
        response.raise_for_status()
        return jsonify(response.json())
    except Exception:
        print(Exception)

@app.route('/research/abulafia/fetchofficerdetails', methods=['GET'])
def fetchOfficerDetails():
    try:
        officerAppointmentLink = request.args.get("link", "0").strip()
        if not officerAppointmentLink:
            return jsonify({"error": "Missing required parameters"}), 400

        response = requests.get(
            CH_URL + '/officers/' + officerAppointmentLink + '/appointments',
            auth=AUTH,
            timeout=TIMEOUT
        )
        response.raise_for_status()
        return jsonify(response.json())
    except Exception:
        print(Exception)



@app.route('/research/abulafia')
def abulafia():
    return render_template('abulafia.html',
                           siteMap = siteMap,
                           headerRouteDisplay = '/research/abulafia')


@app.route('/research/policydash')
def abulafia():
    return render_template('policydash.html',
                           siteMap = siteMap,
                           headerRouteDisplay = '/research/policydash')

"""
Init

"""


if __name__ == '__main__':
    domain = 'http://127.0.0.1:5000' # this makes the header navigation work
                                     # while it's in debug mode
    app.run(debug=True)
