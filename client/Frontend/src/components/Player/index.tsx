import { useState, useEffect } from 'react'
import SpotifyPlayer from 'react-spotify-web-playback'

function SpotifyPlayerWrapper({
  token,
  track
}: {
  token: string
  track: {
    album: {
      images: {
        url: string
      }[]
    }
    name: string
    artists: {
      name: string
    }[]
    uri: string
  }
}) {
  const [isPaused, setIsPaused] = useState(false)

  if (!track.uri)
    return (
      <div
        className="spotify-player-default"
        style={{
          backgroundColor: '#333',
          color: '#fff'
        }}>
        Select a Song to Play
      </div>
    )
  return (
    <div className="spotify-player">
      <SpotifyPlayer
        token={token}
        uris={track ? [track.uri] : []}
        play={isPaused}
        styles={{
          activeColor: '#fff',
          bgColor: '#333',
          color: '#fff',
          loaderColor: '#fff',
          sliderColor: '#1cb954',
          trackArtistColor: '#ccc',
          trackNameColor: '#fff'
        }}
      />
    </div>
  )
}

export default SpotifyPlayerWrapper
