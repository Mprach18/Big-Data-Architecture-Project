import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './App.css'
import Login from './components/Login'
import { Routes, Route } from 'react-router-dom'
import MainPage from './components/mainPage'

function App() {
  const location = useLocation()

  useEffect(() => {
    const QueryParams = Object.fromEntries(new URLSearchParams(location.search))
    if (QueryParams['access_token']) {
      localStorage.setItem('SESSION_INFO', JSON.stringify(QueryParams))
    }
    window.history.replaceState({}, document.title, '/')
  }, [location.search])

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/" element={<MainPage />}></Route>
      </Routes>
    </div>
  )
}

export default App
