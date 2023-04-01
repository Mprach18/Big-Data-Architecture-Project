import { SetStateAction, useState } from 'react'
import './App.css';
import Button from 'react-bootstrap/Button';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Card from 'react-bootstrap/Card';
import { Container, Form, ListGroup } from "react-bootstrap"
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import useAccessToken from './hooks/useAccessToken';
import ItemList from './List';

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

    const {accessToken, isLoading} = useAccessToken()



    function handleChange(event: { target: { value: SetStateAction<string>; }; }) {
        setSearchTerm(event.target.value) 
        console.log('searchTerm-', searchTerm)

        var url = 'http://localhost:5000/search-track'

        if(searchTerm.length>3){
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
        .then(data => {
            setSearchResults(data.tracks.items)
            console.log('sdata.items-', data.tracks.items)
        })
        .catch(error => console.log('api error-',error));
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
      }

      const handleRemoveFromPlaylist = (index: number) => {
        const updatedPlaylist = [...playlist];
        updatedPlaylist.splice(index, 1);
        setPlaylist(updatedPlaylist);
      };



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
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                        <div style={{ zIndex: 2}}>
                            {
                                searchResults && <ItemList onChildData={handleAddToPlaylist} items={searchResults} />
                            }
                            
                        </div>

                        {
                            playlist.length>0 &&
                            <div className="flex-grow-1 my-2" style={{ overflowY: "auto",  }}>
                            Playlist
                            <ListGroup>
                            {
                                playlist.map((playlistItem, index) => (
                                <ListGroup.Item key={playlistItem.id} className="d-flex p-2">
                                    <div className='col-2'>
                                        <img width="50px" height="50px" src={playlistItem.album.images[0].url} alt="Song cover" />
                                    </div>
                                    <div className='col-8' style={{textAlign: 'left'}}>
                                        <div className='row'>
                                        {playlistItem.name}
                                        </div>
                                        <div className='row'>
                                        Artists: {playlistItem.artists.map((artist) => artist.name).join(', ')}
                                        </div>
                                            
                
                                    </div>
                                    <div className='col-2'>
                                        <Button variant="danger" className='rounded-circle' size="lg" onClick={()=> handleRemoveFromPlaylist(index)}>-</Button>
                                    </div>
          
                                </ListGroup.Item>
                                ))
                            }
                            </ListGroup>
                        </div>
                        }

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