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

interface ENSSearchDialogProps {
  onSearchResult?: (result: ENSSearchResult) => void;
  buttonText?: string;
  buttonClass?: string;
  dialogTitle?: string;
}

export const ENSSearchDialog = ({
  onSearchResult,
  buttonText = "Search Players",
  buttonClass = "nes-btn is-primary",
  dialogTitle = "Find Cat Players",
}: ENSSearchDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
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
    onSearchResult?.(result);
  };

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const clearResults = () => {
    setSearchResults([]);
  };

  return (
    <>
      {/* Dialog Button */}
      <button type="button" className={buttonClass} onClick={openDialog}>
        {buttonText}
      </button>

      {/* Dialog Modal */}
      {isOpen && (
        <div className="dialog-overlay" onClick={closeDialog}>
          <div className="dialog-container nes-container is-rounded" onClick={e => e.stopPropagation()}>
            {/* Dialog Header */}
            <div className="dialog-header">
              <h2 className="dialog-title">{dialogTitle}</h2>
              <button type="button" className="nes-btn is-error" onClick={closeDialog}>
                ×
              </button>
            </div>

            {/* Dialog Content */}
            <div className="dialog-content">
              <p className="dialog-description">Search for other players using their ENS name or Ethereum address</p>

              <ENSSearchBar
                onSearchResult={handleSearchResult}
                placeholder="Enter ENS name like vitalik.eth or 0x..."
                className="search-bar-wrapper"
              />

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="results-section">
                  <div className="results-header">
                    <h3>Recent Searches</h3>
                    <button onClick={clearResults} className="nes-btn is-warning">
                      Clear
                    </button>
                  </div>

                  <div className="results-list">
                    {searchResults.map((result, index) => (
                      <div key={`${result.address}-${index}`} className="result-item nes-container is-rounded">
                        <div className="result-content">
                          {result.avatar && (
                            <img
                              src={result.avatar}
                              alt="Player Avatar"
                              className="player-avatar"
                              width="40"
                              height="40"
                            />
                          )}
                          <div className="player-info">
                            <div className="player-name">{result.name}</div>
                            <div className="player-address">{result.address}</div>
                          </div>
                          <div className="player-actions">
                            <button
                              className="nes-btn is-primary"
                              onClick={() => {
                                console.log("View profile for:", result.address);
                                // Add your profile view logic here
                              }}
                            >
                              View Profile
                            </button>
                            <button
                              className="nes-btn is-success"
                              onClick={() => {
                                console.log("Challenge player:", result.address);
                                // Add your challenge logic here
                                closeDialog();
                              }}
                            >
                              Challenge
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="dialog-footer">
              <button type="button" className="nes-btn" onClick={closeDialog}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .dialog-container {
          background-color: #ffffff;
          border: 4px solid #333;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        }

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 2px solid #333;
          background-color: #f0f0f0;
        }

        .dialog-title {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
        }

        .dialog-content {
          padding: 20px;
        }

        .dialog-description {
          color: #666;
          margin-bottom: 20px;
          text-align: center;
        }

        .search-bar-wrapper {
          margin-bottom: 20px;
        }

        .results-section {
          margin-top: 20px;
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

        .dialog-footer {
          padding: 20px;
          border-top: 2px solid #333;
          background-color: #f0f0f0;
          text-align: right;
        }

        @media (max-width: 768px) {
          .dialog-container {
            margin: 10px;
            max-height: 90vh;
          }

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
    </>
  );
};

export default ENSSearchDialog;
