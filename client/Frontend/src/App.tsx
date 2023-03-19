import { useState, useEffect} from 'react';
import './App.css';
import SpotifyPlayerWrapper from './components/Player';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: any;
    Spotify: any;
  }
}

function App() {
  // Save access_token from spotify
  const [token, setToken] = useState("");
  const [topTracks, setTopTracks] = useState([{'track': {name: '', artists: [{name: ''}]}}]);
  const [currentTrack, setCurrentTrack] = useState({});

  // call the backend route API
  useEffect(() => {
    fetch("http://127.0.0.1:5000/")
      .then(response => response.json())
      .then(data => setToken(data.access_token));
  }, []);

  
  useEffect(() => {
    fetch("http://127.0.0.1:5000/get-playlist?id=37i9dQZEVXbMDoHDwVN2tF&limit=20")
      .then(response => response.json())
      .then(data => setTopTracks(data.items));
  }, []);

  // Extract track object from each item from the API response
  const trackList = topTracks.map(({track}, index) => {
    return (
      <div key={index}>
        <p onClick={() => setCurrentTrack(track)}>{track.name} - {track.artists[0].name}</p>
      </div>
    )
  })

  return (
    <div className="App">
      <div>
        <h1>Top Tracks</h1>
        {trackList}
      </div>
      {token && <SpotifyPlayerWrapper track={currentTrack} token={token}/>}
    </div>
  );
}

export default App;
