// import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Main1 from './Main1';

// import Loader from './loader';


function App() {
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const timer = setTimeout(() => setLoading(false), 2000); // 2 seconds
  //   return () => clearTimeout(timer);
  // }, []);


  useEffect(() => {
    axios.get('http://127.0.0.1:8000/hello/')
      .then((res) => {
        console.log('Message from backend:', res.data.message); // log here
      })
      .catch((err) => {
        console.error('Error fetching API:', err);
      });
  }, []);

  return (
    <>
    {/* <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div> */}
    {/* <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Message from Django Backend:</h1>
      <h2>{message}</h2>
    </div> */}
    
    {/* {loading ? <Loader /> : <Main1 />} */}
    <Main1 />
    </>
  );
}

export default App;
