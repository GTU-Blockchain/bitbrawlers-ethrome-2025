"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ENSSearchBar } from "./searchBar";
import { Address } from "viem";

interface ENSSearchResult {
  address?: Address;
  name?: string;
  avatar?: string;
  isLoading: boolean;
  error?: string;
}

export const SimpleENSSearchDialog = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [searchResults, setSearchResults] = useState<ENSSearchResult[]>([]);

  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const closeDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

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
    <>
      {/* NES.css Dialog Button */}
      <button className="nes-btn is-primary" onClick={openDialog}>
        Find Players
      </button>

      {/* NES.css Dialog Modal */}
      <dialog ref={dialogRef} className="nes-dialog is-rounded dialog-backdrop">
        <div className="dialog-content">
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
                  <button type="button" onClick={clearResults} className="nes-btn is-error">
                    Clear
                  </button>
                </div>

                <div className="results-list">
                  {searchResults.map((result, index) => (
                    <div key={`${result.address}-${index}`} className="result-item nes-container is-rounded">
                      <div className="result-content">
                        {result.avatar && (
                          <Image
                            src={result.avatar}
                            alt="Player Avatar"
                            className="player-avatar rounded-full"
                            width={40}
                            height={40}
                          />
                        )}
                        <div className="player-info">
                          <div className="player-name">{result.name}</div>
                          <div className="player-address">{result.address}</div>
                        </div>
                        <div className="player-actions">
                          <button
                            type="button"
                            className="nes-btn is-primary"
                            onClick={() => console.log("View player:", result)}
                          >
                            View Profile
                          </button>
                          <button
                            type="button"
                            className="nes-btn is-success"
                            onClick={() => console.log("Challenge player:", result)}
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

            {/* Dialog Menu */}
            <div className="dialog-menu">
              <button type="button" className="nes-btn" onClick={closeDialog}>
                Close
              </button>
            </div>
          </div>
        </div>
      </dialog>

      <style jsx>{`
        .nes-dialog {
          max-width: 600px;
          width: 90vw;
          max-height: 80vh;
          overflow-y: auto;
          background: #f4f4f4;
          border: 4px solid #333;
          border-radius: 0;
          box-shadow:
            4px 4px 0px #333,
            8px 8px 0px #666;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          margin: 0;
          padding: 0;
        }

        .dialog-backdrop::backdrop {
          background: rgba(0, 0, 0, 0.7);
        }

        .dialog-content {
          width: 100%;
          height: 100%;
        }

        .ens-search-example {
          max-width: 100%;
          margin: 0;
          padding: 20px;
          background: #f4f4f4;
          border: none;
        }

        .search-section {
          text-align: center;
          margin-bottom: 30px;
        }

        .search-title {
          font-size: 1.5rem;
          margin-bottom: 10px;
          color: #333;
          text-shadow: 2px 2px 0px #666;
          font-weight: bold;
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
          text-shadow: 1px 1px 0px #666;
          font-weight: bold;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .result-item {
          background-color: #f8f9fa;
          border: 3px solid #333;
          padding: 15px;
          box-shadow:
            2px 2px 0px #333,
            4px 4px 0px #666;
          margin-bottom: 10px;
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
          text-shadow: 1px 1px 0px #666;
        }

        .player-address {
          font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
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

        .dialog-menu {
          margin-top: 20px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .nes-dialog {
            width: 95vw;
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

export default SimpleENSSearchDialog;
