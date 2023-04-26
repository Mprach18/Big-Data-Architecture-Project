import { useEffect } from 'react'

const SERVER_URL = 'http://127.0.0.1:5000'

function Login() {
  useEffect(() => {
    window.location.href = `${SERVER_URL}/login`
  }, [])
  return <h1>Welcome to the world of Geeks!</h1>
}

export default Login
