import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults] = useState([]);

  const handleSearch = async () => {
    // Perform Algolia search here using searchQuery
    // Store the search results in searchResults state
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div>
          {searchResults.map((result) => (
            <div key={result.id}>{result.title}</div>
          ))}
        </div>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
