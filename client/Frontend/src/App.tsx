import { useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';
import Login from './login';
import {
  Routes,
  Route
} from 'react-router-dom';
import MainPage from './mainPage';

function App() {
  const location = useLocation();

  // call the backend route API
  useEffect(() => {
    const url = location.search
    const urlParams = new URLSearchParams(url)
    const QueryParams = Object.fromEntries(urlParams);
    if (QueryParams['access_token']) {
      localStorage.setItem('SESSION_INFO', JSON.stringify(QueryParams));
    }
  }, [location.search]);


  return (
    <div className="App">
        <Routes>
              <Route path='/login' element={< Login />}></Route>
              <Route path='/' element={< MainPage />}></Route>
        </Routes>
    </div>
  );
}

export default App;