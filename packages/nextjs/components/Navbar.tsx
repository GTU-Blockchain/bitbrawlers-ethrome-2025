import Image from "next/image";
import { NesWalletConnectButton } from "./NesWalletConnectButton";
import SimpleENSSearchDialog from "./SimpleENSSearchDialog";

export const Navbar = () => {
  return (
    <div className="navbar bg-transparent fixed top-0 left-0 right-0 z-50 px-5 pt-5">
      <div className="navbar-start">
        <div className="dropdown"></div>
        <Image src="/logo.png" alt="BitBrawlers" width={64} height={64} />
      </div>
      <div className="navbar-end gap-2 flex">
        <SimpleENSSearchDialog />
        <NesWalletConnectButton />
      </div>
    </div>
  );
};
