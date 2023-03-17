from flask import Flask, request, redirect, session
import requests
import base64
from config import CLIENT_ID, CLIENT_SECRET, SECRET_KEY


app = Flask(__name__)
app.secret_key = SECRET_KEY


SPOTIFY_API_BASE_URL = 'https://api.spotify.com'
API_VERSION = "v1"
SPOTIFY_API_URL = "{}/{}".format(SPOTIFY_API_BASE_URL, API_VERSION)

REDIRECT_URI = 'http://127.0.0.1:5000'
SCOPE = 'playlist-modify-private,playlist-modify-public,user-top-read'
SHOW_DIALOG = True


@app.route('/')
def authorize():
   
    auth_header = base64.b64encode((CLIENT_ID + ':' + CLIENT_SECRET).encode('ascii')).decode('ascii')
    auth_options = {
        'url': 'https://accounts.spotify.com/api/token',
        'headers': {
            'Authorization': 'Basic ' + auth_header
        },
        'form': {
            'grant_type': 'client_credentials'
        },
        'json': True
    }
    response = requests.post(auth_options['url'], headers=auth_options['headers'], data=auth_options['form'])

    if response.status_code == 200:
        token = response.json()['access_token']
        session['token'] = token
        return 'Token stored in session!'
    else:
        return 'Error: Unable to get access token'
    


SEARCH_ENDPOINT = "{}/{}".format(SPOTIFY_API_URL, 'search')
@app.route('/search-track')
def searchSongs():
    args = request.args
    name = args.get('name')
    search_type = args.get('search_type')
    if search_type not in ['artist', 'track', 'album', 'playlist']:
        print('invalid type')
        return None

    qparams = {'type': search_type}
    qparams['q'] = name

    token = session.get('token')
    auth = 'Bearer '+token
    headers = {'Authorization': auth}

    resp = requests.get(SEARCH_ENDPOINT, params=qparams, headers=headers)

    return resp.json()


TOP20_SONGS_ENDPOINT = "{}/{}/{}".format(SPOTIFY_API_URL, 'browse', 'new-releases')
@app.route('/top20')
def top20():
    
    qparams = {'limit': 20}

    token = session.get('token')
    auth = 'Bearer '+token
    headers = {'Authorization': auth}

    resp20 = requests.get(TOP20_SONGS_ENDPOINT, params=qparams, headers=headers)

    return resp20.json()
