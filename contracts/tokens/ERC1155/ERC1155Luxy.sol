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
       _`░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░φ,,
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
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "./ERC1155BaseUri.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "../../RoyaltiesV1Luxy.sol";
import "../ERC1271/ERC1271.sol";

contract ERC1155Luxy is
    OwnableUpgradeable,
    ERC1155BurnableUpgradeable,
    ERC1155BaseURI,
    RoyaltiesV1Luxy,
    ERC1271Upgradeable
{
    string public name;
    string public symbol;
    mapping(address => bool) private defaultApprovals;
    event DefaultApproval(address indexed operator, bool hasApproval);
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _tokenIds;
    bytes32 public constant TRANSFER_TYPEHASH = keccak256("Luxy1155(uint256 tokenId,string tokenURI)");



    function __ERC1155Luxy_init(
        string memory _name,
        string memory _symbol,
        string memory _baseURI
    ) public initializer {
        name = _name;
        symbol = _symbol;
        __Ownable_init_unchained();
        __ERC1155Burnable_init_unchained();
        __Context_init_unchained();
        __ERC165_init_unchained();
        __RoyaltiesV1Luxy_init_unchained();
        _setBaseURI(_baseURI);
        __EIP712_init_unchained('Luxy1155','1');
        __ERC1271Upgradeable_init_unchained();
    }
    function __ERC1155Luxy_init_unchained() internal initializer {
    }

    function _setDefaultApproval(address operator, bool hasApproval) internal {
        defaultApprovals[operator] = hasApproval;
        emit DefaultApproval(operator, hasApproval);
    }

    function isApprovedForAll(address _owner, address _operator)
        public
        view
        override
        returns (bool)
    {
        return
            defaultApprovals[_operator] ||
            super.isApprovedForAll(_owner, _operator);
    }

    function setDefaultApproval(address operator, bool hasApproval)
        external
        onlyOwner
    {
        _setDefaultApproval(operator, hasApproval);
    }

    function uri(uint256 id)
        public
        view
        virtual
        override(ERC1155BaseURI, ERC1155Upgradeable)
        returns (string memory)
    {
        return _tokenURI(id);
    }

    function mint(
        address account,
        uint256 amount,
        Royalties[] memory royalties,
        string memory tokenURI
    ) public {
        uint256 id = _tokenIds.current();
        _mint(account, id, amount, '');
        _setRoyalties(id, royalties);
        _setTokenURI(id, tokenURI);
        _tokenIds.increment();
    }

    function transferFrom(
        uint256 id,
        address from,
        address to,
        uint256 amount
    )   public  {
        uint balance = balanceOf(from, id);
        if (balance != 0) {
            require(balance >= amount, "Insufficient balance");
            super.safeTransferFrom(from, to, id, amount, "");
        }

    }

    function updateAccount(
        uint256 _id,
        address _from,
        address _to
    ) external {
        require(_msgSender() == _from, "not allowed");
        super._updateAccount(_id, _from, _to);
    }
      /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 _interfaceId)
        public
        view
        override(ERC1155Upgradeable, ERC1155BaseURI)
        returns (bool)
    {
        return
            _interfaceId == type(RoyaltiesV1Luxy).interfaceId ||
            _interfaceId == type(ERC1155BaseURI).interfaceId ||
            _interfaceId == type(ERC1155BurnableUpgradeable).interfaceId ||
            _interfaceId == type(OwnableUpgradeable).interfaceId ||
            super.supportsInterface(_interfaceId);
    }

    function validate(address account, bytes32 hash, bytes memory signature) external view {
        validate1271(account, hash, signature);
    }

    function hash1155(address account,uint256 tokenId, uint256 amount) external view returns (bytes32){
        require(amount > 0, "amount incorrect");
        uint256 ownerAmount = balanceOf(account, tokenId);
        string memory tokenURI = uri(tokenId);
        require(ownerAmount >= amount, "Insufficient balance");
        // Royalties[] memory royalties = getRoyalties(tokenId);
        // bytes32[] memory royaltiesBytes = new bytes32[](royalties.length);
        // for (uint i = 0; i < royalties.length; i++) {
        //     royaltiesBytes[i] = _royaltiesHash(royalties[i]);
        // }
        return keccak256(abi.encode(
            TRANSFER_TYPEHASH,
            tokenId,
            keccak256(abi.encode(bytes(tokenURI)))
             ));
    }

    uint256[100] private __gap;
}