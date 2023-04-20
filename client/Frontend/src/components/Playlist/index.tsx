import { useState } from 'react'
import { ListGroup, Button } from 'react-bootstrap'

interface Item {
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

const ItemList = ({
  onChildData,
  items
}: {
  onChildData: (childData: Item) => void
  items: Item[]
}) => {
  return (
    <ListGroup>
      {items.map((item) => (
        <SingleListItem key={item.id} onChildData={onChildData} item={item} />
      ))}
    </ListGroup>
  )
}

const SingleListItem = ({
  item,
  onChildData
}: {
  item: Item
  onChildData: (item: Item) => void
  [key: string]: unknown
}) => {
  const [isAdded, setIsAdded] = useState(false)

  return (
    <ListGroup.Item className="d-flex bg-dark">
      <div className="col-2">
        <img width="50px" height="50px" src={item.album.images[0].url} alt="Song cover" />
      </div>
      <div className="col-8 text-white font-weight-bold" style={{ textAlign: 'left' }}>
        <div className="row">{item.name}</div>
        <div className="row">Artists: {item.artists.map((artist) => artist.name).join(', ')}</div>
      </div>
      <div className="col-2">
        <Button
          style={{ backgroundColor: '#1DB954' }}
          size="lg"
          className="rounded-circle text-white"
          onClick={() => {
            onChildData({
              name: item.name,
              id: item.id,
              album: item.album,
              artists: item.artists
            })
            setIsAdded(!isAdded)
          }}>
          {isAdded ? '✔' : '+'}
        </Button>
      </div>
    </ListGroup.Item>
  )
}

export default ItemList
