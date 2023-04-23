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
  setRecommendations: (recommendations: any) => void
  recommendations: any
  title: string
  setTitle: (title: string) => void
}

function RecommendationsWrapper({
  access_token,
  setCurrentTrack,
  setRecommendations,
  recommendations,
  title,
  setTitle
}: RecommendationsWrapperProps) {
  return (
    <Row>
      <Row>
        <h2>
          <b className="text-white">{title}</b>
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
