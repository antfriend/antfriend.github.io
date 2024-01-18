import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
import algoliasearch from 'algoliasearch';

// Create a search client
const searchClient = algoliasearch('3AUHR4IE0C', 'b152fa9673ced6bc795ad370b729bfd2');

// Import Algolia components
function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async () => {
    // Perform Algolia search here using searchQuery
    // Store the search results in searchResults state
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>
          Crepuscular Rays
        </h1>

        <div>
          {/* Wrap the search components with InstantSearch */}
          <InstantSearch
            searchClient={searchClient} // Provide the searchClient option
            indexName="Crepuscular_Rays"
          >
            {/* Add the SearchBox component */}
            <SearchBox />
            {/* Add the Hits component to display search results */}
            <Hits hitComponent={SearchResult} />
          </InstantSearch>
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

// Define a component to render each search result
const SearchResult = ({ hit }) => (
  <div key={hit.id}>{hit.title}</div>
);

export default App;
