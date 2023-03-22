import { useState, useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';
import SpotifyPlayerWrapper from './components/Player';
import Login from './login';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import MainPage from './mainPage';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: any;
    Spotify: any;
  }
}
// import Button from 'react-bootstrap/Button';
// import Tab from 'react-bootstrap/Tab';
// import Tabs from 'react-bootstrap/Tabs';
// import Card from 'react-bootstrap/Card';
// import { Container, Form } from "react-bootstrap"
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
// import 'bootstrap/dist/css/bootstrap.min.css';
//import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';


function App() {
  const location = useLocation();
  // Save access_token from spotify
  const [topTracks, setTopTracks] = useState([{'track': {name: '', artists: [{name: ''}]}}]);
  const [currentTrack, setCurrentTrack] = useState({});

  // call the backend route API
  useEffect(() => {
    const url = location.search
    const urlParams = new URLSearchParams(url)
    const QueryParams = Object.fromEntries(urlParams);
    if (QueryParams['access_token']) {
      localStorage.setItem('SESSION_INFO', JSON.stringify(QueryParams));
    }
  }, [location.search]);

  // useEffect(() => {

  //   fetch("http://127.0.0.1:5000/get-playlist?id=37i9dQZEVXbMDoHDwVN2tF&limit=20")
  //     .then(response => response.json())
  //     .then(data => setTopTracks(data.items));
  // }, []);
  

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
        <Routes>
              <Route path='/login' element={< Login />}></Route>
              <Route path='/' element={< MainPage />}></Route>
        </Routes>

      {/* <div>
        <h1>Top Tracks</h1>
        {trackList}
      </div>
      {token && <SpotifyPlayerWrapper track={currentTrack} token={token}/>} */}
    </div>
  );
}

export default App;