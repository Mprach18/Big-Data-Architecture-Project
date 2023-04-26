import { useState, useEffect } from 'react'
import { Row, Card, Button } from 'react-bootstrap'
import SongCard from '../SongCard'

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
    <Row className="row d-flex justify-content-center" style={{ padding: '0rem 1.5rem' }}>
      <Row>
        <h2>
          <b className="text-white">{title}</b>
        </h2>
      </Row>
      <Row>
        {recommendations.map(({ track }: any) => (
          <SongCard
            key={track.id}
            song={track}
            setCurrentTrack={setCurrentTrack}
            index={track.id}
            buttonType="play"
            handleRemoveFromPlaylist={() => console.log('remove from playlist')}
          />
        ))}
      </Row>
    </Row>
  )
}

export default RecommendationsWrapper
