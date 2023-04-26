import { useEffect, useState } from 'react'
import './style.css'
import Button from 'react-bootstrap/Button'
import { Container, Form, ListGroup } from 'react-bootstrap'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import 'bootstrap/dist/css/bootstrap.min.css'
import useAccessToken from '../hooks/useAccessToken'
import SpotifyPlayerWrapper from './Player'
import RecommendationsWrapper from './Recommendations'
import ItemList from './Playlist'
import * as CryptoJS from 'crypto-js'
import Select from 'react-select'
import { WaveSpinner } from 'react-spinners-kit'
import SongCard from './SongCard'
interface playlistItem {
  name: string
  id: number
  album: {
    images: {
      url: string
    }[]
  }
  artists: {
    name: string
    href: string
  }[]
}

const SERVER_URL = 'http://127.0.0.1:5000'
const TOP_SONGS_GLOBAL_PLAYLIST_ID = '37i9dQZEVXbNG2KDcFcKOF'

function MainPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [playlist, setPlaylist] = useState<playlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [title, setTitle] = useState('Top Songs')
  const [progress, setProgress] = useState(0)
  const genresOptions = [
    { value: 'pop', label: 'pop' },
    { value: 'rock', label: 'rock' },
    { value: 'hiphop', label: 'hiphop' },
    { value: 'jazz', label: 'jazz' },
    { value: 'classical', label: 'classical' },
    { value: 'country', label: 'country' },
    { value: 'blues', label: 'blues' },
    { value: 'metal', label: 'metal' },
    { value: 'orchestra', label: 'orchestra' }
  ]
  const [currentTrack, setCurrentTrack] = useState({
    album: {
      images: [
        {
          url: ''
        }
      ]
    },
    name: '',
    artists: [
      {
        name: ''
      }
    ],
    uri: ''
  })
  const { accessToken, isLoading } = useAccessToken()

  let iid: string | number | NodeJS.Timer | undefined

  useEffect(() => {
    if (accessToken) {
      fetch(`${SERVER_URL}/get-playlist`, {
        method: 'POST',
        body: JSON.stringify({
          playlist_id: TOP_SONGS_GLOBAL_PLAYLIST_ID,
          playlist_limit: 10,
          access_token: accessToken
        })
      })
        .then((response: Response) => response.json())
        .then((data: any) => {
          setRecommendations(data.items)
          setTitle('Top Songs')
        })
        .catch((err) => {
          console.error('Error fetching songs:', err)
        })
    }
  }, [accessToken])

  function handleChange({ target: { value = '' } }) {
    setSearchTerm(value)
    console.log('searchTerm-', searchTerm)

    const url = `${SERVER_URL}/search-track`

    if (value.length > 3) {
      fetch(`${url}?name=${value}&search_type=track&access_token=${accessToken}`, {
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('data-', data)
          setSearchResults(data.tracks.items)
        })
        .catch((error) => console.log('api error-', error))
    }
  }

  const handleGenreSelectOption = (options: any) => {
    console.log('option-', options)
    // edit array to only store values
    const selectedOptions = options.map((option: any) => option.value)
    setSelectedGenre(selectedOptions)
  }

  const handleAddToPlaylist = (item: playlistItem) => {
    // If item is already in playlist, don't add it again
    if (playlist.some((playlistItem) => playlistItem.id === item.id)) {
      return
    }
    setPlaylist([...playlist, item])
  }

  const handleRemoveFromPlaylist = (index: number) => {
    const updatedPlaylist = [...playlist]
    updatedPlaylist.splice(index, 1)
    setPlaylist(updatedPlaylist)
  }

  const findHash = (items: playlistItem[]) => {
    const idArr = items.map((item) => item.id)
    const hash = CryptoJS.SHA256(idArr.join('')).toString() // create hash from array of id
    return hash
  }

  const pollData = (uuid: string) => {
    const url = `${SERVER_URL}/poll-data`
    console.log('uuid-', uuid)
    setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 2.8))
    console.log('progress-', progress)
    fetch(`${url}?uuid=${uuid}&access_token=${accessToken}`, {
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('poll data recommendations-', data)
        if (iid && data.recommendations.length > 0) {
          clearInterval(iid)
          setLoading(false)
          setTitle('Recommendations')
          setRecommendations(data.recommendations)
        }
      })
      .catch((error) => console.log('poll-data api error-', error))
  }

  function sendData() {
    const url = `${SERVER_URL}/fetch-track-details`
    const uuid = findHash(playlist)
    const data = {
      playlist: playlist,
      uid: uuid,
      access_token: accessToken,
      genres: selectedGenre,
      no_of_recommendations: 5
    }
    console.log('send data-', data)
    setLoading(true)
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          iid = setInterval(() => {
            pollData(uuid)
          }, 5000)
          setLoading(true)
        } else {
          setLoading(false)
        }
      })
      .catch((error) => {
        console.log('api error-', error)
        setLoading(false)
      })
  }

  if (!accessToken || isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <nav
        className="navbar navbar-dark bg-light p-3"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgb(57 67 82), #000)' }}>
        <span className="navbar-brand mb-0 h1">
          <img
            src={'./SoundScape.png'}
            width="164"
            height="42"
            className="d-inline-block align-top"
            alt=""
          />
        </span>
      </nav>
      <Container className="main bg-black">
        <Row>
          <Col className="Search d-flex align-items-center" style={{ flexDirection: 'column' }}>
            <Row>
              <Col className="h2 text-white">Add Songs</Col>
            </Row>
            <Row style={{ padding: '1.5rem' }}>
              <Col>
                <div className="row">
                  <div className="col-lg-10">
                    <Form.Control
                      type="text"
                      placeholder="Search Songs"
                      value={searchTerm}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-lg-2">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="pr-1"
                      onClick={() => setSearchTerm('')}>
                      Clear
                    </Button>
                  </div>
                </div>
              </Col>
              {searchTerm && (
                <div className="row">
                  <div className="col-10" style={{ zIndex: 2 }}>
                    {searchResults && (
                      <ItemList onChildData={handleAddToPlaylist} items={searchResults} />
                    )}
                  </div>
                </div>
              )}
              {!searchTerm && (
                <>
                  {playlist.length > 0 && (
                    <>
                      <div
                        className="flex-grow-1 my-2 bg-black text-white"
                        style={{ overflowY: 'auto' }}>
                        <ListGroup>
                          {playlist.map((playlistItem, index) => (
                            <SongCard
                              key={index}
                              song={playlistItem}
                              setCurrentTrack={setCurrentTrack}
                              buttonType="remove"
                              handleRemoveFromPlaylist={handleRemoveFromPlaylist}
                              index={index}
                            />
                          ))}
                        </ListGroup>
                      </div>
                      <Row className="d-flex justify-content-center">
                        <Col className="text-start col-lg-12 p-3">
                          <Select
                            isMulti
                            placeholder="Select Genres"
                            options={genresOptions}
                            onChange={handleGenreSelectOption}
                            autoFocus={true}
                          />
                        </Col>
                        <Col className="text-end col-lg-6 p-3">
                          <Button
                            variant="secondary"
                            size="lg"
                            onClick={sendData}
                            style={{ width: '100%' }}>
                            Recommend
                          </Button>
                        </Col>
                      </Row>
                    </>
                  )}
                </>
              )}
            </Row>
          </Col>

          {!loading && (
            <Col
              className="d-flex justify-content-center"
              style={{
                backgroundImage: 'linear-gradient(rgb(0, 0, 0) 30%, rgb(57 67 82))'
              }}>
              <Col className="Recommendations">
                <RecommendationsWrapper
                  access_token={accessToken}
                  setCurrentTrack={setCurrentTrack}
                  setRecommendations={setRecommendations}
                  recommendations={recommendations}
                  title={title}
                  setTitle={setTitle}
                />
              </Col>
            </Col>
          )}
          {loading && (
            <Col
              className="d-flex justify-content-center align-items-center"
              style={{
                backgroundImage: 'linear-gradient(rgb(0, 0, 0) 30%, rgb(57 67 82))'
              }}>
              <div>
                <WaveSpinner loading={loading} size={35} />
                <span className="text-white">Computing...</span>
              </div>
            </Col>
          )}
        </Row>
      </Container>
      <SpotifyPlayerWrapper token={accessToken} track={currentTrack} />
    </div>
  )
}

export default MainPage
