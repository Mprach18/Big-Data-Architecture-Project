import { useState, useEffect } from 'react';
import SpotifyPlayer from 'react-spotify-web-playback';

function SpotifyPlayerWrapper({
  token,
  track
}: {
  token: string;
  track: {
    album: {
      images: {
        url: string;
      }[];
    };
    name: string;
    artists: {
      name: string;
    }[];
    uri: string;
  };
}) {
  const [isPaused, setIsPaused] = useState(false);

  /*
    useEffect(() => {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: 'Project Web Playback SDK',
          getOAuthToken: (cb: (arg0: string) => void) => {
            cb(token);
          },
          volume: 0.5
        });

        setPlayer(player);

        player.addListener('ready', ({ device_id = '' }) => {
          console.log('Ready with Device ID', device_id);
        });

        player.addListener('not_ready', ({ device_id = '' }) => {
          console.log('Device ID has gone offline', device_id);
        });

        player.addListener(
          'player_state_changed',
          (state: {
            track_window: { current_track: any };
            paused: boolean | ((prevState: boolean) => boolean);
          }) => {
            console.log(state);
            if (!state) {
              return;
            }

            setTrack(state.track_window.current_track);
            setPaused(state.paused);

            player.getCurrentState().then((state: any) => {
              !state ? setActive(false) : setActive(true);
            });
          }
        );

        player.connect().then((success: any) => {
          if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
          }
        });
      };
    }, []);

    if (!is_active) {
      return (
        <>
          <div className="container">
            <div className="main-wrapper">
              <b> Instance not active. Transfer your playback using your Spotify app </b>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="container">
            <div className="main-wrapper">
              <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />

              <div className="now-playing__side">
                <div className="now-playing__name">{current_track.name}</div>
                <div className="now-playing__artist">{current_track.artists[0].name}</div>

                <button
                  className="btn-spotify"
                  onClick={() => {
                    player.previousTrack();
                  }}>
                  &lt;&lt;
                </button>

                <button
                  className="btn-spotify"
                  onClick={() => {
                    player.togglePlay();
                  }}>
                  {is_paused ? 'PLAY' : 'PAUSE'}
                </button>

                <button
                  className="btn-spotify"
                  onClick={() => {
                    player.nextTrack();
                  }}>
                  &gt;&gt;
                </button>
              </div>
            </div>
          </div>
        </>
      );
  */

  if (!track.uri) return <div className="spotify-player-default">Select a Song to Play</div>;
  return (
    <div className="spotify-player">
      <SpotifyPlayer token={token} uris={track ? [track.uri] : []} play={isPaused} />
    </div>
  );
}

export default SpotifyPlayerWrapper;
