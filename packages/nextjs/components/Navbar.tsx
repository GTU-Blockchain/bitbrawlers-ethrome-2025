import { NesWalletConnectButton } from "./NesWalletConnectButton";
import SimpleENSSearchDialog from "./SimpleENSSearchDialog";

export const Navbar = () => {
  return (
    <div className="navbar bg-transparent fixed top-0 left-0 right-0 z-50 px-">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
        </div>
        <a className="btn btn-ghost text-xl">BitBrawlers</a>
      </div>
      <div className="navbar-end">
        <SimpleENSSearchDialog />
        <NesWalletConnectButton />
      </div>
    </div>
  );
};
