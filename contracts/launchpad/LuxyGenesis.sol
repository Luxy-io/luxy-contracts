/*
                            __;φφφ≥,,╓╓,__
                           _φ░░░░░░░░░░░░░φ,_
                           φ░░░░░░░░░░░░╚░░░░_
                           ░░░░░░░░░░░░░░░▒▒░▒_
                          _░░░░░░░░░░░░░░░░╬▒░░_
    _≤,                    _░░░░░░░░░░░░░░░░╠░░ε
    _Σ░≥_                   `░░░░░░░░░░░░░░░╚░░░_
     _φ░░                     ░░░░░░░░░░░░░░░▒░░
       ░░░,                    `░░░░░░░░░░░░░╠░░___
       _░░░░░≥,                 _`░░░░░░░░░░░░░░░░░φ≥, _
       ▒░░░░░░░░,_                _ ░░░░░░░░░░░░░░░░░░░░░≥,_
      ▐░░░░░░░░░░░                 φ░░░░░░░░░░░░░░░░░░░░░░░▒,
       ░░░░░░░░░░░[             _;░░░░░░░░░░░░░░░░░░░░░░░░░░░
       \░░░░░░░░░░░»;;--,,. _  ,░░░░░░░░░░░░░░░░░░░░░░░░░░░░░Γ
       _`░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░φ,,x
         _"░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"=░░░░░░░░░░░░░░░░░
            Σ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░_    `╙δ░░░░Γ"  ²░Γ_
         ,φ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░_
       _φ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░φ░░≥_
      ,▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░≥
     ,░░░░░░░░░░░░░░░░░╠▒░▐░░░░░░░░░░░░░░░╚░░░░░≥
    _░░░░░░░░░░░░░░░░░░▒░░▐░░░░░░░░░░░░░░░░╚▒░░░░░
    φ░░░░░░░░░░░░░░░░░φ░░Γ'░░░░░░░░░░░░░░░░░░░░░░░░
    ░░░░░░░░░░░░░░░░░░░░░_ ░░░░░░░░░░░░░░░░░░░░░░░░[
    ╚░░░░░░░░░░░░░░░░░░░_  └░░░░░░░░░░░░░░░░░░░░░░░░
    _╚░░░░░░░░░░░░░▒"^     _7░░░░░░░░░░░░░░░░░░░░░░Γ
     _`╚░░░░░░░░╚²_          \░░░░░░░░░░░░░░░░░░░░Γ
         ____                _`░░░░░░░░░░░░░░░Γ╙`
                               _"φ░░░░░░░░░░╚_
                                 _ `""²ⁿ""

        ██╗         ██╗   ██╗    ██╗  ██╗    ██╗   ██╗
        ██║         ██║   ██║    ╚██╗██╔╝    ╚██╗ ██╔╝
        ██║         ██║   ██║     ╚███╔╝      ╚████╔╝ 
        ██║         ██║   ██║     ██╔██╗       ╚██╔╝  
        ███████╗    ╚██████╔╝    ██╔╝ ██╗       ██║   
        ╚══════╝     ╚═════╝     ╚═╝  ╚═╝       ╚═╝   
*/

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../RoyaltiesV1Luxy.sol";
import "../tokens/ERC2981/IERC2981.sol";

contract LuxyGenesis is
    ERC721EnumerableUpgradeable,
    ERC721BurnableUpgradeable,
    OwnableUpgradeable,
    RoyaltiesV1Luxy
{
    mapping(address => bool) private _whitelist;
    mapping(uint256 => uint256) private _assignOrders;
    uint256 public whitelistSize;

    string public baseURI;
    IERC20Upgradeable luxy;

    address public artist;
    address public luxyLaunchpadFeeManagerProxy;
    uint256 public constant MAX_BATCH_MINT = 10;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant DROP_START_TIME = 0;
    uint256 public constant PRICE_PER_TOKEN = 0.0001 ether;
    uint256 public constant WHITELIST_EXPIRE_TIME = 1 days;
    uint256 public constant LUXY_SALE_EXPIRE_TIME = 2 days;
    uint256 public constant MINIMUM_LUXY_AMOUNT = 1000 ether;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    function __LuxyGenesis_init(
        string memory baseURI_,
        IERC20Upgradeable luxy_,
        address artist_,
        address luxyLaunchpadFeeManagerProxy_
    ) external initializer {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __ERC721_init_unchained("LuxyGenesis", "LuxyGenesis");
        __ERC721Enumerable_init_unchained();
        __Ownable_init_unchained();
        __LuxyGenesis_init_unchained(
            baseURI_,
            luxy_,
            artist_,
            luxyLaunchpadFeeManagerProxy_
        );
    }

    function __LuxyGenesis_init_unchained(
        string memory baseURI_,
        IERC20Upgradeable luxy_,
        address artist_,
        address luxyLaunchpadFeeManagerProxy_
    ) internal initializer {
        baseURI = baseURI_;
        luxy = luxy_;
        artist = artist_;
        luxyLaunchpadFeeManagerProxy = luxyLaunchpadFeeManagerProxy_;
        whitelistSize = 0;
    }

    function mint(uint256 num) external {
        require(_msgSender() == luxyLaunchpadFeeManagerProxy, "Not allowed");
        require(block.timestamp > DROP_START_TIME, "Drop hasnt started yet");
        require(num <= MAX_BATCH_MINT, "Exceeds max batch per mint");
        require(totalSupply() + num <= MAX_SUPPLY, "Exceeds drop max supply");

        if (block.timestamp < DROP_START_TIME + WHITELIST_EXPIRE_TIME) {
            require(isWhitelisted(tx.origin), "Not whitelisted");
        } else if (block.timestamp < DROP_START_TIME + LUXY_SALE_EXPIRE_TIME) {
            require(
                luxy.balanceOf(tx.origin) > MINIMUM_LUXY_AMOUNT,
                "Not elegible to Luxy sale"
            );
        }

        for (uint256 i; i < num; i++) {
            uint256 genesisRemainingToAssign = MAX_SUPPLY - totalSupply();
            uint256 randIndex = _random() % genesisRemainingToAssign;
            uint256 genesisIndex = _fillAssignOrder(
                genesisRemainingToAssign,
                randIndex
            );
            _safeMint(tx.origin, genesisIndex);
        }
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 _interfaceId)
        public
        view
        override(
            ERC721Upgradeable,
            ERC721EnumerableUpgradeable,
            IERC165Upgradeable
        )
        returns (bool)
    {
        return
            _interfaceId == type(RoyaltiesV1Luxy).interfaceId ||
            _interfaceId == type(ERC721EnumerableUpgradeable).interfaceId ||
            _interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(_interfaceId);
    }

    /**
     * @dev Internal function to set the base URI for all token IDs. It is
     * automatically added as a prefix to the value returned in {tokenURI}.
     */
    function setBaseURI(string memory baseURI_) external onlyOwner {
        baseURI = baseURI_;
    }

    /**
     * @dev Base URI for computing {tokenURI}. The resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`.
     * See {ERC721Upgradeable-_baseURI}.
     */
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /**
     * @dev See {ERC721EnumerableUpgradeable-_beforeTokenTransfer}.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function isWhitelisted(address addr) public view returns (bool) {
        return _whitelist[addr];
    }

    function addToWhitelist(address[] memory addresses) external onlyOwner {
        for (uint i = 0; i < addresses.length; i++) {
            if (!isWhitelisted(addresses[i])) {
                _whitelist[addresses[i]] = true;
                whitelistSize++;
            }
        }
    }

    function removeFromWhitelist(address[] memory addresses)
        external
        onlyOwner
    {
        for (uint i = 0; i < addresses.length; i++) {
            if (isWhitelisted(addresses[i])) {
                _whitelist[addresses[i]] = false;
                whitelistSize--;
            }
        }
    }

    function _fillAssignOrder(uint256 orderA, uint256 orderB)
        internal
        returns (uint256)
    {
        uint256 temp = orderA;
        if (_assignOrders[orderA] > 0) temp = _assignOrders[orderA];
        _assignOrders[orderA] = orderB;
        if (_assignOrders[orderB] > 0)
            _assignOrders[orderA] = _assignOrders[orderB];
        _assignOrders[orderB] = temp;
        return _assignOrders[orderA];
    }

    // pseudo-random function that's pretty robust because of syscoin's pow chainlocks
    function _random() internal view returns (uint256) {
        uint256 genesisRemainingToAssign = MAX_SUPPLY - totalSupply();
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp +
                            block.difficulty +
                            ((
                                uint256(
                                    keccak256(abi.encodePacked(block.coinbase))
                                )
                            ) / block.timestamp) +
                            block.gaslimit +
                            ((
                                uint256(
                                    keccak256(abi.encodePacked(_msgSender()))
                                )
                            ) / block.timestamp) +
                            block.number
                    )
                )
            ) / genesisRemainingToAssign;
    }

    uint256[100] private __gap;
}
