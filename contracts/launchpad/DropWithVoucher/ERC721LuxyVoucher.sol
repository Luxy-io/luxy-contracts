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
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../../royalties-default/RoyaltiesV1Luxy.sol";
import "../../tokens/ERC2981-default/IERC2981.sol";
import "./Voucher.sol";

contract ERC721LuxyVoucher is Ownable, RoyaltiesV1Luxy, ERC721Enumerable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    string public baseURI;
    //Uncomment this section to enable whitelist
    // IERC20Upgradeable luxy;

    address public artist;
    address public luxyLaunchpadFeeManagerProxy;
    uint256 public constant MAX_BATCH_MINT = 7;
    uint256 public constant MAX_SUPPLY = 1000;
    uint256 public constant DROP_START_TIME = 1;
    uint256 public constant PRICE_PER_TOKEN = 1 ether;
    struct PrizeMeta {
        bool isClaimed;
        address claimer;
        uint256 time;
    }
    mapping(uint256 => PrizeMeta) public prizeInfo;
    mapping(uint256 => bool) internal prizeById;
    mapping(uint256 => uint256) private _assignOrders;
    ERC721Voucher public voucherContract;
    event Claim(PrizeMeta prizeInfo);

    constructor(
        address _voucherContract,
        address _luxyLaunchpadFeeManagerProxy,
        uint256[] memory ids
    ) ERC721("LuxyVoucherTest", "LVNFT") {
        voucherContract = ERC721Voucher(_voucherContract);
        luxyLaunchpadFeeManagerProxy = _luxyLaunchpadFeeManagerProxy;
        for (uint256 i = 0; i < ids.length; i++) {
            prizeById[ids[i]] = true;
        }
    }

    function mint(uint256 num) external {
        require(
            _msgSender() == luxyLaunchpadFeeManagerProxy,
            "ERC721LuxyVoucher: Not allowed"
        );
        require(
            block.timestamp > DROP_START_TIME,
            "ERC721LuxyVoucher: Drop hasnt started yet"
        );
        require(
            num <= MAX_BATCH_MINT,
            "ERC721LuxyVoucher: Exceeds max batch per mint"
        );
        require(
            totalSupply() + num <= MAX_SUPPLY,
            "ERC721LuxyVoucher: Exceeds drop max supply"
        );

        // Uncomment this section to enable whitelist
        // if (block.timestamp < DROP_START_TIME + WHITELIST_EXPIRE_TIME) {
        //     require(isWhitelisted(tx.origin), "Not whitelisted");
        // }

        // Uncomment this section to enable LUXY Sale
        // if (block.timestamp < DROP_START_TIME + LUXY_SALE_EXPIRE_TIME) {
        //     require(
        //         luxy.balanceOf(tx.origin) > MINIMUM_LUXY_AMOUNT,
        //         "Not elegible to Luxy sale"
        //     );
        // }

        for (uint256 i; i < num; i++) {
            uint256 genesisRemainingToAssign = MAX_SUPPLY - totalSupply();
            uint256 randIndex = _random() % genesisRemainingToAssign;
            uint256 genesisIndex = _fillAssignOrder(
                genesisRemainingToAssign,
                randIndex
            );
            uint256 tokenId = _tokenIds.current();
            _safeMint(tx.origin, tokenId); // Switch to genesisIndex for random mint, for testing is easier to use linear order
            // _safeMint(tx.origin, genesisIndex);
            _tokenIds.increment();
            if (prizeById[tokenId]) {
                voucherContract.mint(tokenId);
            }
        }
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 _interfaceId)
        public
        view
        override(ERC721Enumerable, IERC165)
        returns (bool)
    {
        return
            _interfaceId == type(RoyaltiesV1Luxy).interfaceId ||
            _interfaceId == type(ERC721Enumerable).interfaceId ||
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
        uint256 tokenId
    ) internal override(ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721) {
        if (
            prizeById[tokenId] &&
            from != address(0) &&
            !prizeInfo[tokenId].isClaimed
        ) {
            voucherContract.safeTransferFrom(from, to, tokenId);
        }
        super._afterTokenTransfer(from, to, tokenId);
    }

    function claim(uint256 tokenId) external {
        address owner = ERC721.ownerOf(tokenId);
        require(
            _msgSender() == owner,
            "ERC721LuxyVoucher: MSGSender is not the owner"
        );
        require(
            prizeInfo[tokenId].isClaimed == false,
            "ERC721LuxyVoucher: Already Claimed"
        );
        voucherContract.burn(tokenId);
        prizeInfo[tokenId].claimer = _msgSender();
        prizeInfo[tokenId].isClaimed = true;
        prizeInfo[tokenId].time = block.timestamp;
        emit Claim(prizeInfo[tokenId]);
    }

    function isClaimed(uint256 tokenId) external view returns (bool) {
        require(
            prizeById[tokenId] == true,
            "ERC721LuxyVoucher: There is no prize associated to this NFT"
        );
        if (
            prizeInfo[tokenId].isClaimed ||
            voucherContract.ownerOf(tokenId) == address(0)
        ) {
            return true;
        }
        return false;
    }

    function claimer(uint256 tokenId) external view returns (address) {
        return prizeInfo[tokenId].claimer;
    }

    function claimDate(uint256 tokenId) external view returns (uint256) {
        return prizeInfo[tokenId].time;
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

    //Uncomment this section to enable whitelist
    // function isWhitelisted(address addr) public view returns (bool) {
    //     return _whitelist[addr];
    // }

    // function addToWhitelist(address[] memory addresses) external onlyOwner {
    //     for (uint i = 0; i < addresses.length; i++) {
    //         if (!isWhitelisted(addresses[i])) {
    //             _whitelist[addresses[i]] = true;
    //         }   whitelistSize++;
    //         }
    //     }

    // function removeFromWhitelist(address[] memory addresses)
    //     external
    //     onlyOwner
    // {
    //     for (uint i = 0; i < addresses.length; i++) {
    //         if (isWhitelisted(addresses[i])) {
    //             _whitelist[addresses[i]] = false;
    //             whitelistSize--;
    //         }
    //     }
    // }
}
