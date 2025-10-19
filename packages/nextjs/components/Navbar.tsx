"use client";

import { useState } from "react";
import Image from "next/image";
import { NesWalletConnectButton } from "./NesWalletConnectButton";
import SimpleENSSearchDialog from "./SimpleENSSearchDialog";
import UnlockCatDialog from "./UnlockCatDialog";

export const Navbar = () => {
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

  const handleUnlockCat = (tokenId: number) => {
    // This would be passed up to the parent component or handled via context
    console.log("New cat unlocked with tokenId:", tokenId);
    // For now, just show an alert
    alert(`Congratulations! You've unlocked a new cat with tokenId: ${tokenId}!`);
  };

  return (
    <>
      <div className="navbar bg-transparent fixed top-0 left-0 right-0 z-50 px-5 pt-5">
        <div className="navbar-start">
          <div className="dropdown"></div>
          <Image src="/logo.png" alt="BitBrawlers" width={64} height={64} />
        </div>
        <div className="navbar-end gap-2 flex">
          <button type="button" className="nes-btn is-success" onClick={() => setShowUnlockDialog(true)}>
            Unlock Cat
          </button>
          <SimpleENSSearchDialog />
          <NesWalletConnectButton />
        </div>
      </div>

      {showUnlockDialog && <UnlockCatDialog onClose={() => setShowUnlockDialog(false)} onUnlockCat={handleUnlockCat} />}

      <style jsx>{`
        .navbar-end :global(.nes-btn) {
          min-width: 120px;
        }

        .navbar-end :global(button) {
          min-width: 120px;
        }
      `}</style>
    </>
  );
};
