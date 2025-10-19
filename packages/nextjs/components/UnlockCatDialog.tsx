"use client";

import { useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Contract PetColor enum mapping
const PET_COLOR_MAP = {
  black: 0, // BLACK
  grey: 1, // GREY
  pinkie: 2, // PINK
  siamese: 3, // SIAMESE
  yellow: 4, // YELLOW
} as const;

interface UnlockCatDialogProps {
  onClose: () => void;
  onUnlockCat: (tokenId: number) => void; // Return tokenId instead of cat data
}

const CAT_COLORS = [
  { color: "grey", level: 1, name: "Grey" },
  { color: "black", level: 3, name: "Black" },
  { color: "pinkie", level: 5, name: "Pinkie" },
  { color: "siamese", level: 7, name: "Siamese" },
  { color: "yellow", level: 10, name: "Yellow" },
];

export const UnlockCatDialog = ({ onClose, onUnlockCat }: UnlockCatDialogProps) => {
  const [selectedColor, setSelectedColor] = useState("grey");
  const [catName, setCatName] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const { address } = useAccount();

  // Contract write hook
  const { writeContractAsync: writeBitBrawlersAsync } = useScaffoldWriteContract({
    contractName: "BitBrawlers",
  });

  // Placeholder user level - in real app this would come from props or context
  const userLevel = 1;

  const getCatImage = (color: string) => {
    // Always use normal (non-clothed) version for unlock dialog
    const catColor = color === "pink" ? "pinkie" : color;
    return `/cats/${catColor}/normal/${catColor}-sitting.gif`;
  };

  const isColorLocked = (requiredLevel: number) => {
    return userLevel < requiredLevel;
  };

  const handleUnlock = async () => {
    if (!catName.trim()) {
      alert("Please enter a name for your cat!");
      return;
    }

    if (!address) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsMinting(true);

    try {
      // Call mintPet function on contract
      const result = await writeBitBrawlersAsync({
        functionName: "mintPet",
        args: [
          PET_COLOR_MAP[selectedColor as keyof typeof PET_COLOR_MAP], // PetColor enum
          false, // isClothed - always false for new unlocks
          catName.trim(), // name
          "", // ensDomain - empty for now
        ],
      });

      console.log("Mint transaction result:", result);

      // The mintPet function returns the tokenId directly
      const tokenId = Number(result);

      alert(`Congratulations! You've minted ${catName} (Token ID: ${tokenId})!`);

      // Call the callback with the tokenId
      onUnlockCat(tokenId);
      onClose();
    } catch (error) {
      console.error("Error minting cat:", error);
      alert("Failed to mint cat. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <dialog className="nes-dialog is-rounded unlock-cat-dialog" open>
      <div className="dialog-content">
        <h2 className="dialog-title">Unlock New Cat</h2>

        {/* Cat Preview */}
        <div className="cat-preview-section">
          <div className="cat-preview-container">
            <Image
              src={getCatImage(selectedColor)}
              alt={`${selectedColor} cat preview`}
              width={180}
              height={180}
              className="cat-preview-image"
              unoptimized
            />
          </div>
          <p className="cat-preview-text">
            {CAT_COLORS.find(c => c.color === selectedColor)?.name || selectedColor} Cat
          </p>
        </div>

        {/* Color Selection */}
        <div className="color-selection-section">
          <h3 className="section-title">Choose Color</h3>
          <div className="color-buttons">
            {CAT_COLORS.map(({ color, level, name }) => {
              const isLocked = isColorLocked(level);
              return (
                <div key={color} className="color-button-container">
                  <button
                    className={`color-button ${selectedColor === color ? "is-primary" : ""} ${isLocked ? "is-disabled" : ""} ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                    // Allow selecting (and thus previewing) locked colors
                    onClick={() => setSelectedColor(color)}
                  >
                    {name}
                    {isLocked && <i className="nes-icon lock is-small" style={{ marginLeft: "5px" }} />}
                  </button>
                  <div className="color-tooltip">
                    {isLocked ? `Unlocks at Level ${level}` : `Available at Level ${level}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Name Input */}
        <div className="name-section">
          <h3 className="section-title">Name Your Cat</h3>
          <input
            type="text"
            className="nes-input cat-name-input"
            placeholder="Enter cat name..."
            value={catName}
            onChange={e => setCatName(e.target.value)}
            maxLength={20}
          />
        </div>

        {/* Action Buttons */}
        <div className="dialog-actions">
          <button
            type="button"
            className="nes-btn is-success"
            onClick={handleUnlock}
            disabled={!catName.trim() || isMinting}
          >
            {isMinting ? "Minting..." : "Unlock Cat"}
          </button>
          <button className="nes-btn cursor-pointer" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
      ---
      <style jsx>{`
        .unlock-cat-dialog {
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
          font-family: "Pixelify Sans", "Courier New", monospace, sans-serif;
          max-height: 80vh;
          overflow-y: auto;
          z-index: 100;
        }

        .dialog-content {
          padding: 20px;
        }

        .dialog-title {
          font-weight: bold;
          color: #333;
          margin-bottom: 20px;
          text-align: center;
          font-size: 1.5rem;
          text-shadow: 1px 1px 0px #666;
        }

        .cat-preview-section {
          text-align: center;
          /* Adjusted margin-bottom */
          margin-bottom: 10px;
          padding: 5px 15px;
          background: #f4f4f4;
          border: 3px solid #333;
          box-shadow:
            2px 2px 0px #333,
            4px 4px 0px #666;
        }

        .cat-preview-container {
          display: flex;
          justify-content: center;
          align-items: center;
          /* ADJUSTED: Reduced margin-bottom from 5px to 0 */
          margin-bottom: 0px;
          height: 190px;
        }

        .cat-preview-image {
          width: 180px;
          height: 180px;
          object-fit: contain;
          border: 2px solid #333;
          background: white;
        }

        .cat-preview-text {
          font-family: monospace;
          font-size: 1rem;
          color: #666;
          /* ADJUSTED: Reduced top margin from 5px to 0, keeping 5px bottom margin */
          margin: 0 0 5px 0;
        }

        .section-title {
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
          text-shadow: 1px 1px 0px #666;
        }

        .color-selection-section,
        .name-section {
          margin-bottom: 20px;
        }

        .color-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .color-button-container {
          position: relative;
          display: inline-block;
        }

        .color-button {
          padding: 8px 16px;
          border: 2px solid #333;
          background: #fff;
          color: #333;
          font-family: "Pixelify Sans", "Courier New", monospace, sans-serif;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          box-shadow: 2px 2px 0px #333;
        }

        .color-button:hover:not(.is-disabled) {
          background: #f0f0f0;
        }

        .color-button.is-primary {
          background: #333;
          color: #fff;
        }

        .color-button.is-disabled {
          background: #ccc !important;
          color: #666 !important;
          opacity: 0.8;
        }

        .color-tooltip {
          visibility: hidden;
          opacity: 0;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          background-color: #333;
          color: #fff;
          text-align: center;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-family: "Pixelify Sans", "Courier New", monospace, sans-serif;
          white-space: nowrap;
          box-shadow: 2px 2px 0px #666;
          border: 2px solid #666;
          transition:
            opacity 0.3s,
            visibility 0.3s;
        }

        .color-tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: #333 transparent transparent transparent;
        }

        .color-button-container:hover .color-tooltip {
          visibility: visible;
          opacity: 1;
        }

        .cat-name-input {
          width: 100%;
          padding: 10px;
          border: 2px solid #333;
          font-family: "Pixelify Sans", "Courier New", monospace, sans-serif;
          font-size: 1rem;
          text-align: center;
        }

        .cat-name-input:focus {
          outline: none;
          box-shadow: 0 0 0 2px #333;
        }

        .dialog-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 20px;
        }

        .dialog-actions .is-disabled {
          opacity: 0.6;
          background: #ccc !important;
          color: #666 !important;
        }
      `}</style>
    </dialog>
  );
};

export default UnlockCatDialog;
