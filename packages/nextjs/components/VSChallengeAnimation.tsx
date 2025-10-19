"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Address } from "viem";

interface CatStats {
  attack: number;
  defence: number;
  speed: number;
  health: number;
}

interface Player {
  address: Address;
  name: string;
  avatar?: string;
  catColor: string;
  catName: string;
  stats: CatStats;
}

interface VSChallengeAnimationProps {
  player1: Player;
  player2: Player;
  onComplete: (winner: Player) => void;
  onClose: () => void;
}

export const VSChallengeAnimation = ({ player1, player2, onComplete, onClose }: VSChallengeAnimationProps) => {
  const [animationPhase, setAnimationPhase] = useState<"intro" | "battle" | "result">("intro");
  const [battleProgress, setBattleProgress] = useState(0);
  const [winner, setWinner] = useState<Player | null>(null);

  // Calculate battle result based on stats
  const calculateWinner = (p1: Player, p2: Player): Player => {
    const p1Total = p1.stats.attack + p1.stats.defence + p1.stats.speed + p1.stats.health;
    const p2Total = p2.stats.attack + p2.stats.defence + p2.stats.speed + p2.stats.health;

    // Add some randomness to make it more exciting
    const p1Final = p1Total + Math.random() * 20;
    const p2Final = p2Total + Math.random() * 20;

    return p1Final > p2Final ? p1 : p2;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | number | undefined;
    let interval: NodeJS.Timeout | number | undefined;

    if (animationPhase === "intro") {
      timer = setTimeout(() => {
        setAnimationPhase("battle");
      }, 2000);
    } else if (animationPhase === "battle") {
      interval = setInterval(() => {
        setBattleProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval as number);
            const battleWinner = calculateWinner(player1, player2);
            setWinner(battleWinner);
            setTimeout(() => setAnimationPhase("result"), 500);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
    } else if (animationPhase === "result" && winner) {
      // Result phase. No auto-close, waiting for button click.
    }

    return () => {
      if (timer) clearTimeout(timer as number);
      if (interval) clearInterval(interval as number);
    };
  }, [animationPhase, player1, player2, onComplete, winner]);

  const getCatImage = (color: string) => {
    const normalizedColor = color.toLowerCase().replace("pinkie", "pink");
    return `/cats/${normalizedColor}/normal/${normalizedColor}-sitting.gif`;
  };

  return (
    <div className="vs-challenge-overlay">
      <div className="vs-challenge-container">
        {/* Intro Phase */}
        {animationPhase === "intro" && (
          <div className="intro-phase">
            <h1 className="vs-title">VS</h1>
            <div className="players-intro">
              <div className="player-card">
                <Image
                  src={getCatImage(player1.catColor)}
                  alt={`${player1.catName}`}
                  width={80}
                  height={80}
                  className="cat-image"
                  unoptimized
                />
                <div className="player-name">{player1.catName}</div>
                <div className="player-address">{player1.name}</div>
              </div>

              <div className="vs-divider-image">
                <Image src="/challengepics/game.png" alt="VS" width={40} height={40} unoptimized />
              </div>

              <div className="player-card">
                <Image
                  src={getCatImage(player2.catColor)}
                  alt={`${player2.catName}`}
                  width={80}
                  height={80}
                  className="cat-image"
                  unoptimized
                />
                <div className="player-name">{player2.catName}</div>
                <div className="player-address">{player2.name}</div>
              </div>
            </div>
          </div>
        )}

        {/* Battle Phase */}
        {animationPhase === "battle" && (
          <div className="battle-phase">
            <div className="battle-arena">
              <div className="battle-cat left">
                <Image
                  src={getCatImage(player1.catColor)}
                  alt={`${player1.catName}`}
                  width={100}
                  height={100}
                  className="cat-image"
                  unoptimized
                  style={{ transform: "scaleX(1)" }}
                />
                <div className="battle-effects-image">
                  <Image src="/challengepics/lightning-bolt.png" alt="Battle" width={30} height={30} unoptimized />
                </div>
              </div>
              <div className="battle-center">
                <div className="battle-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${battleProgress}%` }} />
                  </div>
                  <div className="battle-text">FIGHTING...</div>
                </div>
              </div>
              <div className="battle-cat right">
                <Image
                  src={getCatImage(player2.catColor)}
                  alt={`${player2.catName}`}
                  width={100}
                  height={100}
                  className="cat-image"
                  unoptimized
                  style={{ transform: "scaleX(-1)" }}
                />
                <div className="battle-effects-image">
                  <Image src="/challengepics/lightning-bolt.png" alt="Battle" width={30} height={30} unoptimized />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result Phase */}
        {animationPhase === "result" && winner && (
          <div className="result-phase">
            <div className="winner-celebration">
              {/* Crown Image - Centered */}
              <div className="winner-crown-image">
                <Image src="/challengepics/crown.png" alt="Crown" width={50} height={50} unoptimized />
              </div>
              <h2 className="winner-title">VICTORY!</h2>
              <div className="winner-cat-wrapper">
                <Image
                  src={getCatImage(winner.catColor)}
                  alt={`${winner.catName}`}
                  width={120}
                  height={120}
                  className="cat-image winner-cat-glow"
                  unoptimized
                />
              </div>
              <div className="winner-name">{winner.catName}</div>
              <div className="winner-player nes-text is-primary">{winner.name}</div>

              <button
                type="button"
                className="nes-btn is-success"
                onClick={() => onComplete(winner)}
                style={{ marginTop: "30px" }}
              >
                Close Challenge
              </button>
            </div>
          </div>
        )}

        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <style jsx>{`
        /* --- General/Overlay Styles --- */
        .vs-challenge-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          font-family: "Pixelify Sans", "Courier New", monospace, sans-serif;
        }

        .vs-challenge-container {
          background: #ffffff;
          border: 4px solid #333;
          border-radius: 12px;
          padding: 30px;
          max-width: 600px;
          width: 90vw;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          box-shadow:
            8px 8px 0px #333,
            16px 16px 0px #666;
        }

        .cat-image {
          border: 2px solid #333;
          border-radius: 8px;
          background: white;
        }

        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #ff4444;
          color: white;
          border: 2px solid #333;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: bold;
          font-size: 1.2rem;
        }

        /* --- Intro Phase Styles --- */
        .intro-phase {
          text-align: center;
        }

        .vs-title {
          font-size: 4rem;
          font-weight: bold;
          color: #ff4444;
          text-shadow: 3px 3px 0px #333;
          margin: 20px 0;
          animation: pulse 1s infinite alternate;
        }

        @keyframes pulse {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.1);
          }
        }

        .players-intro {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          margin: 30px 0;
        }

        .player-card {
          text-align: center;
          background: #f4f4f4;
          border: 3px solid #333;
          border-radius: 8px;
          padding: 20px;
          min-width: 150px;
        }

        .vs-divider-image {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* --- Battle Phase Styles --- */
        .battle-phase {
          text-align: center;
        }

        .battle-arena {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 30px 0;
          min-height: 200px;
        }

        .battle-cat {
          position: relative;
          animation: shake 0.5s infinite alternate;
        }

        @keyframes shake {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(5px);
          }
        }

        .battle-effects-image {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          animation: bounce 0.3s infinite alternate;
        }

        @keyframes bounce {
          from {
            transform: translateX(-50%) translateY(0);
          }
          to {
            transform: translateX(-50%) translateY(-10px);
          }
        }

        .battle-center {
          flex: 1;
          margin: 0 20px;
        }

        .progress-bar {
          background: #ddd;
          height: 20px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid #333;
        }

        .progress-fill {
          background: linear-gradient(90deg, #ff4444, #ffaa44);
          height: 100%;
          transition: width 0.1s ease;
          border-radius: 8px;
        }

        /* --- Result Phase Styles --- */
        .result-phase {
          text-align: center;
        }

        .winner-celebration {
          animation: celebration 0.5s ease-in-out;
        }

        @keyframes celebration {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .winner-crown-image {
          margin-bottom: 10px;
          animation: float 2s ease-in-out infinite;
          /* ADDED: Centering the image within its container */
          display: flex;
          justify-content: center;
          align-items: center;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .winner-title {
          font-size: 2.5rem;
          font-weight: bold;
          color: #ffaa00;
          text-shadow: 3px 3px 0px #333;
          margin: 20px 0 10px;
        }

        .winner-cat-wrapper {
          margin: 10px auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .winner-cat-glow {
          border: 4px solid #ffaa00;
          border-radius: 12px;
          box-shadow:
            0 0 20px rgba(255, 170, 0, 0.7),
            0 0 10px rgba(255, 170, 0, 0.5);
        }

        .winner-name {
          font-size: 1.8rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }

        .winner-player {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 10px;
        }

        /* --- Responsive Styles --- */
        @media (max-width: 768px) {
          .players-intro {
            flex-direction: column;
            gap: 20px;
          }

          .vs-divider-image {
            transform: rotate(90deg);
          }

          .battle-arena {
            flex-direction: column;
            gap: 20px;
          }

          .battle-cat.right .cat-image {
            transform: scaleX(1) !important;
          }
        }
      `}</style>
    </div>
  );
};
