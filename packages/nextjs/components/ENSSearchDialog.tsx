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

export const ENSSearchDialog = () => {
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

  const handlePlayerAction = (action: string, player: ENSSearchResult) => {
    console.log(`${action} player:`, player);
    // Here you can implement the actual game logic
    // For example: navigate to player profile, start a challenge, etc.
  };

  return (
    <>
      {/* NES.css Dialog Button */}
      <button
        className="nes-btn is-primary"
        onClick={openDialog}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        🔍 Find Players
      </button>

      {/* NES.css Dialog Modal */}
      <dialog ref={dialogRef} className="nes-dialog is-rounded">
        <form method="dialog">
          <p className="title">🐱 Find Cat Players</p>
          <p className="subtitle">Search for other players using their ENS name or Ethereum address</p>

          <div className="search-section">
            <ENSSearchBar onSearchResult={handleSearchResult} placeholder="Enter ENS name like vitalik.eth or 0x..." />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="results-section">
              <div className="results-header">
                <h4>Recent Searches</h4>
                <button
                  type="button"
                  onClick={clearResults}
                  className="nes-btn is-error"
                  style={{ fontSize: "0.8rem", padding: "5px 10px" }}
                >
                  Clear
                </button>
              </div>

              <div className="results-list">
                {searchResults.map((result, index) => (
                  <div key={`${result.address}-${index}`} className="result-item">
                    <div className="result-content">
                      {result.avatar && (
                        <Image
                          src={result.avatar}
                          alt="Player Avatar"
                          className="player-avatar rounded-full"
                          width={32}
                          height={32}
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
                          onClick={() => handlePlayerAction("view", result)}
                          style={{ fontSize: "0.7rem", padding: "3px 8px" }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="nes-btn is-success"
                          onClick={() => handlePlayerAction("challenge", result)}
                          style={{ fontSize: "0.7rem", padding: "3px 8px" }}
                        >
                          Fight!
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dialog Menu */}
          <menu className="dialog-menu">
            <button className="nes-btn" onClick={closeDialog}>
              Close
            </button>
          </menu>
        </form>
      </dialog>

      <style jsx>{`
        .nes-dialog {
          max-width: 600px;
          width: 90vw;
          max-height: 80vh;
          overflow-y: auto;
        }

        .title {
          font-size: 1.2rem;
          margin-bottom: 10px;
          text-align: center;
        }

        .subtitle {
          font-size: 0.9rem;
          color: #666;
          text-align: center;
          margin-bottom: 20px;
        }

        .search-section {
          margin-bottom: 20px;
        }

        .results-section {
          margin-top: 20px;
          max-height: 300px;
          overflow-y: auto;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #333;
        }

        .results-header h4 {
          margin: 0;
          font-size: 1rem;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .result-item {
          background-color: #f8f9fa;
          border: 2px solid #333;
          border-radius: 8px;
          padding: 10px;
        }

        .result-content {
          display: flex;
          align-items: center;
          gap: 10px;
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
          margin-bottom: 3px;
          font-size: 0.9rem;
        }

        .player-address {
          font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
          font-size: 0.7rem;
          color: #666;
          word-break: break-all;
        }
        .player-actions {
          display: flex;
          gap: 5px;
          flex-shrink: 0;
        }

        .dialog-menu {
          margin-top: 20px;
          text-align: center;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .nes-dialog {
            width: 95vw;
            max-height: 90vh;
          }

          .result-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .player-actions {
            width: 100%;
            justify-content: space-between;
          }

          .player-actions .nes-btn {
            flex: 1;
          }
        }

        /* Custom scrollbar for results */
        .results-section::-webkit-scrollbar {
          width: 8px;
        }

        .results-section::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .results-section::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }

        .results-section::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </>
  );
};

export default ENSSearchDialog;
