"use client";

import { useState } from "react";
import Image from "next/image";

interface CatStats {
  attack: number;
  defence: number;
  speed: number;
  health: number;
}

interface Cat {
  id: number;
  color: string;
  isClothed: boolean;
  stats: CatStats;
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
    return `/cats/${color}/${clothedPath}/Sitting ${color.charAt(0).toUpperCase() + color.slice(1)} Cat.gif`;
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
    alert(`${cat.color} cat is now your default fighter!`);
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
                  src={getCatImage(cat.color, cat.isClothed)}
                  alt={`${cat.color} cat`}
                  width={100}
                  height={100}
                  className="cat-dashboard-image"
                  unoptimized
                />
              </div>
              <div className="cat-info">
                <h2 className="cat-name">{cat.color.charAt(0).toUpperCase() + cat.color.slice(1)} Cat</h2>
                <p className="cat-type">{cat.isClothed ? "Clothed Warrior" : "Wild Fighter"}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-section">
              <h3 className="stats-title">Battle Stats</h3>
              <div className="stats-grid">
                {Object.entries(cat.stats).map(([statName, value]) => (
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
            </div>

            {/* Buttons */}
            <div className="actions-section">
              <button className="nes-btn is-primary custom-button shop-button" onClick={() => setShowShop(true)}>
                Shop
              </button>
              <button className="nes-btn is-warning custom-button warning-button" onClick={handleSetDefault}>
                Set Default
              </button>
            </div>

            <div className="dialog-menu">
              <button type="button" className="nes-btn custom-button close-dialog-button" onClick={onClose}>
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

            .custom-button {
              border: 3px solid #333 !important;
              box-shadow:
                3px 3px 0px #333,
                6px 6px 0px #666;
              font-weight: bold;
              text-shadow: 1px 1px 0px #000;
              transition: all 0.2s ease;
            }

            .shop-button {
              background: linear-gradient(135deg, #3498db 0%, #2980b9 100%) !important;
              color: white !important;
            }

            .shop-button:hover {
              background: linear-gradient(135deg, #2980b9 0%, #1f618d 100%) !important;
              transform: translate(1px, 1px);
              box-shadow:
                2px 2px 0px #333,
                4px 4px 0px #666;
            }

            .warning-button {
              background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%) !important;
              color: white !important;
            }

            .warning-button:hover {
              background: linear-gradient(135deg, #e67e22 0%, #d35400 100%) !important;
              transform: translate(1px, 1px);
              box-shadow:
                2px 2px 0px #333,
                4px 4px 0px #666;
            }

            .close-dialog-button {
              background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%) !important;
              color: white !important;
            }

            .close-dialog-button:hover {
              background: linear-gradient(135deg, #7f8c8d 0%, #6c7b7d 100%) !important;
              transform: translate(1px, 1px);
              box-shadow:
                2px 2px 0px #333,
                4px 4px 0px #666;
            }

            .custom-button:active {
              transform: translate(2px, 2px);
              box-shadow:
                1px 1px 0px #333,
                2px 2px 0px #666;
            }
          `}</style>
        </dialog>
      )}

      {showShop && <CatShop onClose={() => setShowShop(false)} />}
    </>
  );
};

export default CatDashboard;
