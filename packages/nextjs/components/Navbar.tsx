import Image from "next/image";
import BackgroundStore from "./BackgroundStore";
import { NesWalletConnectButton } from "./NesWalletConnectButton";
import SimpleENSSearchDialog from "./SimpleENSSearchDialog";

export const Navbar = () => {
  return (
    <div className="navbar bg-transparent fixed top-0 left-0 right-0 z-50 px-5 pt-5">
      <div className="navbar-start gap-2 flex items-center">
        <div className="dropdown"></div>
        <Image src="/logo.png" alt="BitBrawlers" width={64} height={64} />
        <BackgroundStore />
      </div>
      <div className="navbar-end gap-2 flex">
        <SimpleENSSearchDialog />
        <NesWalletConnectButton />
      </div>
    </div>
  );
};
