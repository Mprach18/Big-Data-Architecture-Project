import { useState, useEffect } from 'react';

interface TokenData {
  access_token: string;
  expires_in: number;
  date: number;
  refresh_token: string;
}

function useAccessToken() {
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useAccessToken useEffect');
    const sessionJson = localStorage.getItem('SESSION_INFO');
    console.log('sessionJson-', sessionJson);
    const sessionInfo: TokenData = JSON.parse(sessionJson ? sessionJson : JSON.stringify(''));
    if (sessionInfo) {
      console.log('sessionInfo-', sessionInfo);
      const now = new Date().getTime();
      const creationTime = new Date(sessionInfo.date).getTime();
      const expiresIn = sessionInfo.expires_in;
      const refresh_token = sessionInfo.refresh_token;
      if (now - creationTime > expiresIn * 1000) {
        fetch('http://127.0.0.1:5000/refresh', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refresh_token })
        })
          .then((response: Response) => response.json())
          .then((data: TokenData) => {
            setAccessToken(data.access_token);
            localStorage.setItem('SESSION_INFO', JSON.stringify(data));
          })
          .catch((err) => {
            console.error('Error refreshing token:', err);
          });
      } else {
        setAccessToken(sessionInfo.access_token);
      }
      setIsLoading(false);
    } else {
      console.error('No access token found in local storage. Redirecting to login page...');
      window.location.href = '/login';
      setIsLoading(false);
    }
  }, []);

  return { accessToken, isLoading };
}

export default useAccessToken;
