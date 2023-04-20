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
}

function SongCard({
  song: {
    name,
    artists,
    album: { images }
  },
  song,
  setCurrentTrack
}: SongCardProps) {
  return (
    <Card className="song-card bg-dark text-white">
      <img src={images[2].url} />
      <Card.Body>
        <Card.Title>{name}</Card.Title>
        <Card.Text>{artists[0].name}</Card.Text>
      </Card.Body>
      <Button className="play-button" onClick={() => setCurrentTrack(song)}>
        <img className="play-button-icon" src={'./playIcon.png'} alt="play button" />
      </Button>
    </Card>
  )
}

export default SongCard
