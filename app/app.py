import datetime
from flask import Flask, request, session, redirect, jsonify
import requests
import base64
from flask_cors import CORS
from config import CLIENT_ID, CLIENT_SECRET, SECRET_KEY
import random
import string
import json
import pandas as pd
from transform_input import *
import subprocess
import json
from ast import literal_eval
import os
from google.cloud import storage

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
    body = request.form
    refresh_token = body['refresh_token']
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
    return resp.json()

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

@app.route('/fetch-track-details', methods=['POST'])
def fetchTrackDetails():
    request_body = json.loads(request.data.decode('utf-8'))
    job_response = []
    uuid = request_body['uid']
    input_features = get_audio_features(request_body)
    # print('result: ',features)
    input_genres = ['country','rock','metal']
    
    print('response: ', response)
    
    # if response == 0:
    #     print("The job execution was successful")
    #     recommendations = fetchOutput(uuid)
    #     print('recommendations: \n\n', recommendations)
    # else:
    #     print("The job execution was unsuccessful")
    
    # recommendations = [['7uZmONqDppfco4s50aMmx1', '0.83873284'], ['4q59sjdPPQmGjDVGsx02Hy', '0.83777577'], ['1Lqtw8APVMD23acOllUfUu', '0.8375196'], ['6rUt2EDnaqMKUsEb0qygwz', '0.8367458'], ['7d0DM0z1IWGIyXwlgudr64', '0.8316435'], ['3RG2P8VtBOUKdMdUaZHUv3', '0.8272706'], ['7oRIUDYMbWbHdwrx8HqfIH', '0.8224505'], ['6FLYWuM0AMPiJ9cyogNmGe', '0.8212282'], ['1ptpvqV9Rnoi8ZJ596tmB3', '0.82101995'], ['3xq8LCDTE2pvV06DmCn2xZ', '0.81956'], ['0d4iukDS3mdXnXS3JlozvT', '0.81803393'], ['40jCPYWzUkcqwSL7EzUfDW', '0.8180007'], ['11L0WvaQ3FOe4WFyOIGX0h', '0.8170904'], ['4HQuGLKECg9iwtKOG6gnYn', '0.8165051'], ['07orPfKPhbyceTuSlk6cZM', '0.81594497'], ['4EWA5n8mJZhgKIbI35Nzpd', '0.8148775'], ['015ljpgRzoOEwCEST5CGbb', '0.8142322'], ['3xnIizYJrsNft0njBILhhg', '0.8138499'], ['7f0O6FvS1fZ8CgVE2Yxssq', '0.81366044'], ['3m1jHtGgKbEMriNxCf2ohq', '0.81267977'], ['0Q0KufPcFv8JdcZD37lkYV', '0.8124509'], ['53SfNSJPGJhzAaHNJ5FF2o', '0.81212676'], ['1OhhzbdbjE5EYjA3V5EqtD', '0.81169087'], ['00S8vsrd1qrug1GmNHRevC', '0.8116732'], ['5eIpaJBmXyHffX9JxPuuQZ', '0.81111956'], ['6kboD51CMtlnkBtcKy3jTe', '0.81088287'], ['0hGhA3dy4OoVEUkTjP2hGb', '0.8105324'], ['3eeS7jfbVARmwKEOE7FCe8', '0.8103645'], ['7bZmlvSStaZaYy0sqAOhcG', '0.81028'], ['574wV3oIO2ydHDz5EUexeH', '0.8100649'], ['3SVkAD87rNdCbuC8eP91pj', '0.8095997'], ['5nJZEIBOBgTUwEiCycoh8R', '0.80941516'], ['29D2tESU7h1i9ARMDO7PBv', '0.80936706'], ['1zHR191BSzcwKRKUhxkQDV', '0.8093202'], ['36XGpbnqbGNifCbI2CaaZ8', '0.8091824'], ['1S5cmaCz64GvErRb6l6zt6', '0.8091824'], ['1xqtzNUgDPIPk5y8oP9SDC', '0.8091824'], ['4y17KLlgZdpyW9ON2FFpIf', '0.8086421'], ['6sIXiFGXnKe3mlrUlRRpss', '0.808428'], ['4eNz7NWSTM5A5Daxod2dX2', '0.8083198']]
    # print('recommendations-', recommendations)
    
    # return jsonify({'recommendations':recommendations})
    return 'job triggered successfully'



#The function fetches granular level audio features for each track of the playlist
def get_audio_features(request_body):
    
    result_playlist = []
    playlist_audio_features = []
    
    #fetch access token from the request body
    access_token = request_body['access_token']
    
    #authentication and header details
    auth = 'Bearer '+ access_token
    headers = {'Authorization': auth}
    
    #extract track level details
    for item in request_body['playlist']:
        track_id = item['id']
        track_name = item['name']
        track_artists = [artist['name'] for artist in item['artists']]
        print('track_artist', track_artists[0])
        track_first_artist = item['artists'][0]['name']


        track = {
            'id': track_id,
            'name': track_name,
            'all_artists': track_artists,
            'first_artist': track_first_artist
        }
        
        print('track',track)
        result_playlist.append(track)
        
        #fetch audio features for each track
        features = requests.get(f'https://api.spotify.com/v1/audio-features/{track_id}', headers=headers)
        features = features.json()
        
        track_audio_features = {
            'id' : track['id'],
            'title' : track['name'],
            'first_artist' : track['first_artist'],
            'all_artists' : track['all_artists'],
            'danceability' : features['danceability'],
            'energy' : features['energy'],
            'key' : features['key'],
            'loudness' : features['loudness'],
            'mode' : features['mode'],
            'acousticness' : features['acousticness'],
            'instrumentalness' : features['instrumentalness'],
            'liveness' : features['liveness'],
            'valence' : features['valence'],
            'tempo' : features['tempo'],
            'duration_ms' : features['duration_ms'],
            'time_signature' : features['time_signature'],
            'speechiness': features['speechiness']
        }
        
        print('track_audio_features: ',track_audio_features)
        
        playlist_audio_features.append(track_audio_features)
        
    column_features = ['id', 'title', 'first_artist', 'all_artists', 'danceability', 'energy', 'key', 'loudness', 'mode', 'acousticness', 
                       'instrumentalness', 'liveness', 'valence', 'tempo', 'duration_ms', 'time_signature','speechiness']
    
    rows = [[track['id'], track['title'], track['first_artist'], track['all_artists'], track['danceability'], track['energy'], track['key'],
            track['loudness'], track['mode'], track['acousticness'], track['instrumentalness'], track['liveness'], track['valence'], track['tempo'],
            track['duration_ms'], track['time_signature'], track['speechiness'] ] for track in playlist_audio_features]
    
    #tranforming into dataframe
    features_df = pd.DataFrame(rows, columns=column_features)
    
    print('features_df: \n\n',features_df)
    
    #appending additional features and encoding them
    transformed_input = transform_input_features(features_df)
    print('transformed_input: \n\n',transformed_input)
    
    return transformed_input
    
#The function is used to trigger the main recommendation spark job
def trigger_recommend_job(transformed_input,uuid,input_genres):
    jobExecFile = 'server.py'
    # set key credentials file path
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"./credentials.json"
    # r"./credentials.json"
    #converting the dataframe into a string literal
    transformedInput_string = transformed_input.to_string()
    #transformedInput_string = transformed_input.to_string(index=False)
    #transformedInput_string = transformed_input.values.tolist()
    print('type of transformedInput_string: ',transformedInput_string)
    # cmd = ['python', jobExecFile] + list(transformedInput_string)
    # result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    result = subprocess.call(['python3', 'server.py', transformedInput_string,str(uuid), ",".join(input_genres)])
    # if result.returncode != 0:
    #     print(f"Error running {jobExecFile}:")
    #     print(result.stderr)
    # else:
    #     print(result.stdout)
    print('result: ',result)
    return result

@app.route('/poll-data', methods=['GET'])
def fetchOutput():
    args = request.args
    uuid = args.get('uuid')
    access_token = args.get('access_token')
    print('flask uuid-', uuid)
    # set key credentials file path
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"/home/pritalee/BDArchitecture/Big-Data-Architecture-Project/app/spotifysongrecommendation-adc2bc147649.json"

    storage_client = storage.Client()
    bucket = storage_client.bucket('nsr_data')
    file_content = list()
    blobs = bucket.list_blobs(prefix=str(uuid)+".csv")
    #print(type(blobs))
    for i, blob in enumerate(blobs):
      if i > 1:
        #print(blob)
        content = blob.download_as_bytes()
        content = str(content).split('b\'')[1].split('\\n')[1:-1]
        #print(content)
        for data in content:
          data = data.split(",")
          file_content.append(data)
        #file_content.append(blob.download_as_string())
    print(file_content)

    df = pd.DataFrame(file_content[:20], columns=['id_ctf', 'cosine_similarity'])

    return get_song_details(file_content, access_token)


#create a function to fetch song details from spotifyAPI using track id
def get_song_details(results, access_token):
    recommendations = []
    for track in results:
        track_id = track[0]
        track_score = track[1]

        auth = 'Bearer '+ access_token
        headers = {'Authorization': auth}
        SEARCH_ENDPOINT = "{}/{}/{}".format(SPOTIFY_API_URL, 'tracks', track_id)
        resp = requests.get(SEARCH_ENDPOINT, headers=headers)
        resp = resp.json()
        resp['similarity_score'] = track_score
        recommendations.append({'track': resp})

    return jsonify({'recommendations':recommendations})

    



