import { useState } from 'react'
import './style.css'
import Button from 'react-bootstrap/Button'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import Card from 'react-bootstrap/Card'
import { Container, Form, ListGroup } from 'react-bootstrap'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import 'bootstrap/dist/css/bootstrap.min.css'
import useAccessToken from '../hooks/useAccessToken'
import SpotifyPlayerWrapper from './Player'
import RecommendationsWrapper from './Recommendations'
import ItemList from './Playlist'
import * as CryptoJS from 'crypto-js'

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

function MainPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [playlistSearchTerm, setPlaylistSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [playlist, setPlaylist] = useState<playlistItem[]>([])
  const [playlistLinkResults, setPlayistLinkResults] = useState([])
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

  const handleFocus = () => {
    setIsSearchActive(true)
  }

  const handleBlur = () => {
    setIsSearchActive(false)
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

  function sendData() {
    const url = 'http://127.0.0.1:5000/fetch-track-details'
    const data = {
      playlist: playlist,
      uid: findHash(playlist),
      access_token: accessToken
    }
    console.log('data-', data)
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    })
      .then((response) => response.json())
      .catch((error) => console.log('api error-', error))
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
                        variant="primary"
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
                                    variant="danger"
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
                                    variant="danger"
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
          <Col className="Recommendations">
            <RecommendationsWrapper access_token={accessToken} setCurrentTrack={setCurrentTrack} />
          </Col>
        </Row>
      </Container>
      <SpotifyPlayerWrapper token={accessToken} track={currentTrack} />
    </div>
  )
}

export default MainPage
