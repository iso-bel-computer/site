import os
from flask import Flask, render_template, jsonify, request, abort, redirect
import json; from datetime import datetime; import random; from dotenv import load_dotenv
import requests; from requests.auth import HTTPBasicAuth; from urllib.parse import urlparse
from flask_cors import CORS

load_dotenv()
os.chdir(os.path.dirname(__file__))  # change CWD to where flask_app.py lives
app = Flask(__name__)

CORS(app, resources={r"/static/webring/*": {"origins": "*"}})
siteMap = [
    '', # not an empty string!!! this is the home route!!! dont remove u idiot!!
    '/projects/YWABM - UNDER CONSTRUCTION',
    '/projects/isoante - UNDER CONSTRUCTION',
    '/projects/paranoid - UNDER CONSTRUCTION',
    '/research/abulafia',
    '/art/photography',
    '/art/prints',
    '/art/drawing',
    '/about/reading',
    '/writing/poetry',
    '/writing/blog',
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
    for window in windows:
        window['top'] = random.randint(1, 500)
        window['left'] = random.randint(1, 500)


    return windows

def getGuestbookMessages():

    with open('static/resources/data/guestbookmessages.json', 'r') as f:
        guestbookmessages = json.load(f)
        return guestbookmessages

WINDOWS = getHomepageWindows()
GUESTBOOKMESSAGES = getGuestbookMessages()

@app.route('/')
def home():
    return render_template('home.html',
                            windows = WINDOWS,
                            guestbookmessages = GUESTBOOKMESSAGES,
                            siteMap = siteMap,
                            books = bookData)

@app.route('/submit/guestbookmessage', methods=['POST'])
def submitMessage():
    try:
        name = request.form.get("name", "").strip()
        message = request.form.get("message", "").strip()
        date = datetime.now().strftime('%B %d, %Y')

        if not name:
            return jsonify({"response": "What's your name, stranger?"}), 400
        if not message:
            return jsonify({"response": "Cat got your tongue?"}), 400
        if len(name) > 200:
            return jsonify({"response": "Name too long... Are you some kind of aristo?"}), 400
        if len(message) > 2000:
            return jsonify({"response": "Like the sound of your own voice?"}), 400

        bannedWords = ['nigger', 'tranny', 'fuck you']
        if any(word in message.lower() for word in bannedWords):
            return jsonify({"response": "🖕"}), 422

        newMessage = {
            "user": name,
            "date": date,
            "message": message
        }

        GUESTBOOKMESSAGES.insert(0, newMessage)

        with open('static/resources/data/guestbookmessages.json', 'w') as f:
            f.write(json.dumps(GUESTBOOKMESSAGES, indent=4))

        return jsonify({"response":"thanks <3"}), 200



    except Exception as e:
        print(e)
        return jsonify({"response": "something broke :("}), 500



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
@app.route('/writing/blog')
def blog():
    return render_template('blog.html',
                           siteMap = siteMap,
                           headerRouteDisplay = '/writing/blog',
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
Poetry

"""

@app.route('/writing/poetry')
def poetry():
    return render_template('poetry.html',
                           siteMap = siteMap,
                           headerRouteDisplay = '/htmlworkshop')

"""
Permacomputing Webring

"""

@app.route('/webringsubmiturl')
def submiturl():
    try:
        url = request.args.get("url", "").strip()

        if not url:
            return jsonify({"response": "No url provided :("}), 400
        # Auto-add https:// if missing
        if not url.startswith(("http://", "https://")):
            url = "https://" + url

        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return jsonify({"response": "Invalid URL"}), 400

        if "." not in parsed.netloc:
            return jsonify({"response": "Invalid domain"}), 400

        if len(url) > 150:
            return jsonify({"response": "URL too long"}), 400

        with open('static/webring/submittedurls.txt', 'a') as f:
            f.write(url + "\n")

        return jsonify({"response":"URL submitted :)"}), 200



    except Exception as e:
        print(e)
        return jsonify({"response": "Server error"}), 500


@app.route('/permacomputingwebring')
def webring():
    return render_template('webring.html',
                           siteMap = siteMap,
                           headerroutedisplay = '/permacomputingwebring')

"""
HTML Workshop

"""


@app.route('/htmlworkshop')
def htmlworkshop():
    return render_template('htmlworkshop.html',
                           siteMap = siteMap,
                           headerroutedisplay = '/htmlworkshop')
@app.route('/demo')
def demo():
    return render_template('demo.html')


"""
Tube sounds

"""


with open('static/resources/tubesounds/stationData.json', 'r') as f:

    stationData = json.load(f)

@app.route('/tubesounds')
def tubesounds():

    return render_template('tubesounds.html',
                           stationData = stationData,
                           sitemap = siteMap,
                           headerroutedisplay = '/tubesounds')




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
def policydash():
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
