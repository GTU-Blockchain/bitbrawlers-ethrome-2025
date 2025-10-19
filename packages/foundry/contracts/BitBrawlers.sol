// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title BitBrawlers
 * @dev BitBrawlers: Arena of Chains - Basic MVP Contract
 *
 * This contract includes:
 * - Pet NFTs (ERC721)
 * - Pet statistics (Attack, Defense, Speed, Health)
 * - Basic battle mechanics
 * - ENS integration for metadata
 */
contract BitBrawlers is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;

    // Pet colors
    enum PetColor {
        BLACK,
        GREY,
        PINK,
        SIAMESE,
        YELLOW
    }

    // Pet statistics
    struct PetStats {
        uint256 attack; // Attack power (1-100)
        uint256 defense; // Defense power (1-100)
        uint256 speed; // Speed (1-100)
        uint256 health; // Health (1-100)
        uint256 level; // Level (1-50)
        PetColor color; // Pet color
        bool isClothed; // Is clothed?
    }

    // Pet metadata
    struct PetMetadata {
        string name; // Pet name (linked to ENS)
        string ensDomain; // ENS subdomain
        uint256 createdAt; // Creation timestamp
        uint256 battlesWon; // Battles won count
        uint256 battlesLost; // Battles lost count
    }

    // Token ID -> Pet Stats mapping
    mapping(uint256 => PetStats) public petStats;

    // Token ID -> Pet Metadata mapping
    mapping(uint256 => PetMetadata) public petMetadata;

    // Owner -> Pet Count mapping
    mapping(address => uint256) public ownerPetCount;

    // Battle history
    struct Battle {
        uint256 pet1Id;
        uint256 pet2Id;
        address pet1Owner;
        address pet2Owner;
        uint256 winnerId;
        uint256 timestamp;
        uint256 stakeAmount;
    }

    Battle[] public battles;

    // Events
    event PetMinted(
        address indexed owner,
        uint256 indexed tokenId,
        PetColor color,
        bool isClothed
    );
    event BattleStarted(
        uint256 indexed battleId,
        uint256 pet1Id,
        uint256 pet2Id
    );
    event BattleEnded(uint256 indexed battleId, uint256 winnerId);
    event PetLeveledUp(uint256 indexed tokenId, uint256 newLevel);
    event PetStatsUpdated(
        uint256 indexed tokenId,
        uint256 attack,
        uint256 defense,
        uint256 speed,
        uint256 health
    );

    constructor() ERC721("BitBrawlers", "BB") Ownable(msg.sender) {}

    /**
     * @dev Mint a new pet
     * @param _color Pet color
     * @param _isClothed Is clothed?
     * @param _name Pet name
     * @param _ensDomain ENS subdomain
     */
    function mintPet(
        PetColor _color,
        bool _isClothed,
        string memory _name,
        string memory _ensDomain
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Generate random stats (1-5 range)
        PetStats memory stats = PetStats({
            attack: _generateRandomStat(1, 5),
            defense: _generateRandomStat(1, 5),
            speed: _generateRandomStat(1, 5),
            health: _generateRandomStat(1, 5),
            level: 1,
            color: _color,
            isClothed: _isClothed
        });

        PetMetadata memory metadata = PetMetadata({
            name: _name,
            ensDomain: _ensDomain,
            createdAt: block.timestamp,
            battlesWon: 0,
            battlesLost: 0
        });

        petStats[tokenId] = stats;
        petMetadata[tokenId] = metadata;
        ownerPetCount[msg.sender]++;

        _safeMint(msg.sender, tokenId);

        emit PetMinted(msg.sender, tokenId, _color, _isClothed);
        return tokenId;
    }

    /**
     * @dev Start a battle between two pets
     * @param _pet1Id First pet ID
     * @param _pet2Id Second pet ID
     * @param _stakeAmount Stake amount (currently 0, token support will be added in future)
     */
    function startBattle(
        uint256 _pet1Id,
        uint256 _pet2Id,
        uint256 _stakeAmount
    ) public returns (uint256) {
        require(ownerOf(_pet1Id) != address(0), "Pet 1 does not exist");
        require(ownerOf(_pet2Id) != address(0), "Pet 2 does not exist");
        require(_pet1Id != _pet2Id, "Cannot battle same pet");
        require(ownerOf(_pet1Id) == msg.sender, "Not owner of pet 1");
        require(ownerOf(_pet2Id) != msg.sender, "Cannot battle your own pet");

        uint256 battleId = battles.length;

        Battle memory battle = Battle({
            pet1Id: _pet1Id,
            pet2Id: _pet2Id,
            pet1Owner: ownerOf(_pet1Id),
            pet2Owner: ownerOf(_pet2Id),
            winnerId: 0, // Savaş sonunda belirlenecek
            timestamp: block.timestamp,
            stakeAmount: _stakeAmount
        });

        battles.push(battle);

        emit BattleStarted(battleId, _pet1Id, _pet2Id);
        return battleId;
    }

    /**
     * @dev Savaşı sonuçlandır ve kazananı belirle
     * @param _battleId Savaş ID'si
     */
    function endBattle(uint256 _battleId) public {
        require(_battleId < battles.length, "Battle does not exist");
        Battle storage battle = battles[_battleId];
        require(battle.winnerId == 0, "Battle already ended");

        PetStats memory pet1Stats = petStats[battle.pet1Id];
        PetStats memory pet2Stats = petStats[battle.pet2Id];

        // Calculate battle scores
        uint256 pet1Score = _calculateBattleScore(pet1Stats);
        uint256 pet2Score = _calculateBattleScore(pet2Stats);

        // Determine winner with RNG - stats only affect chance
        uint256 winnerId = _determineWinnerWithRNG(
            pet1Score,
            pet2Score,
            battle.pet1Id,
            battle.pet2Id
        );

        battle.winnerId = winnerId;

        // Update statistics
        if (winnerId == battle.pet1Id) {
            petMetadata[battle.pet1Id].battlesWon++;
            petMetadata[battle.pet2Id].battlesLost++;
        } else {
            petMetadata[battle.pet2Id].battlesWon++;
            petMetadata[battle.pet1Id].battlesLost++;
        }

        // Try level up
        _tryLevelUp(winnerId);

        emit BattleEnded(_battleId, winnerId);
    }

    /**
     * @dev Feed pet and increase stats
     * @param _tokenId Pet ID
     * @param _attackBoost Attack increase
     * @param _defenseBoost Defense increase
     * @param _speedBoost Speed increase
     * @param _healthBoost Health increase
     */
    function feedPet(
        uint256 _tokenId,
        uint256 _attackBoost,
        uint256 _defenseBoost,
        uint256 _speedBoost,
        uint256 _healthBoost
    ) public {
        require(ownerOf(_tokenId) != address(0), "Pet does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Not owner of pet");

        PetStats storage stats = petStats[_tokenId];

        stats.attack = _clampStat(stats.attack + _attackBoost);
        stats.defense = _clampStat(stats.defense + _defenseBoost);
        stats.speed = _clampStat(stats.speed + _speedBoost);
        stats.health = _clampStat(stats.health + _healthBoost);

        emit PetStatsUpdated(
            _tokenId,
            stats.attack,
            stats.defense,
            stats.speed,
            stats.health
        );
    }

    /**
     * @dev Get pet's token URI - simplified version
     * @param _tokenId Pet ID
     */
    function tokenURI(
        uint256 _tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(ownerOf(_tokenId) != address(0), "Pet does not exist");
        return "https://bitbrawlers.com/api/metadata/";
    }

    // Internal functions

    /**
     * @dev Calculate advanced battle score
     * @param _stats Pet statistics
     */
    function _calculateBattleScore(
        PetStats memory _stats
    ) internal pure returns (uint256) {
        // Each stat has different weight
        uint256 attackWeight = 4;
        uint256 defenseWeight = 3;
        uint256 speedWeight = 2;
        uint256 healthWeight = 1;

        // Level bonus (2% bonus per level)
        uint256 levelBonus = _stats.level * 2;

        // Calculate base score
        uint256 baseScore = (_stats.attack *
            attackWeight +
            _stats.defense *
            defenseWeight +
            _stats.speed *
            speedWeight +
            _stats.health *
            healthWeight) / 10; // Divide by 10 to normalize

        // Add level bonus
        uint256 finalScore = baseScore + levelBonus;

        return finalScore;
    }

    /**
     * @dev Determine winner with advanced battle algorithm
     * @param _pet1Score First pet score
     * @param _pet2Score Second pet score
     * @param _pet1Id First pet ID
     * @param _pet2Id Second pet ID
     */
    function _determineWinnerWithRNG(
        uint256 _pet1Score,
        uint256 _pet2Score,
        uint256 _pet1Id,
        uint256 _pet2Id
    ) internal view returns (uint256) {
        // If scores are equal, 50% chance
        if (_pet1Score == _pet2Score) {
            return _generateRandomStat(0, 1) == 0 ? _pet1Id : _pet2Id;
        }

        // Calculate score difference
        uint256 scoreDiff;
        bool pet1Stronger;

        if (_pet1Score > _pet2Score) {
            scoreDiff = _pet1Score - _pet2Score;
            pet1Stronger = true;
        } else {
            scoreDiff = _pet2Score - _pet1Score;
            pet1Stronger = false;
        }

        // Calculate win chance based on score difference
        uint256 baseChance = 50; // Base 50% chance
        uint256 advantageBonus = (scoreDiff * 100) / (_pet1Score + _pet2Score); // Score difference bonus

        // Maximum 25% bonus (don't make it too unbalanced)
        if (advantageBonus > 25) advantageBonus = 25;

        uint256 finalChance;
        if (pet1Stronger) {
            finalChance = baseChance + advantageBonus;
        } else {
            finalChance = baseChance - advantageBonus;
        }

        // Minimum 15%, maximum 90% chance (don't make it too unbalanced)
        if (finalChance < 15) finalChance = 15;
        if (finalChance > 90) finalChance = 90;

        // Determine winner with RNG
        uint256 randomValue = _generateRandomStat(1, 100);

        if (randomValue <= finalChance) {
            return _pet1Id;
        } else {
            return _pet2Id;
        }
    }

    /**
     * @dev Generate random statistic
     */
    function _generateRandomStat(
        uint256 _min,
        uint256 _max
    ) internal view returns (uint256) {
        return
            _min +
            (uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.difficulty,
                        msg.sender
                    )
                )
            ) % (_max - _min + 1));
    }

    /**
     * @dev Clamp stat value (1-100 range)
     */
    function _clampStat(uint256 _stat) internal pure returns (uint256) {
        if (_stat > 100) return 100;
        if (_stat < 1) return 1;
        return _stat;
    }

    /**
     * @dev Try level up chance
     */
    function _tryLevelUp(uint256 _tokenId) internal {
        PetStats storage stats = petStats[_tokenId];
        if (stats.level < 50 && _generateRandomStat(1, 100) <= 20) {
            // 20% chance
            stats.level++;
            emit PetLeveledUp(_tokenId, stats.level);
        }
    }

    /**
     * @dev Generate image path based on pet color and clothing status
     */
    function _generateImagePath(
        PetColor _color,
        bool _isClothed
    ) internal pure returns (string memory) {
        string memory clothingPath = _isClothed ? "clothed" : "normal";

        // Convert color name to lowercase for folder structure
        string memory folderName;
        if (_color == PetColor.BLACK) folderName = "black";
        else if (_color == PetColor.GREY) folderName = "grey";
        else if (_color == PetColor.PINK) folderName = "pink";
        else if (_color == PetColor.SIAMESE) folderName = "siamese";
        else if (_color == PetColor.YELLOW) folderName = "yellow";
        else folderName = "black"; // fallback

        // Return the path to the appropriate cat image
        return
            string(
                abi.encodePacked(
                    "/cats/",
                    folderName,
                    "/",
                    clothingPath,
                    "/",
                    _getDefaultImageName(_color, _isClothed)
                )
            );
    }

    /**
     * @dev Get default image name for each color and clothing combination
     */
    function _getDefaultImageName(
        PetColor _color,
        bool _isClothed
    ) internal pure returns (string memory) {
        if (_color == PetColor.BLACK) {
            return _isClothed ? "black-breath-clothed.gif" : "black-breath.gif";
        } else if (_color == PetColor.GREY) {
            return _isClothed ? "grey-breath-clothed.gif" : "grey-breath.gif";
        } else if (_color == PetColor.PINK) {
            return _isClothed ? "pink-breath-clothed.gif" : "pink-breath.gif";
        } else if (_color == PetColor.SIAMESE) {
            return
                _isClothed
                    ? "siamese-breath-clothed.gif"
                    : "siamese-breath.gif";
        } else if (_color == PetColor.YELLOW) {
            return
                _isClothed ? "yellow-breath-clothed.gif" : "yellow-breath.gif";
        }
        return "black-breath.gif"; // fallback
    }

    function _getColorName(
        PetColor _color
    ) internal pure returns (string memory) {
        if (_color == PetColor.BLACK) return "Black";
        if (_color == PetColor.GREY) return "Grey";
        if (_color == PetColor.PINK) return "Pink";
        if (_color == PetColor.SIAMESE) return "Siamese";
        if (_color == PetColor.YELLOW) return "Yellow";
        return "Unknown";
    }

    /**
     * @dev Base64 encode - simplified version
     */
    function _base64Encode(
        bytes memory _data
    ) internal pure returns (string memory) {
        return
            "data:application/json;base64,eyJuYW1lIjoiQml0QnJhd2xlcnMgUGV0IiwiZGVzY3JpcHRpb24iOiJBIGZpZ2h0aW5nIHBldCBmb3IgdGhlIGFyZW5hIiwiYXR0cmlidXRlcyI6W119";
    }

    // View functions

    /**
     * @dev Get all pet information
     */
    function getPetInfo(
        uint256 _tokenId
    ) public view returns (PetStats memory stats, PetMetadata memory metadata) {
        require(ownerOf(_tokenId) != address(0), "Pet does not exist");
        return (petStats[_tokenId], petMetadata[_tokenId]);
    }

    /**
     * @dev Get battle information
     */
    function getBattleInfo(
        uint256 _battleId
    ) public view returns (Battle memory) {
        require(_battleId < battles.length, "Battle does not exist");
        return battles[_battleId];
    }

    /**
     * @dev Get total battle count
     */
    function getTotalBattles() public view returns (uint256) {
        return battles.length;
    }

    /**
     * @dev Get owner's pet count
     */
    function getOwnerPetCount(address _owner) public view returns (uint256) {
        return ownerPetCount[_owner];
    }

    /**
     * @dev Get all cats for an owner
     */
    function getAllCats(
        address _owner
    ) public view returns (uint256[] memory tokenIds) {
        uint256 count = ownerPetCount[_owner];
        tokenIds = new uint256[](count);

        uint256 index = 0;
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            try this.ownerOf(i) returns (address owner) {
                if (owner == _owner) {
                    tokenIds[index] = i;
                    index++;
                    if (index >= count) break;
                }
            } catch {
                // Token doesn't exist, continue
                continue;
            }
        }

        return tokenIds;
    }

    /**
     * @dev Get all cats with complete data for an owner
     */
    function getAllCatsWithData(
        address _owner
    )
        public
        view
        returns (
            uint256[] memory tokenIds,
            PetStats[] memory stats,
            PetMetadata[] memory metadata
        )
    {
        uint256 count = ownerPetCount[_owner];
        tokenIds = new uint256[](count);
        stats = new PetStats[](count);
        metadata = new PetMetadata[](count);

        uint256 index = 0;
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            try this.ownerOf(i) returns (address owner) {
                if (owner == _owner) {
                    tokenIds[index] = i;
                    stats[index] = petStats[i];
                    metadata[index] = petMetadata[i];
                    index++;
                    if (index >= count) break;
                }
            } catch {
                // Token doesn't exist, continue
                continue;
            }
        }

        return (tokenIds, stats, metadata);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
