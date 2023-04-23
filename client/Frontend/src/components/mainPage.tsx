import { useEffect, useState } from 'react'
import './style.css'
import Button from 'react-bootstrap/Button'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import { Container, Form, ListGroup } from 'react-bootstrap'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import 'bootstrap/dist/css/bootstrap.min.css'
import useAccessToken from '../hooks/useAccessToken'
import SpotifyPlayerWrapper from './Player'
import RecommendationsWrapper from './Recommendations'
import ItemList from './Playlist'
import * as CryptoJS from 'crypto-js'
import Dropdown from './Dropdown'
import ProgressBar from 'react-bootstrap/ProgressBar'
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

const TOP_SONGS_GLOBAL_PLAYLIST_ID = '37i9dQZEVXbNG2KDcFcKOF'

function MainPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [playlistSearchTerm, setPlaylistSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [playlist, setPlaylist] = useState<playlistItem[]>([])
  const [playlistLinkResults, setPlayistLinkResults] = useState([])
  const [noOfRecommendations, setNoOfRecommendations] = useState(5)
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [title, setTitle] = useState('Top Songs')
  const genres = [
    'Pop',
    'Rock',
    'Hip-hop',
    'Jazz',
    'Classical',
    'Country',
    'Blues',
    'Metal',
    'Orchestra'
  ]
  const noOfRecommendationsOptions = [5, 10, 20, 30, 40]
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
    console.log('accessToken-', accessToken)
    if (accessToken) {
      fetch(`http://127.0.0.1:5000/get-playlist`, {
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

    const url = 'http://127.0.0.1:5000/search-track'

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

  function handlePlaylistSearchChange({ target: { value = '' } }) {
    setPlaylistSearchTerm(value)
    console.log('searchTerm-', value)

    const url = 'http://127.0.0.1:5000/get-playlist'

    if (value.length > 3) {
      fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          playlist_id: value,
          playlist_limit: 10,
          access_token: accessToken
        })
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('playlist link data-', data)
          const playlistData = data.items.map((item: any) => {
            const playlistItem = {
              ...item.track,
              uri: item.uri
            }

            return playlistItem
          })
          setPlayistLinkResults(playlistData)
        })
        .catch((error) => {
          console.log('api error-', error)
          setPlayistLinkResults([])
        })
    }
  }

  const handleGenreSelectOption = (option: string) => {
    console.log('option-', option)
    setSelectedGenre(option)
  }

  const handleNoOfRecommendationsOption = (option: number) => {
    setNoOfRecommendations(option)
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

  function addToPlaylist() {
    setPlaylist([...playlistLinkResults])
    setPlaylistSearchTerm('')
    setPlayistLinkResults([])
  }

  // useEffect(() => {
  //   // const iid = setInterval(() => {
  //   //   pollData(uuid)
  //   // }, 1000)
  //   const iid = setInterval(pollData(uuid), 5000)
  //   setIntervalId(iid)
  // }, [uuid])

  const pollData = (uuid: string) => {
    const url = 'http://localhost:5000/poll-data'
    console.log('uuid-', uuid)
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
    const url = 'http://127.0.0.1:5000/fetch-track-details'
    const uuid = findHash(playlist)
    // setUuid(uuid)
    const data = {
      playlist: playlist,
      uid: uuid,
      access_token: accessToken,
      genre: selectedGenre,
      no_of_recommendations: noOfRecommendations
    }
    console.log('send data-', data)
    setLoading(true)
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      // .then((data: any) => {

      // })
      .catch((error) => {
        console.log('api error-', error)
        setLoading(false)
      })

    iid = setInterval(() => {
      pollData(uuid)
    }, 5000)
    // const iid = setInterval(pollData(uuid), 5000)
    // setIntervalId(iid)
  }

  if (!accessToken || isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Container className="main bg-black">
        <Row>
          <Col className="Search d-flex p-2">
            <Row>
              <Tabs defaultActiveKey="songs" id="uncontrolled-tab-example" className="mb-3 bg-dark">
                <Tab eventKey="songs" title="Search songs">
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
                            Playlist
                            <ListGroup>
                              {playlist.map((playlistItem, index) => (
                                <ListGroup.Item
                                  key={playlistItem.id}
                                  className="d-flex p-2 bg-dark text-white mb-2">
                                  <div className="col-2">
                                    <img
                                      width="50px"
                                      height="50px"
                                      src={playlistItem.album.images[0].url}
                                      alt="Song cover"
                                    />
                                  </div>
                                  <div className="col-8" style={{ textAlign: 'left' }}>
                                    <div className="row">{playlistItem.name}</div>
                                    <div className="row">
                                      Artists:{' '}
                                      {playlistItem.artists.map((artist) => artist.name).join(', ')}
                                    </div>
                                  </div>
                                  <div className="col-2">
                                    <Button
                                      variant="secondary"
                                      className="rounded-circle"
                                      size="lg"
                                      onClick={() => handleRemoveFromPlaylist(index)}>
                                      -
                                    </Button>
                                  </div>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          </div>
                          <Row>
                            <Col className="text-start">
                              <Dropdown
                                title="Genre"
                                items={genres}
                                handleSelectOption={handleGenreSelectOption}
                              />
                            </Col>
                            <Col className="text-start">
                              <Dropdown
                                title="No. of Recommendations"
                                items={noOfRecommendationsOptions}
                                handleSelectOption={handleNoOfRecommendationsOption}
                              />
                            </Col>
                            <Col className="text-end">
                              <Button variant="secondary" size="lg" onClick={sendData}>
                                Recommend
                              </Button>
                            </Col>
                          </Row>
                        </>
                      )}
                    </>
                  )}
                </Tab>
                <Tab eventKey="link" title="Playlist Link">
                  <div className="row">
                    <div className="col-lg-10">
                      <Form.Control
                        type="text"
                        placeholder="Search playlist link"
                        value={playlistSearchTerm}
                        onChange={handlePlaylistSearchChange}
                      />
                    </div>

                    <div className="col-lg-2">
                      <Button variant="primary" size="lg" className="pr-1" onClick={addToPlaylist}>
                        Add
                      </Button>
                    </div>
                  </div>

                  <div style={{ zIndex: 2 }}>
                    {playlistLinkResults && (
                      <ItemList onChildData={handleAddToPlaylist} items={playlistLinkResults} />
                    )}
                  </div>

                  {!playlistSearchTerm && (
                    <>
                      {playlist.length > 0 && (
                        <div className="flex-grow-1 my-2" style={{ overflowY: 'auto' }}>
                          Playlist
                          <ListGroup>
                            {playlist.map((playlistItem, index) => (
                              <ListGroup.Item key={playlistItem.id} className="d-flex p-2">
                                <div className="col-2">
                                  <img
                                    width="50px"
                                    height="50px"
                                    src={playlistItem.album.images[0].url}
                                    alt="Song cover"
                                  />
                                </div>
                                <div className="col-8" style={{ textAlign: 'left' }}>
                                  <div className="row">{playlistItem.name}</div>
                                  <div className="row">
                                    Artists:{' '}
                                    {playlistItem.artists.map((artist) => artist.name).join(', ')}
                                  </div>
                                </div>
                                <div className="col-2">
                                  <Button
                                    variant="secondary"
                                    className="rounded-circle"
                                    size="lg"
                                    onClick={() => handleRemoveFromPlaylist(index)}>
                                    -
                                  </Button>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                          <Button onClick={sendData}>Submit</Button>
                        </div>
                      )}
                    </>
                  )}
                </Tab>
              </Tabs>
            </Row>
          </Col>
          <Col>
            {!loading && (
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
            )}
            <Col>
              {/* <ListGroup>
                {!loading &&
                  recommendations.length > 0 &&
                  recommendations.map((recommendation: any) => {
                    return (
                      <ListGroup.Item
                        key={recommendation[0]}
                        variant="dark"
                        className="d-flex mb-2 bg-dark">
                        <div className="text-white">
                          {recommendation[0]}- {recommendation[1]}
                        </div>
                      </ListGroup.Item>
                    )
                  })}
              </ListGroup> */}
              {loading && (
                <Col>
                  <ProgressBar now={60} label={`${60}%`} />
                </Col>
              )}
            </Col>
          </Col>
        </Row>
      </Container>
      <SpotifyPlayerWrapper token={accessToken} track={currentTrack} />
    </div>
  )
}

export default MainPage
