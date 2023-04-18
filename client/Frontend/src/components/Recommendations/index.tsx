import { useState, useEffect } from 'react'
import { Row, Card, Button } from 'react-bootstrap'
import SongCard from '../SongCard'

// create a Spotify like box component in react which contains the following items
// - a photo of song
// - play button
// - song name
// - artist name

const TOP_SONGS_GLOBAL_PLAYLIST_ID = '37i9dQZEVXbNG2KDcFcKOF'

interface RecommendationsWrapperProps {
  access_token: string
  setCurrentTrack: (track: any) => void
}

function RecommendationsWrapper({ access_token, setCurrentTrack }: RecommendationsWrapperProps) {
  const [recommendations, setRecommendations] = useState([])
  const [title, setTitle] = useState('Top Songs')

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/get-playlist`, {
      method: 'POST',
      body: JSON.stringify({
        playlist_id: TOP_SONGS_GLOBAL_PLAYLIST_ID,
        playlist_limit: 10,
        access_token
      })
    })
      .then((response: Response) => response.json())
      .then((data: any) => {
        setRecommendations(data.items)
        setTitle('Top Songs')
        console.log('recommendationdata-', data)
      })
      .catch((err) => {
        console.error('Error fetching songs:', err)
      })
  }, [])

  return (
    <Row>
      <Row>
        <h2>
          <b>{title}</b>
        </h2>
      </Row>
      <Row>
        {recommendations.map(({ track }: any) => (
          <SongCard key={track.id} song={track} setCurrentTrack={setCurrentTrack} />
        ))}
      </Row>
    </Row>
  )
}

export default RecommendationsWrapper
