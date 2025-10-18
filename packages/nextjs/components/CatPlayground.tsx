"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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
const CAT_COUNT = 5;

const CatPlayground = () => {
  const [cats, setCats] = useState<Cat[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 600 });
  const catAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

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

  // Initialize cats
  useEffect(() => {
    const initialCats: Cat[] = [];
    const catSize = 96;
    for (let i = 0; i < CAT_COUNT; i++) {
      const startX = Math.random() * Math.max(0, containerSize.width - catSize);
      const startY = Math.random() * Math.max(0, containerSize.height - catSize);
      const targetX = Math.random() * Math.max(0, containerSize.width - catSize);
      const targetY = Math.random() * Math.max(0, containerSize.height - catSize);

      initialCats.push({
        id: i,
        x: startX,
        y: startY,
        targetX: targetX,
        targetY: targetY,
        direction: targetX > startX ? 1 : -1,
        speed: 0.5 + Math.random() * 1.0, // Speed between 0.5 and 1.5
        isMoving: Math.random() > 0.3, // 70% chance to start moving
        color: CAT_COLORS[i], // Use each color once
        isClothed: false, // All cats are not clothed
      });
    }
    setCats(initialCats);
  }, [containerSize]);

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
            return `/cats/${color}/${clothed}/Licking Siamese.gif`;
          case "yellow":
            return `/cats/${color}/${clothed}/Running Yellow Cat.gif`;
          case "grey":
            return `/cats/${color}/${clothed}/Licking Grey Cat.gif`;
          case "black":
          default:
            return `/cats/${color}/${clothed}/Licking Black Cat-export.gif`;
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

      <div
        id="cat-area"
        ref={catAreaRef}
        className="fixed bottom-0 left-0 right-0 z-50 h-48 bg-gradient-to-t from-black/10 to-transparent"
      >
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
            <Image
              src={getCatImage(cat)}
              alt={`${cat.color} cat`}
              width={96}
              height={96}
              className="w-24 h-24 object-contain"
              style={{
                filter: cat.direction < 0 ? "scaleX(-1)" : "none",
              }}
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatPlayground;
