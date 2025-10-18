"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Background {
  id: string;
  name: string;
  image: string;
  cost: number;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const BACKGROUNDS: Background[] = [
  {
    id: "bg-0",
    name: "Pixel Forest",
    image: "/backgrounds/background-0.png",
    cost: 50,
    description: "A peaceful pixel forest",
    rarity: "common",
  },
  {
    id: "bg-1",
    name: "Cyber City",
    image: "/backgrounds/background-1.png",
    cost: 100,
    description: "Neon-lit cyberpunk cityscape",
    rarity: "common",
  },
  {
    id: "bg-2",
    name: "Space Station",
    image: "/backgrounds/background-2.png",
    cost: 150,
    description: "Futuristic space station",
    rarity: "rare",
  },
  {
    id: "bg-3",
    name: "Magic Castle",
    image: "/backgrounds/background-3.png",
    cost: 200,
    description: "Enchanted magical castle",
    rarity: "rare",
  },
  {
    id: "bg-4",
    name: "Underwater",
    image: "/backgrounds/background-4.png",
    cost: 250,
    description: "Deep ocean depths",
    rarity: "epic",
  },
  {
    id: "bg-5",
    name: "Volcano",
    image: "/backgrounds/background-5.png",
    cost: 300,
    description: "Fiery volcanic landscape",
    rarity: "epic",
  },
  {
    id: "bg-6",
    name: "Cloud Kingdom",
    image: "/backgrounds/background-6.png",
    cost: 400,
    description: "Floating cloud kingdom",
    rarity: "legendary",
  },
  {
    id: "bg-7",
    name: "Crystal Cave",
    image: "/backgrounds/background-7.png",
    cost: 500,
    description: "Mystical crystal cave",
    rarity: "legendary",
  },
  {
    id: "bg-8",
    name: "Desert Oasis",
    image: "/backgrounds/background-8.png",
    cost: 350,
    description: "Hidden desert oasis",
    rarity: "epic",
  },
  {
    id: "bg-9",
    name: "Aurora Sky",
    image: "/backgrounds/background-9.png",
    cost: 100,
    description: "Northern lights sky",
    rarity: "legendary",
  },
];

export const BackgroundStore = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedBackground, setSelectedBackground] = useState<Background | null>(null);
  const [ownedBackgrounds, setOwnedBackgrounds] = useState<string[]>([]);
  const [playerPoints, setPlayerPoints] = useState(1000); // Mock player points
  const [currentBackground, setCurrentBackground] = useState<Background | null>(null);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedBackground = localStorage.getItem("selectedBackground");
    const savedOwned = localStorage.getItem("ownedBackgrounds");
    const savedPoints = localStorage.getItem("playerPoints");

    if (savedBackground) {
      const background = BACKGROUNDS.find(bg => bg.id === savedBackground);
      if (background) {
        setCurrentBackground(background);
        applyBackground(background);
      }
    }

    if (savedOwned) {
      setOwnedBackgrounds(JSON.parse(savedOwned));
    }

    if (savedPoints) {
      setPlayerPoints(parseInt(savedPoints));
    }
  }, []);

  // Apply background to the page
  const applyBackground = (background: Background) => {
    // Try multiple selectors to ensure we find the right element
    const selectors = ["body", "html", "#__next", ".main-content"];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        (element as HTMLElement).style.backgroundImage = `url(${background.image})`;
        (element as HTMLElement).style.backgroundSize = "cover";
        (element as HTMLElement).style.backgroundPosition = "center";
        (element as HTMLElement).style.backgroundRepeat = "no-repeat";
        (element as HTMLElement).style.backgroundAttachment = "fixed";
        break;
      }
    }
  };

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

  const handlePurchase = (background: Background) => {
    if (playerPoints >= background.cost && !ownedBackgrounds.includes(background.id)) {
      const newPoints = playerPoints - background.cost;
      const newOwned = [...ownedBackgrounds, background.id];

      setPlayerPoints(newPoints);
      setOwnedBackgrounds(newOwned);
      setSelectedBackground(background);

      // Save to localStorage
      localStorage.setItem("playerPoints", newPoints.toString());
      localStorage.setItem("ownedBackgrounds", JSON.stringify(newOwned));

      alert(`🎉 Purchased ${background.name} for ${background.cost} points!`);
    } else if (ownedBackgrounds.includes(background.id)) {
      alert("You already own this background!");
    } else {
      alert("Not enough points!");
    }
  };

  const handleSelect = (background: Background) => {
    if (ownedBackgrounds.includes(background.id)) {
      setSelectedBackground(background);
      setCurrentBackground(background);

      // Save to localStorage
      localStorage.setItem("selectedBackground", background.id);

      // Apply background to the page
      applyBackground(background);

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("backgroundChanged", {
          detail: { backgroundId: background.id, backgroundImage: background.image },
        }),
      );

      alert(`🎨 Selected ${background.name} as your background!`);
    } else {
      alert("You need to purchase this background first!");
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "#95a5a6";
      case "rare":
        return "#3498db";
      case "epic":
        return "#9b59b6";
      case "legendary":
        return "#f39c12";
      default:
        return "#95a5a6";
    }
  };

  return (
    <>
      {/* NES.css Dialog Button */}
      <button className="main-store-button nes-btn is-primary" onClick={openDialog}>
        Background Store
      </button>

      {/* NES.css Dialog Modal */}
      <dialog ref={dialogRef} className="nes-dialog is-rounded dialog-backdrop">
        <div className="dialog-content">
          <div className="background-store-example">
            {/* Close Button - Top Left */}
            <button type="button" className="close-button nes-btn is-error" onClick={closeDialog}>
              ✕
            </button>

            <div className="store-section">
              <h2 className="store-title"> Background Store</h2>
              <p className="store-description">Purchase and select backgrounds for your profile</p>
            </div>

            {/* Player Points Display - Layered Architecture */}
            <div className="points-container">
              <div className="points-card nes-container is-rounded">
                <div className="points-header">
                  <div className="points-icon">💰</div>
                  <div className="points-title">Player Wallet</div>
                </div>
                <div className="points-body">
                  <div className="points-label">Available Points</div>
                  <div className="points-value">{playerPoints}</div>
                  <div className="points-subtitle">Use points to purchase backgrounds</div>
                </div>
              </div>
            </div>

            {/* Background Grid */}
            <div className="background-grid">
              {BACKGROUNDS.map(background => {
                const isOwned = ownedBackgrounds.includes(background.id);
                const canAfford = playerPoints >= background.cost;

                return (
                  <div
                    key={background.id}
                    className={`background-item nes-container is-rounded ${isOwned ? "owned" : ""}`}
                    style={{ borderColor: getRarityColor(background.rarity) }}
                  >
                    <div className="background-preview">
                      <Image
                        src={background.image}
                        alt={background.name}
                        width={120}
                        height={80}
                        className="background-image"
                      />
                      <div className="rarity-badge" style={{ backgroundColor: getRarityColor(background.rarity) }}>
                        {background.rarity.toUpperCase()}
                      </div>
                    </div>

                    <div className="background-info">
                      <h4 className="background-name">{background.name}</h4>
                      <p className="background-description">{background.description}</p>
                      <div className="background-cost">Cost: {background.cost} points</div>

                      <div className="background-actions">
                        {isOwned ? (
                          <button type="button" className="nes-btn is-success" onClick={() => handleSelect(background)}>
                            Select
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`nes-btn ${canAfford ? "is-primary" : "is-disabled"}`}
                            onClick={() => handlePurchase(background)}
                            disabled={!canAfford}
                          >
                            {canAfford ? "Purchase" : "Not Enough Points"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Background Display */}
            {currentBackground && (
              <div className="current-background">
                <h4>Current Background:</h4>
                <div className="current-preview">
                  <Image
                    src={currentBackground.image}
                    alt={currentBackground.name}
                    width={80}
                    height={50}
                    className="current-image"
                  />
                  <div className="current-info">
                    <span className="current-name">{currentBackground.name}</span>
                    <span className="current-rarity" style={{ color: getRarityColor(currentBackground.rarity) }}>
                      {currentBackground.rarity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Background Display */}
            {selectedBackground && selectedBackground.id !== currentBackground?.id && (
              <div className="selected-background">
                <h4>Selected (Not Applied):</h4>
                <div className="selected-preview">
                  <Image
                    src={selectedBackground.image}
                    alt={selectedBackground.name}
                    width={60}
                    height={40}
                    className="selected-image"
                  />
                  <span>{selectedBackground.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </dialog>

      <style jsx>{`
        .nes-dialog {
          max-width: 800px;
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

        .main-store-button {
          border: 2px solid #333 !important;
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%) !important;
          color: white !important;
          box-shadow:
            2px 2px 0px #333,
            4px 4px 0px #666;
          font-weight: bold;
          text-shadow: 1px 1px 0px #000;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          padding: 8px 16px;
        }

        .main-store-button:hover {
          background: linear-gradient(135deg, #2980b9 0%, #1f618d 100%) !important;
          transform: translate(1px, 1px);
          box-shadow:
            1px 1px 0px #333,
            2px 2px 0px #666;
        }

        .main-store-button:active {
          transform: translate(2px, 2px);
          box-shadow:
            0px 0px 0px #333,
            1px 1px 0px #666;
        }

        .background-store-example {
          max-width: 100%;
          margin: 0;
          padding: 20px;
          background: #f4f4f4;
          border: none;
          position: relative;
        }

        .close-button {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
          font-size: 1.2rem;
          padding: 0;
          width: 50px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0;
          font-weight: bold;
          text-shadow: 1px 1px 0px #000;
          border: 3px solid #333 !important;
          background: #ff6b6b !important;
          color: white !important;
          box-shadow:
            3px 3px 0px #333,
            6px 6px 0px #666;
        }

        .close-button:hover {
          background: #ff5252 !important;
          transform: translate(1px, 1px);
          box-shadow:
            2px 2px 0px #333,
            4px 4px 0px #666;
        }

        .close-button:active {
          transform: translate(2px, 2px);
          box-shadow:
            1px 1px 0px #333,
            2px 2px 0px #666;
        }

        .store-section {
          text-align: center;
          margin-bottom: 30px;
          margin-top: 20px;
        }

        .store-title {
          font-size: 1.5rem;
          margin-bottom: 10px;
          color: #333;
          text-shadow: 2px 2px 0px #666;
          font-weight: bold;
        }

        .store-description {
          color: #666;
          margin-bottom: 20px;
        }

        .points-container {
          margin-bottom: 30px;
          display: flex;
          justify-content: center;
        }

        .points-card {
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          border: 3px solid #333;
          border-radius: 12px;
          padding: 20px;
          box-shadow:
            2px 2px 0px #333,
            4px 4px 0px #666,
            6px 6px 0px #999;
          min-width: 300px;
          position: relative;
        }

        .points-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e9ecef;
        }

        .points-icon {
          font-size: 1.5rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-5px);
          }
          60% {
            transform: translateY(-3px);
          }
        }

        .points-title {
          font-size: 1.1rem;
          font-weight: bold;
          color: #333;
          text-shadow: 1px 1px 0px #666;
        }

        .points-body {
          text-align: center;
        }

        .points-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .points-value {
          font-size: 2rem;
          font-weight: bold;
          color: #27ae60;
          text-shadow: 1px 1px 0px #1e8449;
          margin-bottom: 8px;
        }

        .points-subtitle {
          font-size: 0.8rem;
          color: #888;
          font-style: italic;
        }

        .background-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
          max-height: 400px;
          overflow-y: auto;
        }

        .background-item {
          display: flex;
          flex-direction: column;
          padding: 15px;
          border: 3px solid #333;
          border-radius: 8px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          transition: all 0.3s ease;
        }

        .background-item.owned {
          background: linear-gradient(135deg, #e8f5e8 0%, #d4f1d4 100%);
          border-color: #27ae60;
        }

        /* Rarity-based pastel background colors matching border colors */
        .background-item[style*="border-color: #95a5a6"] {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-color: #95a5a6;
        }

        .background-item[style*="border-color: #3498db"] {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border-color: #3498db;
        }

        .background-item[style*="border-color: #9b59b6"] {
          background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
          border-color: #9b59b6;
        }

        .background-item[style*="border-color: #f39c12"] {
          background: linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%);
          border-color: #f39c12;
        }

        .background-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(187, 172, 172, 0.2);
        }

        .background-preview {
          position: relative;
          margin-bottom: 10px;
          text-align: center;
        }

        .background-image {
          border-radius: 8px;
          border: 2px solid #333;
          width: 100%;
          height: auto;
          object-fit: cover;
        }

        .rarity-badge {
          position: absolute;
          top: 5px;
          right: 5px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: bold;
          color: white;
          text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);
        }

        .background-info {
          flex: 1;
        }

        .background-name {
          font-size: 1rem;
          font-weight: bold;
          margin-bottom: 5px;
          color: #333;
        }

        .background-description {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .background-cost {
          font-size: 0.9rem;
          font-weight: bold;
          color: #e74c3c;
          margin-bottom: 10px;
        }

        .background-actions {
          text-align: center;
        }

        .background-actions .nes-btn {
          font-size: 0.8rem;
          padding: 5px 15px;
        }

        .current-background {
          margin-top: 20px;
          padding: 15px;
          background: linear-gradient(135deg, #e8f5e8 0%, #d4f1d4 100%);
          border: 2px solid #27ae60;
          border-radius: 8px;
          text-align: center;
        }

        .current-background h4 {
          margin: 0 0 10px 0;
          color: #27ae60;
          font-weight: bold;
        }

        .current-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .current-image {
          border-radius: 8px;
          border: 2px solid #27ae60;
        }

        .current-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .current-name {
          font-weight: bold;
          color: #333;
          font-size: 1rem;
        }

        .current-rarity {
          font-size: 0.8rem;
          font-weight: bold;
        }

        .selected-background {
          margin-top: 15px;
          padding: 15px;
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border: 2px solid #ffc107;
          border-radius: 8px;
          text-align: center;
        }

        .selected-background h4 {
          margin: 0 0 10px 0;
          color: #856404;
          font-weight: bold;
        }

        .selected-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .selected-image {
          border-radius: 4px;
          border: 1px solid #333;
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

          .background-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .background-item {
            padding: 10px;
          }

          .background-image {
            height: 60px;
          }

          .store-title {
            font-size: 1.2rem;
          }

          .store-description {
            font-size: 0.8rem;
          }

          .points-card {
            min-width: 250px;
            padding: 15px;
          }

          .points-value {
            font-size: 1.5rem;
          }

          .close-button {
            top: 5px;
            left: 5px;
            font-size: 1rem;
            width: 40px;
            height: 35px;
          }
        }

        /* Custom scrollbar */
        .background-grid::-webkit-scrollbar {
          width: 8px;
        }

        .background-grid::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .background-grid::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }

        .background-grid::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </>
  );
};

export default BackgroundStore;
