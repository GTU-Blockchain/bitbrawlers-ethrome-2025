"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDebounceValue } from "usehooks-ts";
import { Address, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { isENS } from "~~/components/scaffold-eth/Input/utils";

interface ENSSearchResult {
  address?: Address;
  name?: string;
  avatar?: string;
  isLoading: boolean;
  error?: string;
}

interface ENSSearchBarProps {
  onSearchResult?: (result: ENSSearchResult) => void;
  placeholder?: string;
  className?: string;
}

export const ENSSearchBar = ({
  onSearchResult,
  placeholder = "Enter ENS name or address...",
  className = "",
}: ENSSearchBarProps) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedValue] = useDebounceValue(searchValue, 500);
  const [searchResult, setSearchResult] = useState<ENSSearchResult>({
    isLoading: false,
  });

  // Determine if the input is an ENS name or address
  const isEnsName = isENS(debouncedValue);
  const isEthAddress = isAddress(debouncedValue);

  // Resolve ENS name to address
  const {
    data: ensAddress,
    isLoading: isEnsAddressLoading,
    isError: isEnsAddressError,
  } = useEnsAddress({
    name: debouncedValue,
    chainId: 1,
    query: {
      gcTime: 30_000,
      enabled: Boolean(debouncedValue) && isEnsName,
    },
  });

  // Resolve address to ENS name
  const {
    data: ensName,
    isLoading: isEnsNameLoading,
    isError: isEnsNameError,
  } = useEnsName({
    address: debouncedValue as Address,
    chainId: 1,
    query: {
      enabled: Boolean(debouncedValue) && isEthAddress,
      gcTime: 30_000,
    },
  });

  // Get ENS avatar - fetch for both resolved ensName and direct ENS input
  const avatarName = ensName || (isEnsName ? debouncedValue : undefined);
  const { data: ensAvatar, isLoading: isEnsAvatarLoading } = useEnsAvatar({
    name: avatarName ? normalize(avatarName) : undefined,
    chainId: 1,
    query: {
      enabled: Boolean(avatarName),
      gcTime: 30_000,
    },
  });

  // Update search result based on resolution
  useEffect(() => {
    const isLoading = isEnsAddressLoading || isEnsNameLoading || isEnsAvatarLoading;
    const hasError = isEnsAddressError || isEnsNameError;

    if (isLoading) {
      setSearchResult({ isLoading: true });
      return;
    }

    if (hasError || (!ensAddress && !ensName && debouncedValue)) {
      setSearchResult({
        isLoading: false,
        error: "Unable to resolve ENS name or address",
      });
      return;
    }

    if (ensAddress || ensName) {
      const result: ENSSearchResult = {
        address: ensAddress || (debouncedValue as Address),
        name: ensName || debouncedValue,
        avatar: ensAvatar || undefined,
        isLoading: false,
      };
      setSearchResult(result);
      onSearchResult?.(result);
    } else {
      setSearchResult({ isLoading: false });
    }
  }, [
    ensAddress,
    ensName,
    ensAvatar,
    isEnsAddressLoading,
    isEnsNameLoading,
    isEnsAvatarLoading,
    isEnsAddressError,
    isEnsNameError,
    debouncedValue,
    onSearchResult,
  ]);

  const handleSearch = () => {
    if (!searchValue.trim()) return;

    // Trigger the search by updating the debounced value
    setSearchValue(searchValue.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={`ens-search-container ${className}`}>
      <div className="search-input-container">
        <input
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="nes-input"
          disabled={searchResult.isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={searchResult.isLoading || !searchValue.trim()}
          className="nes-btn is-primary"
        >
          {searchResult.isLoading ? "..." : "Search"}
        </button>
      </div>

      {/* Search Results Display */}
      {searchResult.address && (
        <div className="search-result nes-container is-rounded">
          <div className="result-content">
            {searchResult.avatar && (
              <Image
                src={searchResult.avatar}
                alt="ENS Avatar"
                className="ens-avatar rounded-full"
                width={32}
                height={32}
              />
            )}
            <div className="result-info">
              <div className="ens-name">{searchResult.name}</div>
              <div className="ens-address">{searchResult.address}</div>
            </div>
          </div>
        </div>
      )}

      {searchResult.error && (
        <div className="search-error nes-container is-rounded">
          <div className="error-message">{searchResult.error}</div>
        </div>
      )}

      <style jsx>{`
        .ens-search-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .search-input-container {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 20px;
        }

        .search-input-container .nes-input {
          flex: 1;
          min-width: 0;
          color: #333 !important;
          font-weight: bold;
        }

        .search-input-container .nes-input::placeholder {
          color: #666;
        }

        .search-result {
          background-color: #f4f4f4;
          border: 2px solid #333;
          padding: 15px;
          margin-top: 10px;
        }

        .result-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ens-avatar {
          border-radius: 50%;
          border: 2px solid #333;
        }

        .result-info {
          flex: 1;
        }

        .ens-name {
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }

        .ens-address {
          font-family: var(--font-pixelify-sans), "Courier New", monospace, sans-serif;
          font-size: 0.9em;
          color: #666;
          word-break: break-all;
        }
        .search-error {
          background-color: #ffebee;
          border: 2px solid #f44336;
          color: #d32f2f;
          padding: 15px;
          margin-top: 10px;
        }

        .error-message {
          font-weight: bold;
        }

        .nes-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .nes-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ENSSearchBar;
