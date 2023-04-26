import React from 'react'
import { Card, Button } from 'react-bootstrap'
import './style.css'

interface SongCardProps {
  song: {
    name: string
    artists: { name: string }[]
    album: { images: { url: string }[] }
  }
  setCurrentTrack: (track: any) => void
  handleRemoveFromPlaylist: (track: any) => void
  buttonType: string
  index: any
}

function SongCard({
  song: {
    name,
    artists,
    album: { images }
  },
  song,
  setCurrentTrack,
  handleRemoveFromPlaylist,
  buttonType,
  index
}: SongCardProps) {
  const getSongName = (name: string) => {
    if (name.length > 30) {
      return name.slice(0, 30) + '...'
    }
    return name
  }

  return (
    <Card className="song-card bg-dark text-white">
      <img src={images[2].url} />
      <Card.Body>
        <Card.Title>{getSongName(name)}</Card.Title>
        <Card.Text>{artists[0].name}</Card.Text>
      </Card.Body>
      {buttonType === 'remove' && (
        <Button
          className="remove-button"
          variant="dark"
          style={{ backgroundColor: '#ee5253', fontSize: '2rem' }}
          onClick={() => handleRemoveFromPlaylist(index)}
          size="lg">
          -
        </Button>
      )}
      {buttonType === 'play' && (
        <Button
          className="play-button"
          variant="dark"
          style={{ backgroundColor: '#1DB954', color: '#1DB954' }}
          onClick={() => setCurrentTrack(song)}>
          <img className="play-button-icon" src={'./playIcon.png'} alt="play button" />
        </Button>
      )}
    </Card>
  )
}

export default SongCard
