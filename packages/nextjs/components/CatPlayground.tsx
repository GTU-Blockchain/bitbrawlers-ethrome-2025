"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import CatDashboard from "./CatDashboard";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

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
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  direction: number; // 1 for right, -1 for left
  speed: number;
  isMoving: boolean;
  metadata: CatMetadata;
}

const COLOR_MAP = ["black", "grey", "pink", "siamese", "yellow"];
// const CAT_COUNT = 0; // Initial cat count

const CatPlayground = () => {
  const { address } = useAccount();
  const [cats, setCats] = useState<Cat[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 600 });
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const catAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Get all cats with complete data for the user
  const { data: allCatsData } = useScaffoldReadContract({
    contractName: "BitBrawlers",
    functionName: "getAllCatsWithData",
    args: address ? [address] : ["0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !!address,
    },
  });

  // Select random background on mount
  useEffect(() => {
    const randomBackground = Math.floor(Math.random() * 10); // 0-9 for background-0.png to background-9.png
    setBackgroundImage(`/backgrounds/background-${randomBackground}.png`);
  }, []);

  // Update container size on resize - using cat-area dimensions
  useEffect(() => {
    const updateSize = () => {
      if (catAreaRef.current) {
        const rect = catAreaRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Initialize cats from contract data
  useEffect(() => {
    if (!address || !allCatsData || !Array.isArray(allCatsData) || allCatsData.length < 3) {
      setCats([]);
      return;
    }

    const [tokenIds, statsArray, metadataArray] = allCatsData;

    if (!tokenIds || !statsArray || !metadataArray || tokenIds.length === 0) {
      setCats([]);
      return;
    }

    const initialCats: Cat[] = [];
    const catSize = 96;

    // Process each pet data from contract
    for (let index = 0; index < tokenIds.length; index++) {
      const tokenId = tokenIds[index];
      const stats = statsArray[index];
      const metadata = metadataArray[index];

      const startX = Math.random() * Math.max(0, containerSize.width - catSize);
      const startY = Math.random() * Math.max(0, containerSize.height - catSize);
      const targetX = Math.random() * Math.max(0, containerSize.width - catSize);
      const targetY = Math.random() * Math.max(0, containerSize.height - catSize);

      const cat: Cat = {
        id: index,
        x: startX,
        y: startY,
        targetX: targetX,
        targetY: targetY,
        direction: targetX > startX ? 1 : -1,
        speed: 0.5 + Math.random() * 1.0,
        isMoving: Math.random() > 0.3,
        metadata: {
          tokenId: Number(tokenId),
          name: metadata.name,
          ensDomain: metadata.ensDomain,
          level: Number(stats.level),
          battlesWon: Number(metadata.battlesWon),
          battlesLost: Number(metadata.battlesLost),
          createdAt: Number(metadata.createdAt),
          attack: Number(stats.attack),
          defence: Number(stats.defense),
          speed: Number(stats.speed),
          health: Number(stats.health),
          color: Number(stats.color),
          isClothed: stats.isClothed,
        },
      };

      initialCats.push(cat);
    }

    setCats(initialCats);
  }, [address, allCatsData, containerSize]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const catSize = 96;
      setCats(prevCats => {
        return prevCats.map(cat => {
          let newX = cat.x;
          let newY = cat.y;
          let newTargetX = cat.targetX;
          let newTargetY = cat.targetY;
          let newDirection = cat.direction;
          let newIsMoving = cat.isMoving;

          if (cat.isMoving) {
            // Calculate distance to target
            const dx = cat.targetX - cat.x;
            const dy = cat.targetY - cat.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If close to target, pick a new target
            if (distance < 10) {
              newTargetX = Math.random() * Math.max(0, containerSize.width - catSize);
              newTargetY = Math.random() * Math.max(0, containerSize.height - catSize);
              newDirection = newTargetX > cat.x ? 1 : -1;
            }

            // Move towards target
            const moveX = (newTargetX - cat.x) * 0.02; // Smooth interpolation
            const moveY = (newTargetY - cat.y) * 0.02;

            newX += moveX;
            newY += moveY;

            // Keep within bounds (accounting for cat size of 96px)
            newX = Math.max(0, Math.min(containerSize.width - catSize, newX));
            newY = Math.max(0, Math.min(containerSize.height - catSize, newY));

            // Random chance to stop moving
            if (Math.random() > 0.998) {
              newIsMoving = false;
            }
          } else {
            // Random chance to start moving
            if (Math.random() > 0.998) {
              newIsMoving = true;
              newTargetX = Math.random() * Math.max(0, containerSize.width - catSize);
              newTargetY = Math.random() * Math.max(0, containerSize.height - catSize);
              newDirection = newTargetX > cat.x ? 1 : -1;
            }
          }

          return {
            ...cat,
            x: newX,
            y: newY,
            targetX: newTargetX,
            targetY: newTargetY,
            direction: newDirection,
            isMoving: newIsMoving,
          };
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerSize]);

  const handleCatClick = (cat: Cat) => {
    setSelectedCat(cat);
  };

  const closeDashboard = () => {
    setSelectedCat(null);
  };

  const getCatImage = (cat: Cat) => {
    const color = COLOR_MAP[cat.metadata.color];
    const clothed = cat.metadata.isClothed ? "clothed" : "normal";

    if (cat.isMoving) {
      // Use walking animation when moving
      return `/cats/${color}/${clothed}/${color}-walking.gif`;
    } else {
      // Use sitting animation when idle
      return `/cats/${color}/${clothed}/${color}-sitting.gif`;
    }
  };

  return (
    <div
      className="w-full h-screen relative overflow-hidden"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        {/* Cute, pixel-styled title */}
        <h1 className="nes-text is-primary text-6xl font-bold text-center cat-title">Cat Playground</h1>
      </div>

      <div
        id="cat-area"
        ref={catAreaRef}
        className="fixed bottom-0 left-0 right-0 z-50 h-48 bg-gradient-to-t from-black/10 to-transparent"
      >
        {cats.map(cat => (
          <div
            key={cat.id}
            className="absolute transition-all duration-100 ease-linear cursor-pointer hover:scale-110"
            style={{
              left: `${cat.x}px`,
              top: `${cat.y}px`,
              transform: `scaleX(${cat.direction})`,
            }}
            onClick={() => handleCatClick(cat)}
            title={`Click to view ${COLOR_MAP[cat.metadata.color]} cat stats`}
          >
            <Image
              src={getCatImage(cat)}
              alt={`${COLOR_MAP[cat.metadata.color]} cat`}
              width={106}
              height={108}
              className="w-27 h-27 object-contain"
              style={{
                filter: cat.direction < 0 ? "scaleX(-1)" : "none",
              }}
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* Cat Dashboard or No Cats Message */}
      {!address ? (
        <div className="no-cats-message">
          <div className="no-cats-content">
            <h2>🔗 Connect your wallet</h2>
            <p>Connect your wallet to see your cats!</p>
          </div>
        </div>
      ) : cats.length === 0 ? (
        <div className="no-cats-message">
          <div className="no-cats-content">
            <h2 className="text-2xl font-bold">😿 Unfortunately you have no cats :/</h2>
            <p>Mint your first cat to start playing!</p>
          </div>
        </div>
      ) : (
        selectedCat && <CatDashboard cat={selectedCat} onClose={closeDashboard} />
      )}

      {/* Custom styles */}
      <style jsx>{`
        .no-cats-message {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 100;
          background: #ffffff;
          border: 4px solid #333;
          box-shadow:
            4px 4px 0px #333,
            8px 8px 0px #666;
          padding: 40px;
          text-align: center;
          font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
          max-width: 500px;
          width: 90vw;
        }

        .no-cats-content h2 {
          color: #333;
          margin-bottom: 16px;
          font-size: 1.5rem;
          text-shadow: 1px 1px 0px #666;
        }

        .no-cats-content p {
          color: #666;
          margin-bottom: 24px;
          font-size: 1rem;
        }

        .nes-btn {
          cursor: pointer;
        }

        .cat-title {
          font-size: 4rem;
          font-weight: bold;
          color: #fff;
          text-shadow:
            4px 4px 0 #000,
            8px 8px 0 #000;
          font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
        }

        @media (max-width: 768px) {
          .cat-title {
            font-size: 2.5rem;
            text-shadow:
              2px 2px 0 #9c27b0,
              4px 4px 0 #4a148c;
          }
        }
      `}</style>
    </div>
  );
};

export default CatPlayground;
