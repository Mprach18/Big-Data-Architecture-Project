import React from 'react';
import { ListGroup, Button } from 'react-bootstrap';


interface Item {
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

// interface Props {
//   items: Item[];
//   sendData: string;
// }

interface ChildProps {
  onChildData: (childData: Item) => void;
  items: Item[];
}





const ItemList = (props: ChildProps) => {
  const handleClick = (item: Item) => {
    props.onChildData(item);
  };
  return (
    <ListGroup>
      {props.items.map(item => (
        <ListGroup.Item key={item.id} className="d-flex p-2">
          <div className='col-2'>
            <img width="50px" height="50px" src={item.album.images[0].url} alt="Song cover" />
          </div>
          <div className='col-8' style={{textAlign: 'left'}}>
            <div className='row'>
              {item.name}
            </div>
            <div className='row'>
              Artists: {item.artists.map((artist) => artist.name).join(', ')}
            </div>
                
                
          </div>
          <div className='col-2'>
          <Button style={{ backgroundColor: '#1DB954' }} size="lg" className='rounded-circle' onClick={() =>handleClick({name: item.name, id: item.id, album: item.album, artists: item.artists})}>+</Button>
          </div>
          
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default ItemList;
