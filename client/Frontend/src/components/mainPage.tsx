import { useState } from 'react';
import './style.css';
import Button from 'react-bootstrap/Button';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Card from 'react-bootstrap/Card';
import { Container, Form, ListGroup } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import useAccessToken from '../hooks/useAccessToken';
import SpotifyPlayerWrapper from './Player';
import ItemList from './Playlist';

interface playlistItem {
  name: string;
  id: number;
  album: {
    images: {
      url: string;
    }[];
  };
  artists: {
    name: string;
    href: string;
  }[];
}

function MainPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [playlist, setPlaylist] = useState<playlistItem[]>([]);
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
  });
  const { accessToken, isLoading } = useAccessToken();

  function handleChange({ target: { value = '' } }) {
    setSearchTerm(value);
    console.log('searchTerm-', searchTerm);

    const url = 'http://127.0.0.1:5000/search-track';

    if (searchTerm.length > 3) {
      fetch(`${url}?name=${searchTerm}&search_type=track&access_token=${accessToken}`, {
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('data-', data);
          setSearchResults(data.tracks.items);
          // setCurrentTrack(data.tracks.items[0]);
        })
        .catch((error) => console.log('api error-', error));
    }
  }

  const handleFocus = () => {
    setIsSearchActive(true);
  };

  const handleBlur = () => {
    setIsSearchActive(false);
  };

  const handleAddToPlaylist = (item: playlistItem) => {
    setPlaylist([...playlist, item]);
  };

  const handleRemoveFromPlaylist = (index: number) => {
    const updatedPlaylist = [...playlist];
    updatedPlaylist.splice(index, 1);
    setPlaylist(updatedPlaylist);
  };

  if (!accessToken || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Container className="main">
        <Row>
          <Col className="Search d-flex p-2">
            <Row>
              <Tabs defaultActiveKey="songs" id="uncontrolled-tab-example" className="mb-3">
                <Tab eventKey="songs" title="Search songs">
                  <Form.Control
                    type="text"
                    placeholder="Search Songs"
                    value={searchTerm}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <div style={{ zIndex: 2 }}>
                    {searchResults && (
                      <ItemList onChildData={handleAddToPlaylist} items={searchResults} />
                    )}
                  </div>

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
                    </div>
                  )}
                </Tab>
                <Tab eventKey="link" title="Playlist Link">
                  <Card>
                    <Card.Body>This is some text within a profile section card body.</Card.Body>
                  </Card>
                </Tab>
              </Tabs>
            </Row>
          </Col>
          <Col className="Recommendations">
            <Row>
              <h2>
                <b>Recommendations</b>
              </h2>
            </Row>
          </Col>
        </Row>
      </Container>
      <SpotifyPlayerWrapper token={accessToken} track={currentTrack} />
    </div>
  );
}

export default MainPage;
