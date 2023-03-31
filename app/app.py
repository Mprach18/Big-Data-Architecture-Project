import datetime
from flask import Flask, request, session, redirect
import requests
import base64
from flask_cors import CORS
from config import CLIENT_ID, CLIENT_SECRET, SECRET_KEY
import random
import string
import json

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
app.secret_key = SECRET_KEY

SPOTIFY_API_BASE_URL = 'https://api.spotify.com'
API_VERSION = "v1"
SPOTIFY_API_URL = "{}/{}".format(SPOTIFY_API_BASE_URL, API_VERSION)

# Authorization endpoints
SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

REDIRECT_URI = 'http://127.0.0.1:5000/callback'
SCOPE = 'playlist-modify-private,playlist-modify-public,user-top-read,streaming,user-read-email,user-read-private,user-read-playback-state,user-modify-playback-state'
SHOW_DIALOG = True

SESSION_INFO = {
    'access_token': None,
    'refresh_token': None,
    'expires_in': None,
    'token_type': None,
    'date': None,
}

# Create Endpoint to fetch access token from spotify
@app.route('/login')
def login():
    state = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
    session['state'] = state
    params = {
        'response_type': 'code',
        'client_id': CLIENT_ID,
        'scope': SCOPE,
        'redirect_uri': REDIRECT_URI,
        'state': state
    }
    url = SPOTIFY_AUTH_URL + '?' + requests.compat.urlencode(params)
    return redirect(url)

@app.route('/callback')
def callback():
    # Verify state parameter
    print(request.args.get('state'), session['state'])
    if request.args.get('state') != session['state']:
        return 'Error: state parameter does not match'
    
    # Exchange code for access token
    code = request.args.get('code')
    auth_header = base64.b64encode(f'{CLIENT_ID}:{CLIENT_SECRET}'.encode()).decode()
    headers = {'Authorization': f'Basic {auth_header}', "Content-Type": "application/x-www-form-urlencoded"}
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI
    }
    response = requests.post(SPOTIFY_TOKEN_URL, headers=headers, data=data)
    print('reached here')
    response = response.json()
    response['date'] = datetime.datetime.now()

    # Save access token to session
    return redirect('http://localhost:3000/?' + requests.compat.urlencode(response))

# Make a request to the Spotify API to refresh the access token
# make it a post request
@app.route('/refresh', methods=['POST'])
def refresh():
    auth_header = base64.b64encode(f'{CLIENT_ID}:{CLIENT_SECRET}'.encode()).decode()
    headers = {'Authorization': 'Basic ' + auth_header}
    if(request.data):
        refresh_token = json.loads(request.data.decode('utf-8'))['refresh_token']
    data = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
    }
    response = requests.post(SPOTIFY_TOKEN_URL, headers=headers, data=data)
    response = response.json()
    response['date'] = datetime.datetime.now()
    return response

@app.route('/')
def index():
    response = login()
    print(response)
    return response

SEARCH_ENDPOINT = "{}/{}".format(SPOTIFY_API_URL, 'search')
@app.route('/search-track')
def searchSongs():
    args = request.args
    name = args.get('name')
    print(name)
    search_type = args.get('search_type')
    access_token = args.get('access_token')
    if search_type not in ['artist', 'track', 'album', 'playlist']:
        print('invalid type')
        return None

    qparams = {'type': search_type}
    qparams['q'] = name

    auth = 'Bearer '+ access_token
    headers = {'Authorization': auth}

    resp = requests.get(SEARCH_ENDPOINT, params=qparams, headers=headers)
    print(resp)
    return resp.json()


# TOP20_SONGS_ENDPOINT = "{}/{}/{}".format(SPOTIFY_API_URL, 'browse', 'new-releases')
# @app.route('/top20')
# def top20():
#     qparams = {'limit': 20}
#     token = get_session_info()['access_token']
#     auth = 'Bearer '+ token
#     headers = {'Authorization': auth}

#     resp20 = requests.get(TOP20_SONGS_ENDPOINT, params=qparams, headers=headers)
#     return resp20.json()

GET_PLAYLIST_ENDPOINT = "{}/{}".format(SPOTIFY_API_URL, 'playlists')
@app.route('/get-playlist', methods=['POST'])
def getPlaylist():
    request_body = json.loads(request.data.decode('utf-8'))
    playlist_id = request_body['playlist_id']
    playlist_limit = str(request_body['playlist_limit'])
    access_token = request_body['access_token']
    auth = 'Bearer '+access_token
    headers = {'Authorization': auth}

    endpoint = GET_PLAYLIST_ENDPOINT+'/'+playlist_id + '/tracks'
    if playlist_limit is not None:
        endpoint += '?limit='+playlist_limit
        
    resp = requests.get(endpoint, headers=headers)
    return resp.json()

