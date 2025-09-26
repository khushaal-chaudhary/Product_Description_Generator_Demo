import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State to store the message from the backend
  const [message, setMessage] = useState('');

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    fetch('http://127.0.0.1:8000/')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching data:', error));
  }, []); // The empty array ensures this runs only once

  return (
    <div className="App">
      <h1>Product Description Generator</h1>
      <p>Message from the backend: <strong>{message || 'Loading...'}</strong></p>
    </div>
  );
}

export default App;

