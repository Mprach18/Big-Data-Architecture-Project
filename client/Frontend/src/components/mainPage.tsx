import { useState } from 'react';
import './style.css';
import Button from 'react-bootstrap/Button';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Card from 'react-bootstrap/Card';
import { Container, Form } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import useAccessToken from '../hooks/useAccessToken';
import SpotifyPlayerWrapper from './Player';
import RecommendationsWrapper from './Recommendations';

function MainPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { accessToken, isLoading } = useAccessToken();
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

  function handleChange({ target: { value = '' } }) {
    setSearchTerm(value);
    console.log('searchTerm-', searchTerm);

    const url = 'http://127.0.0.1:5000/search-track';

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
        setCurrentTrack(data.tracks.items[0]);
      })
      .catch((error) => console.log('api error-', error));
  }

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
                  />
                  <div className="flex-grow-1 my-2" style={{ overflowY: 'auto' }}>
                    <Card border="light">
                      <Card.Body>
                        <div className="row">
                          <div className="col-10 d-flex p-2">Song name</div>
                          <div className="col-10 d-flex p-2">Artists, Album, Movie</div>
                          <div className="col-2">
                            <Button variant="success" size="sm">
                              Add to playlist
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                    <Card border="light" bg="dark">
                      <Card.Body>
                        <div className="row">
                          <div className="col-10 d-flex p-2">Song name</div>
                          <div className="col-10 d-flex p-2">Artists, Album, Movie</div>
                          <div className="col-2">
                            <Button variant="success" size="sm">
                              Add to playlist
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
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
            <RecommendationsWrapper access_token={accessToken} setCurrentTrack={setCurrentTrack} />
          </Col>
        </Row>
      </Container>
      <SpotifyPlayerWrapper token={accessToken} track={currentTrack} />
    </div>
  );
}

export default MainPage;
