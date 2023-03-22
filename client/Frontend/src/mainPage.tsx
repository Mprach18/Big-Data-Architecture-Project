import { SetStateAction, useState } from 'react'
import './App.css';
import Button from 'react-bootstrap/Button';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Card from 'react-bootstrap/Card';
import { Container, Form } from "react-bootstrap"
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import useAccessToken from './hooks/useAccessToken';

function MainPage() {

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const {accessToken, isLoading} = useAccessToken()


    function handleChange(event: { target: { value: SetStateAction<string>; }; }) {
        setSearchTerm(event.target.value) 
        console.log('searchTerm-', searchTerm)

        var url = 'http://localhost:5000/search-track'
 
        fetch(`${url}?name=${searchTerm}&search_type=track&access_token=${accessToken}`,
        {
            method: 'GET',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        }
        )
        .then(response => response.json())
        .then(data => {setSearchResults(data.items)})
        .catch(error => console.log('api error-',error));

      }

  return (
        <Container className="main">
            <Row>
                <Col className='Search d-flex p-2' >
                    <Row>
                    <Tabs
                        defaultActiveKey="songs"
                        id="uncontrolled-tab-example"
                        className="mb-3"
                        >
                        <Tab eventKey="songs" title="Search songs">
                            <Form.Control
                            type="text"
                            placeholder="Search Songs"
                            value={searchTerm}
                            onChange={handleChange}
                        />
                        <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
                            <Card border="light">
                                <Card.Body>
                                <div className="row">
                                    <div className="col-10 d-flex p-2">
                                        Song name
                                    </div>
                                    <div className="col-10 d-flex p-2">
                                        Artists, Album, Movie
                                    </div>
                                    <div className="col-2">
                                        <Button variant="success" size="sm">Add to playlist</Button>
                                    </div>
                                
                                </div>
                                
                                </Card.Body>
                            </Card>
                            <Card border="light" bg="dark">
                                <Card.Body>
                                <div className="row">
                                    <div className="col-10 d-flex p-2">
                                        Song name
                                    </div>
                                    <div className="col-10 d-flex p-2">
                                        Artists, Album, Movie
                                    </div>
                                    <div className="col-2">
                                        <Button variant="success" size="sm">Add to playlist</Button>
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
                <Col className='Recommendations'>

                </Col>
            </Row>

        </Container>
      
  );
}

export default MainPage;