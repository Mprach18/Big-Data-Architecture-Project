import React, { useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown'

interface DropdownProps {
  title: string
  items: string[] | number[]
  handleSelectOption: (option: any) => void
}

const DropDown: React.FC<DropdownProps> = ({ title, items, handleSelectOption }) => {
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedNumRecs, setSelectedNumRecs] = useState(0)

  const handleItemSelected = (item: string | number) => {
    if (typeof item === 'string') {
      setSelectedGenre(item)
    } else if (typeof item === 'number') {
      setSelectedNumRecs(item)
    }
    handleSelectOption(item) // Send selected item to parent component
  }
  return (
    <Dropdown>
      <Dropdown.Toggle variant="secondary" id="dropdown-genres" size="lg">
        {typeof items === 'string'
          ? selectedGenre !== ''
            ? selectedGenre
            : title
          : selectedNumRecs
          ? selectedNumRecs
          : title}
      </Dropdown.Toggle>

      <Dropdown.Menu variant="dark">
        {items.map((item) => (
          <Dropdown.Item key={item} onClick={() => handleItemSelected(item)}>
            {item}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default DropDown
