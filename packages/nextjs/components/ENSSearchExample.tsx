"use client";

import { useState } from "react";
import { ENSSearchBar } from "./searchBar";
import { Address } from "viem";

interface ENSSearchResult {
  address?: Address;
  name?: string;
  avatar?: string;
  isLoading: boolean;
  error?: string;
}

export const ENSSearchExample = () => {
  const [searchResults, setSearchResults] = useState<ENSSearchResult[]>([]);

  const handleSearchResult = (result: ENSSearchResult) => {
    if (result.address && result.name) {
      // Add to search history
      setSearchResults(prev => {
        // Avoid duplicates
        const exists = prev.some(r => r.address === result.address);
        if (exists) return prev;
        return [result, ...prev.slice(0, 4)]; // Keep last 5 results
      });
    }
  };

  const clearResults = () => {
    setSearchResults([]);
  };

  return (
    <div className="ens-search-example">
      <div className="search-section">
        <h2 className="search-title">Find Cat Players by ENS</h2>
        <p className="search-description">Search for other players using their ENS name or Ethereum address</p>

        <ENSSearchBar
          onSearchResult={handleSearchResult}
          placeholder="Enter ENS name like vitalik.eth or 0x..."
          className="search-bar-wrapper"
        />
      </div>

      {searchResults.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>Recent Searches</h3>
            <button onClick={clearResults} className="nes-btn is-error">
              Clear
            </button>
          </div>

          <div className="results-list">
            {searchResults.map((result, index) => (
              <div key={`${result.address}-${index}`} className="result-item nes-container is-rounded">
                <div className="result-content">
                  {result.avatar && (
                    <img src={result.avatar} alt="Player Avatar" className="player-avatar" width="40" height="40" />
                  )}
                  <div className="player-info">
                    <div className="player-name">{result.name}</div>
                    <div className="player-address">{result.address}</div>
                  </div>
                  <div className="player-actions">
                    <button className="nes-btn is-primary">View Profile</button>
                    <button className="nes-btn is-success">Challenge</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .ens-search-example {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .search-section {
          text-align: center;
          margin-bottom: 30px;
        }

        .search-title {
          font-size: 1.5rem;
          margin-bottom: 10px;
          color: #333;
        }

        .search-description {
          color: #666;
          margin-bottom: 20px;
        }

        .search-bar-wrapper {
          margin: 0 auto;
        }

        .results-section {
          margin-top: 30px;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .results-header h3 {
          margin: 0;
          color: #333;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .result-item {
          background-color: #f8f9fa;
          border: 2px solid #333;
          padding: 15px;
        }

        .result-content {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .player-avatar {
          border-radius: 50%;
          border: 2px solid #333;
          flex-shrink: 0;
        }

        .player-info {
          flex: 1;
          min-width: 0;
        }

        .player-name {
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
          font-size: 1.1rem;
        }

        .player-address {
          font-family: monospace;
          font-size: 0.9rem;
          color: #666;
          word-break: break-all;
        }

        .player-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        .player-actions .nes-btn {
          font-size: 0.8rem;
          padding: 5px 10px;
        }

        @media (max-width: 768px) {
          .result-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .player-actions {
            width: 100%;
            justify-content: space-between;
          }

          .player-actions .nes-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ENSSearchExample;
