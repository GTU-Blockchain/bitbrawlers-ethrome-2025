// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/BitBrawlers.sol";

/**
 * @notice Deploy script for BitBrawlers contract
 * @dev Inherits ScaffoldETHDeploy which:
 *      - Includes forge-std/Script.sol for deployment
 *      - Includes ScaffoldEthDeployerRunner modifier
 *      - Provides `deployer` variable
 * Example:
 * yarn deploy --file DeployBitBrawlers.s.sol  # local anvil chain
 * yarn deploy --file DeployBitBrawlers.s.sol --network optimism # live network (requires keystore)
 */
contract DeployBitBrawlers is ScaffoldETHDeploy {
    /**
     * @dev Deployer setup based on `ETH_KEYSTORE_ACCOUNT` in `.env`:
     *      - "scaffold-eth-default": Uses Anvil's account #9 (0xa0Ee7A142d267C1f36714E4a8F75612F20a79720), no password prompt
     *      - "scaffold-eth-custom": requires password used while creating keystore
     *
     * Note: Must use ScaffoldEthDeployerRunner modifier to:
     *      - Setup correct `deployer` account and fund it
     *      - Export contract addresses & ABIs to `nextjs` packages
     */
    function run() external ScaffoldEthDeployerRunner {
        BitBrawlers bitBrawlers = new BitBrawlers();

        // Mint initial pets for testing
        _mintInitialPets(bitBrawlers);
    }

    /**
     * @dev Mint initial pets for testing
     */
    function _mintInitialPets(BitBrawlers _contract) internal {
        // Mint pets for the deployer
        _contract.mintPet(
            BitBrawlers.PetColor.BLACK,
            false,
            "Shadow Warrior",
            "shadow-warrior.deployer.eth"
        );

        _contract.mintPet(
            BitBrawlers.PetColor.PINK,
            false,
            "Pinkie Pie",
            "pinkie-pie.deployer.eth"
        );

        _contract.mintPet(
            BitBrawlers.PetColor.YELLOW,
            false,
            "Golden Thunder",
            "golden-thunder.deployer.eth"
        );
    }
}
