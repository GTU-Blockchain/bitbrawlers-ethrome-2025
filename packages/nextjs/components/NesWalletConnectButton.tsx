import { ConnectButton } from "@rainbow-me/rainbowkit";

export const NesWalletConnectButton = () => {
  return (
    <>
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openConnectModal, authenticationStatus, mounted }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");
          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button className="nes-btn is-primary connect-button" onClick={openConnectModal} type="button">
                      Connect
                    </button>
                  );
                }
                return (
                  <button className="nes-btn is-success connected-button" onClick={openAccountModal} type="button">
                    {account.displayName}
                  </button>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>

      <style jsx>{`
        .connect-button {
          border: 3px solid #333 !important;
          background: linear-gradient(135deg, #27ae60 0%, #229954 100%) !important;
          color: white !important;
          box-shadow:
            3px 3px 0px #333,
            6px 6px 0px #666;
          font-weight: bold;
          text-shadow: 1px 1px 0px #000;
          transition: all 0.2s ease;
        }

        .connect-button:hover {
          background: linear-gradient(135deg, #229954 0%, #1e8449 100%) !important;
          transform: translate(1px, 1px);
          box-shadow:
            2px 2px 0px #333,
            4px 4px 0px #666;
        }

        .connect-button:active {
          transform: translate(2px, 2px);
          box-shadow:
            1px 1px 0px #333,
            2px 2px 0px #666;
        }

        .connected-button {
          border: 3px solid #333 !important;
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%) !important;
          color: white !important;
          box-shadow:
            3px 3px 0px #333,
            6px 6px 0px #666;
          font-weight: bold;
          text-shadow: 1px 1px 0px #000;
          transition: all 0.2s ease;
        }

        .connected-button:hover {
          background: linear-gradient(135deg, #e67e22 0%, #d35400 100%) !important;
          transform: translate(1px, 1px);
          box-shadow:
            2px 2px 0px #333,
            4px 4px 0px #666;
        }

        .connected-button:active {
          transform: translate(2px, 2px);
          box-shadow:
            1px 1px 0px #333,
            2px 2px 0px #666;
        }
      `}</style>
    </>
  );
};
