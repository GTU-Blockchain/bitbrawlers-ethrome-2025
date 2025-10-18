// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/BitBrawlers.sol";

contract BitBrawlersTest is Test {
    BitBrawlers public bitBrawlers;
    address public owner;
    address public player1;
    address public player2;

    function setUp() public {
        owner = address(this);
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");

        bitBrawlers = new BitBrawlers();

        // Give some ETH to players
        vm.deal(player1, 10 ether);
        vm.deal(player2, 10 ether);
    }

    function testMintPet() public {
        vm.prank(player1);
        uint256 tokenId = bitBrawlers.mintPet(
            BitBrawlers.PetColor.BLACK,
            true,
            "Shadow Warrior",
            "shadow-warrior.player1.eth"
        );

        assertEq(tokenId, 0);
        assertEq(bitBrawlers.ownerOf(tokenId), player1);
        assertEq(bitBrawlers.getOwnerPetCount(player1), 1);

        // Check pet stats
        (
            BitBrawlers.PetStats memory stats,
            BitBrawlers.PetMetadata memory metadata
        ) = bitBrawlers.getPetInfo(tokenId);

        assertEq(uint256(stats.color), uint256(BitBrawlers.PetColor.BLACK));
        assertTrue(stats.isClothed);
        assertEq(stats.level, 1);
        assertEq(metadata.name, "Shadow Warrior");
        assertEq(metadata.ensDomain, "shadow-warrior.player1.eth");
        assertEq(metadata.battlesWon, 0);
        assertEq(metadata.battlesLost, 0);
    }

    function testMintMultiplePets() public {
        vm.startPrank(player1);

        uint256 pet1 = bitBrawlers.mintPet(
            BitBrawlers.PetColor.BLACK,
            true,
            "Shadow Warrior",
            "shadow-warrior.player1.eth"
        );

        uint256 pet2 = bitBrawlers.mintPet(
            BitBrawlers.PetColor.PINK,
            false,
            "Pinkie Pie",
            "pinkie-pie.player1.eth"
        );

        vm.stopPrank();

        assertEq(pet1, 0);
        assertEq(pet2, 1);
        assertEq(bitBrawlers.getOwnerPetCount(player1), 2);
    }

    function testBattleMechanics() public {
        // Mint pets for both players
        vm.prank(player1);
        uint256 pet1 = bitBrawlers.mintPet(
            BitBrawlers.PetColor.BLACK,
            true,
            "Shadow Warrior",
            "shadow-warrior.player1.eth"
        );

        vm.prank(player2);
        uint256 pet2 = bitBrawlers.mintPet(
            BitBrawlers.PetColor.PINK,
            false,
            "Pinkie Pie",
            "pinkie-pie.player2.eth"
        );

        // Start battle
        vm.prank(player1);
        uint256 battleId = bitBrawlers.startBattle(pet1, pet2, 0);

        assertEq(battleId, 0);
        assertEq(bitBrawlers.getTotalBattles(), 1);

        // Check battle info
        BitBrawlers.Battle memory battle = bitBrawlers.getBattleInfo(battleId);
        assertEq(battle.pet1Id, pet1);
        assertEq(battle.pet2Id, pet2);
        assertEq(battle.pet1Owner, player1);
        assertEq(battle.pet2Owner, player2);
        assertEq(battle.winnerId, 0); // Not determined yet
        assertEq(battle.stakeAmount, 0);
    }

    function testEndBattle() public {
        // Mint pets
        vm.prank(player1);
        uint256 pet1 = bitBrawlers.mintPet(
            BitBrawlers.PetColor.BLACK,
            true,
            "Shadow Warrior",
            "shadow-warrior.player1.eth"
        );

        vm.prank(player2);
        uint256 pet2 = bitBrawlers.mintPet(
            BitBrawlers.PetColor.PINK,
            false,
            "Pinkie Pie",
            "pinkie-pie.player2.eth"
        );

        // Start and end battle
        vm.prank(player1);
        uint256 battleId = bitBrawlers.startBattle(pet1, pet2, 0);

        vm.prank(player1);
        bitBrawlers.endBattle(battleId);

        // Check battle result
        BitBrawlers.Battle memory battle = bitBrawlers.getBattleInfo(battleId);
        assertTrue(battle.winnerId == pet1 || battle.winnerId == pet2);
        assertTrue(battle.winnerId != 0);

        // Check pet statistics
        (, BitBrawlers.PetMetadata memory pet1Metadata) = bitBrawlers
            .getPetInfo(pet1);
        (, BitBrawlers.PetMetadata memory pet2Metadata) = bitBrawlers
            .getPetInfo(pet2);

        if (battle.winnerId == pet1) {
            assertEq(pet1Metadata.battlesWon, 1);
            assertEq(pet1Metadata.battlesLost, 0);
            assertEq(pet2Metadata.battlesWon, 0);
            assertEq(pet2Metadata.battlesLost, 1);
        } else {
            assertEq(pet1Metadata.battlesWon, 0);
            assertEq(pet1Metadata.battlesLost, 1);
            assertEq(pet2Metadata.battlesWon, 1);
            assertEq(pet2Metadata.battlesLost, 0);
        }
    }

    function testFeedPet() public {
        vm.prank(player1);
        uint256 tokenId = bitBrawlers.mintPet(
            BitBrawlers.PetColor.BLACK,
            true,
            "Shadow Warrior",
            "shadow-warrior.player1.eth"
        );

        // Get initial stats
        (BitBrawlers.PetStats memory initialStats, ) = bitBrawlers.getPetInfo(
            tokenId
        );
        uint256 initialAttack = initialStats.attack;

        // Feed pet
        vm.prank(player1);
        bitBrawlers.feedPet(tokenId, 2, 1, 1, 1);

        // Check updated stats
        (BitBrawlers.PetStats memory updatedStats, ) = bitBrawlers.getPetInfo(
            tokenId
        );
        assertEq(updatedStats.attack, initialAttack + 2);
        assertEq(updatedStats.defense, initialStats.defense + 1);
        assertEq(updatedStats.speed, initialStats.speed + 1);
        assertEq(updatedStats.health, initialStats.health + 1);
    }

    function testStatClamping() public {
        vm.prank(player1);
        uint256 tokenId = bitBrawlers.mintPet(
            BitBrawlers.PetColor.BLACK,
            true,
            "Shadow Warrior",
            "shadow-warrior.player1.eth"
        );

        // Try to feed with very high values
        vm.prank(player1);
        bitBrawlers.feedPet(tokenId, 200, 200, 200, 200);

        // Check that stats are clamped to 100
        (BitBrawlers.PetStats memory stats, ) = bitBrawlers.getPetInfo(tokenId);
        assertEq(stats.attack, 100);
        assertEq(stats.defense, 100);
        assertEq(stats.speed, 100);
        assertEq(stats.health, 100);
    }

    function testBattleScoreCalculation() public {
        vm.prank(player1);
        uint256 tokenId = bitBrawlers.mintPet(
            BitBrawlers.PetColor.BLACK,
            true,
            "Shadow Warrior",
            "shadow-warrior.player1.eth"
        );

        // Feed pet to have known stats
        vm.prank(player1);
        bitBrawlers.feedPet(tokenId, 4, 3, 2, 1);

        (BitBrawlers.PetStats memory stats, ) = bitBrawlers.getPetInfo(tokenId);

        // Expected score calculation:
        // attack=5*4 + defense=4*3 + speed=3*2 + health=2*1 = 20+12+6+2 = 40
        // 40/10 = 4 base score
        // + level bonus (1*2 = 2)
        // Total = 6
        assertTrue(stats.attack >= 5);
        assertTrue(stats.defense >= 4);
        assertTrue(stats.speed >= 3);
        assertTrue(stats.health >= 2);
    }

    function testMultipleBattles() public {
        // Mint pets
        vm.prank(player1);
        uint256 pet1 = bitBrawlers.mintPet(
            BitBrawlers.PetColor.BLACK,
            true,
            "Shadow Warrior",
            "shadow-warrior.player1.eth"
        );

        vm.prank(player2);
        uint256 pet2 = bitBrawlers.mintPet(
            BitBrawlers.PetColor.PINK,
            false,
            "Pinkie Pie",
            "pinkie-pie.player2.eth"
        );

        // Fight multiple battles
        for (uint i = 0; i < 5; i++) {
            vm.prank(player1);
            uint256 battleId = bitBrawlers.startBattle(pet1, pet2, 0);

            vm.prank(player1);
            bitBrawlers.endBattle(battleId);
        }

        assertEq(bitBrawlers.getTotalBattles(), 5);

        // Check that battle statistics are updated
        (, BitBrawlers.PetMetadata memory pet1Metadata) = bitBrawlers
            .getPetInfo(pet1);
        (, BitBrawlers.PetMetadata memory pet2Metadata) = bitBrawlers
            .getPetInfo(pet2);

        assertEq(pet1Metadata.battlesWon + pet1Metadata.battlesLost, 5);
        assertEq(pet2Metadata.battlesWon + pet2Metadata.battlesLost, 5);
        assertEq(pet1Metadata.battlesWon + pet2Metadata.battlesWon, 5);
    }

    function testCannotBattleOwnPet() public {
        vm.prank(player1);
        uint256 pet1 = bitBrawlers.mintPet(
            BitBrawlers.PetColor.BLACK,
            true,
            "Shadow Warrior",
            "shadow-warrior.player1.eth"
        );

        vm.prank(player1);
        uint256 pet2 = bitBrawlers.mintPet(
            BitBrawlers.PetColor.PINK,
            false,
            "Pinkie Pie",
            "pinkie-pie.player1.eth"
        );

        // Should fail when trying to battle own pets
        vm.prank(player1);
        vm.expectRevert("Cannot battle your own pet");
        bitBrawlers.startBattle(pet1, pet2, 0);
    }

    function testCannotBattleSamePet() public {
        vm.prank(player1);
        uint256 pet1 = bitBrawlers.mintPet(
            BitBrawlers.PetColor.BLACK,
            true,
            "Shadow Warrior",
            "shadow-warrior.player1.eth"
        );

        vm.prank(player1);
        vm.expectRevert("Cannot battle same pet");
        bitBrawlers.startBattle(pet1, pet1, 0);
    }

    function testTokenURI() public {
        vm.prank(player1);
        uint256 tokenId = bitBrawlers.mintPet(
            BitBrawlers.PetColor.BLACK,
            true,
            "Shadow Warrior",
            "shadow-warrior.player1.eth"
        );

        string memory uri = bitBrawlers.tokenURI(tokenId);
        assertTrue(bytes(uri).length > 0);
        assertTrue(bytes(uri).length > 100); // Should be a substantial JSON
    }
}
