import React, { useState, useEffect } from 'react';
import SpotifyPlayer from 'spotify-web-playback';

function SpotifyPlayerWrapper({
    token,
    track,
}: {
    token: string;
    track: any;
}) {
    const [player, setPlayer] = useState(undefined);
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState(track);

    useEffect(() => {

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
            name: 'Web Playback SDK',
            getOAuthToken: (cb: (arg0: string) => void) => {cb(token)},
            volume: 0.5
        });

        setPlayer(player);

        player.addListener('ready', ({ device_id='' }) => {
            console.log('Ready with Device ID', device_id);
        });

        player.addListener('not_ready', ({ device_id='' }) => {
            console.log('Device ID has gone offline', device_id);
        });

        player.addListener('player_state_changed', ( (state: { track_window: { current_track: any; }; paused: boolean | ((prevState: boolean) => boolean); }) => {
            if (!state) {
                return;
            }

            setTrack(state.track_window.current_track);
            setPaused(state.paused);

            player.getCurrentState().then( (state: any) => { 
                (!state)? setActive(false) : setActive(true) 
        });

}));

        player.connect();
    };
}, []);

    return (
        <div className="player">
            <div className="player__body" style={{border: '1px solid black', padding: '10px'}}>
                {track.name}
            </div>
            <div className="container">
            <div className="main-wrapper">
                <div className="now-playing__side">
                    <div className="now-playing__name">{current_track.name}</div>
                    {/* <div className="now-playing__artist">{current_track.artists[0].name}</div> */}
                </div>
            </div>
        </div>
        </div>
    )
}

export default SpotifyPlayerWrapper;
