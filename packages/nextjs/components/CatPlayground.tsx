"use client";

import { useEffect, useRef, useState } from "react";

interface Cat {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  direction: number; // 1 for right, -1 for left
  speed: number;
  isMoving: boolean;
  color: string;
  isClothed: boolean;
}

const CAT_COLORS = ["black", "grey", "pink", "siamese", "yellow"];
const CAT_COUNT = 12;

const CatPlayground = () => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 600 });
  const playgroundRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (playgroundRef.current) {
        const rect = playgroundRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Initialize cats
  useEffect(() => {
    const initialCats: Cat[] = [];
    for (let i = 0; i < CAT_COUNT; i++) {
      const startX = Math.random() * containerSize.width;
      const startY = Math.random() * containerSize.height;
      const targetX = Math.random() * containerSize.width;
      const targetY = Math.random() * containerSize.height;

      initialCats.push({
        id: i,
        x: startX,
        y: startY,
        targetX: targetX,
        targetY: targetY,
        direction: targetX > startX ? 1 : -1,
        speed: 0.5 + Math.random() * 1.0, // Speed between 0.5 and 1.5
        isMoving: Math.random() > 0.3, // 70% chance to start moving
        color: CAT_COLORS[Math.floor(Math.random() * CAT_COLORS.length)],
        isClothed: Math.random() > 0.5, // 50% chance to be clothed
      });
    }
    setCats(initialCats);
  }, [containerSize]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
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
              newTargetX = Math.random() * containerSize.width;
              newTargetY = Math.random() * containerSize.height;
              newDirection = newTargetX > cat.x ? 1 : -1;
            }

            // Move towards target
            const moveX = (newTargetX - cat.x) * 0.02; // Smooth interpolation
            const moveY = (newTargetY - cat.y) * 0.02;

            newX += moveX;
            newY += moveY;

            // Keep within bounds
            newX = Math.max(0, Math.min(containerSize.width, newX));
            newY = Math.max(0, Math.min(containerSize.height, newY));

            // Random chance to stop moving
            if (Math.random() > 0.998) {
              newIsMoving = false;
            }
          } else {
            // Random chance to start moving
            if (Math.random() > 0.998) {
              newIsMoving = true;
              newTargetX = Math.random() * containerSize.width;
              newTargetY = Math.random() * containerSize.height;
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

  const getCatImage = (cat: Cat) => {
    const color = cat.color;
    const clothed = cat.isClothed ? "clothed" : "normal";

    if (cat.isMoving) {
      // Use running animation when moving
      if (clothed === "clothed") {
        switch (color) {
          case "pink":
            return `/cats/${color}/${clothed}/pink corriendo - ropa.gif`;
          case "grey":
            return `/cats/${color}/${clothed}/Running-Clothed--Grey.gif`;
          case "siamese":
            return `/cats/${color}/${clothed}/Corriendo Ropa Siames.gif`;
          case "yellow":
            return `/cats/${color}/${clothed}/Running-Hat-Yellow.gif`;
          case "black":
          default:
            return `/cats/${color}/${clothed}/Running-Hat-Black.gif`;
        }
      } else {
        switch (color) {
          case "pink":
            return `/cats/${color}/${clothed}/Running Pinkie.gif`;
          case "siamese":
            return `/cats/${color}/${clothed}/Running Siamese.png`;
          case "yellow":
            return `/cats/${color}/${clothed}/Running Yellow Cat.gif`;
          case "grey":
            return `/cats/${color}/${clothed}/Running Grey Cat.png`;
          case "black":
          default:
            return `/cats/${color}/${clothed}/Running Black Cat.png`;
        }
      }
    } else {
      // Use idle animation when not moving
      if (clothed === "clothed") {
        switch (color) {
          case "pink":
            return `/cats/${color}/${clothed}/pink sentado - ropa.gif`;
          case "grey":
            return `/cats/${color}/${clothed}/Sitting-Clothed-Grey.gif`;
          case "siamese":
            return `/cats/${color}/${clothed}/SENTADO ROPA Siamese (1).gif`;
          case "yellow":
            return `/cats/${color}/${clothed}/Sitting-Hat-Yellow.gif`;
          case "black":
          default:
            return `/cats/${color}/${clothed}/Idle-Hat-Black.gif`;
        }
      } else {
        switch (color) {
          case "pink":
            return `/cats/${color}/${clothed}/Sitting Pinkie.gif`;
          case "siamese":
            return `/cats/${color}/${clothed}/Sitting Siamese.gif`;
          case "yellow":
            return `/cats/${color}/${clothed}/Sitting Yellow Cat.gif`;
          case "grey":
            return `/cats/${color}/${clothed}/Sitting Grey Cat.gif`;
          case "black":
          default:
            return `/cats/${color}/${clothed}/Sitting Black Cat.gif`;
        }
      }
    }
  };

  return (
    <div
      className="w-full h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url(/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-6xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
          Cat Playground
        </h1>
      </div>

      <div ref={playgroundRef} className="absolute inset-0 w-full h-full" style={{ minHeight: "100vh" }}>
        {cats.map(cat => (
          <div
            key={cat.id}
            className="absolute transition-all duration-100 ease-linear"
            style={{
              left: `${cat.x}px`,
              top: `${cat.y}px`,
              transform: `scaleX(${cat.direction})`,
            }}
          >
            <img
              src={getCatImage(cat)}
              alt={`${cat.color} cat`}
              className="w-24 h-24 object-contain"
              style={{
                filter: cat.direction < 0 ? "scaleX(-1)" : "none",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatPlayground;
