import { useEffect } from 'react';

function Login() {
  useEffect(() => {
    window.location.href = 'http://127.0.0.1:5000/login';
  }, []);
  return <h1>Welcome to the world of Geeks!</h1>;
}

export default Login;
