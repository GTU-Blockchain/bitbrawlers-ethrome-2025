"use client";

import { useState } from "react";
import Image from "next/image";

const COLOR_MAP = ["black", "grey", "pink", "siamese", "yellow"];

interface CatMetadata {
  // Contract data
  tokenId: number;
  name: string;
  ensDomain: string;
  level: number;
  battlesWon: number;
  battlesLost: number;
  createdAt: number;
  // Stats from contract
  attack: number;
  defence: number;
  speed: number;
  health: number;
  color: number;
  isClothed: boolean;
}

interface Cat {
  id: number;
  metadata: CatMetadata;
}

interface CatDashboardProps {
  cat: Cat | null;
  onClose: () => void;
}

/* ❤️ Health hearts */
const renderHearts = (health: number) => {
  const totalHearts = 5;
  const hearts = [];
  const healthPerHeart = 100 / totalHearts;

  for (let i = 0; i < totalHearts; i++) {
    const heartValue = (i + 1) * healthPerHeart;
    if (health >= heartValue) {
      hearts.push(<i key={i} className="nes-icon is-small heart" />);
    } else if (health >= heartValue - healthPerHeart / 2) {
      hearts.push(<i key={i} className="nes-icon is-small heart is-half" />);
    } else {
      hearts.push(<i key={i} className="nes-icon is-small heart is-empty" />);
    }
  }

  return <div className="heart-container">{hearts}</div>;
};

/* 🛍️ Cat Shop popup */
const CatShop = ({ onClose }: { onClose: () => void }) => {
  return (
    <dialog className="nes-dialog is-rounded cat-shop" open>
      <div className="shop-content">
        <h2 className="shop-title">Cat Shop</h2>
        <p>Coming soon: outfits and accessories for your cat!</p>

        <div className="dialog-menu">
          <button type="button" className="nes-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .cat-shop {
          max-width: 450px;
          width: 90vw;
          background: #ffffff;
          border: 4px solid #333;
          box-shadow:
            4px 4px 0px #333,
            8px 8px 0px #666;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 20px;
          color: #333;
          font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
          max-height: 80vh;
          overflow-y: auto;
          z-index: 100;
        }

        .shop-title {
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
          font-size: 1.5rem;
          text-shadow: 1px 1px 0px #666;
        }

        .shop-content p {
          font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
          font-size: 1rem;
          color: #666;
          margin-bottom: 20px;
        }
        .dialog-menu {
          text-align: center;
          margin-top: 10px;
        }
      `}</style>
    </dialog>
  );
};

/* 🐱 Main Cat Dashboard */
export const CatDashboard = ({ cat, onClose }: CatDashboardProps) => {
  const [showShop, setShowShop] = useState(false);

  if (!cat) return null;

  const getCatImage = (color: string, clothed: boolean) => {
    const clothedPath = clothed ? "clothed" : "normal";
    return `/cats/${color}/${clothedPath}/${color}-sitting.gif`;
  };

  const getStatIcon = (statName: string) => {
    switch (statName) {
      case "attack":
        return <i className="nes-icon close is-small" title="Attack" />;
      case "defence":
        return <i className="nes-icon trophy is-small" title="Defence" />;
      case "speed":
        return <i className="nes-icon star is-small" title="Speed" />;
      case "health":
        return <i className="nes-icon heart is-small" title="Health" />;
      default:
        return <i className="nes-icon star is-small" />;
    }
  };

  const getStatColor = (value: number) => {
    if (value >= 80) return "#4CAF50";
    if (value >= 60) return "#FF9800";
    if (value >= 40) return "#FFC107";
    return "#F44336";
  };

  const getStatBarWidth = (value: number) => `${value}%`;

  const handleSetDefault = () => {
    alert(`${COLOR_MAP[cat.metadata.color]} cat is now your default fighter!`);
  };

  return (
    <>
      {!showShop && (
        <dialog className="nes-dialog is-rounded cat-dashboard" open>
          <div className="dashboard-content">
            {/* Header */}
            <div className="cat-header">
              <div className="cat-image-container">
                <Image
                  src={getCatImage(COLOR_MAP[cat.metadata.color], cat.metadata.isClothed)}
                  alt={`${COLOR_MAP[cat.metadata.color]} cat`}
                  width={100}
                  height={100}
                  className="cat-dashboard-image"
                  unoptimized
                />
              </div>
              <div className="cat-info">
                <h2 className="cat-name">
                  {cat.metadata.name ||
                    `${COLOR_MAP[cat.metadata.color].charAt(0).toUpperCase() + COLOR_MAP[cat.metadata.color].slice(1)} Cat`}
                </h2>
                <p className="cat-type">{cat.metadata.isClothed ? "Clothed Warrior" : "Wild Fighter"}</p>
                {cat.metadata.level && <p className="cat-level">Level {cat.metadata.level}</p>}
                {cat.metadata.ensDomain && <p className="cat-ens">ENS: {cat.metadata.ensDomain}</p>}
              </div>
            </div>

            {/* Stats */}
            <div className="stats-section">
              <h3 className="stats-title">Battle Stats</h3>
              <div className="stats-grid">
                {Object.entries({
                  attack: cat.metadata.attack,
                  defence: cat.metadata.defence,
                  speed: cat.metadata.speed,
                  health: cat.metadata.health,
                }).map(([statName, value]) => (
                  <div key={statName} className="stat-item">
                    <div className="stat-header">
                      <span className="stat-icon">{getStatIcon(statName)}</span>
                      <span className="stat-name">{statName.charAt(0).toUpperCase() + statName.slice(1)}</span>
                      <span className="stat-value">{value}/100</span>
                    </div>

                    {statName === "health" ? (
                      <>
                        <div className="stat-bar-container">
                          <div
                            className="stat-bar"
                            style={{
                              width: getStatBarWidth(value),
                              backgroundColor: getStatColor(value),
                            }}
                          />
                        </div>
                        {renderHearts(value)}
                      </>
                    ) : (
                      <div className="stat-bar-container">
                        <div
                          className="stat-bar"
                          style={{
                            width: getStatBarWidth(value),
                            backgroundColor: getStatColor(value),
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Battle History */}
              {(cat.metadata.battlesWon !== undefined || cat.metadata.battlesLost !== undefined) && (
                <div className="battle-history">
                  <h4 className="battle-title">Battle History</h4>
                  <div className="battle-stats">
                    <div className="battle-stat">
                      <span className="battle-label">Wins:</span>
                      <span className="battle-value">{cat.metadata.battlesWon || 0}</span>
                    </div>
                    <div className="battle-stat">
                      <span className="battle-label">Losses:</span>
                      <span className="battle-value">{cat.metadata.battlesLost || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="actions-section">
              <button className="nes-btn is-primary" onClick={() => setShowShop(true)}>
                Shop
              </button>
              <button className="nes-btn is-warning" onClick={handleSetDefault}>
                Set Default
              </button>
            </div>

            <div className="dialog-menu">
              <button type="button" className="nes-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>

          <style jsx>{`
            .cat-dashboard {
              max-width: 500px;
              width: 90vw;
              background: #ffffff;
              border: 4px solid #333;
              color: #333;
              box-shadow:
                4px 4px 0px #333,
                8px 8px 0px #666;
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
              max-height: 80vh;
              overflow-y: auto;
              z-index: 90;
            }

            .dashboard-content {
              padding: 20px;
              position: relative;
              z-index: 99;
            }

            .cat-header {
              display: flex;
              align-items: center;
              gap: 15px;
              margin-bottom: 20px;
              padding: 12px;
              background: #f4f4f4;
              border: 3px solid #333;
              box-shadow:
                2px 2px 0px #333,
                4px 4px 0px #666;
            }

            .cat-dashboard-image {
              width: 100px;
              height: 100px;
              object-fit: contain;
              border: 2px solid #333;
              background: white;
            }

            .cat-name {
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
              font-size: 1.2rem;
              text-shadow: 1px 1px 0px #666;
            }

            .cat-type {
              font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
              font-size: 0.9rem;
              color: #666;
            }

            .cat-level {
              font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
              font-size: 0.8rem;
              color: #4caf50;
              font-weight: bold;
            }

            .cat-ens {
              font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
              font-size: 0.8rem;
              color: #2196f3;
            }
            .stats-title {
              font-weight: bold;
              color: #333;
              margin-bottom: 10px;
              text-align: center;
              text-shadow: 1px 1px 0px #666;
            }

            .stat-item {
              background: #fff;
              border: 2px solid #333;
              padding: 10px;
              box-shadow:
                2px 2px 0px #333,
                4px 4px 0px #666;
              margin-bottom: 8px;
            }

            .stat-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 6px;
            }

            .stat-name {
              font-weight: bold;
              color: #333;
              text-shadow: 1px 1px 0px #666;
              flex: 1;
              margin-left: 6px;
            }

            .stat-value {
              font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
              color: #666;
              font-size: 0.9rem;
            }

            .stat-bar-container {
              width: 100%;
              height: 16px;
              background: #ddd;
              border: 2px solid #333;
              overflow: hidden;
            }

            .stat-bar {
              height: 100%;
              transition: width 0.3s ease;
            }

            .heart-container {
              display: flex;
              gap: 4px;
              margin-top: 4px;
            }

            .battle-history {
              margin-top: 16px;
              padding: 12px;
              background: #f4f4f4;
              border: 2px solid #333;
              box-shadow: 2px 2px 0px #333;
            }

            .battle-title {
              font-weight: bold;
              color: #333;
              margin-bottom: 8px;
              text-align: center;
              text-shadow: 1px 1px 0px #666;
            }

            .battle-stats {
              display: flex;
              justify-content: space-around;
              gap: 16px;
            }

            .battle-stat {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
            }

            .battle-label {
              font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
              font-size: 0.8rem;
              color: #666;
            }

            .battle-value {
              font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
              font-size: 1.2rem;
              font-weight: bold;
              color: #333;
            }

            .actions-section {
              display: flex;
              justify-content: center;
              gap: 16px;
              margin: 16px 0;
              position: relative;
              z-index: 99;
            }

            .dialog-menu {
              text-align: center;
              margin-top: 10px;
            }

            button {
              cursor: pointer;
            }
          `}</style>
        </dialog>
      )}

      {showShop && <CatShop onClose={() => setShowShop(false)} />}
    </>
  );
};

export default CatDashboard;
