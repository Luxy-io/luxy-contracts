//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract ERC721Voucher is ERC721Enumerable, Ownable  {
    ERC721 public parentContract;

    constructor() ERC721("VoucherTest", "VNFT") {}

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    )  internal override {
        require(
            _msgSender() == address(parentContract),
            "Voucher: You only can transfer the voucher along with the P24 NFT"
        );
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function mint(uint256 id, address minter) external {
        require(
            _msgSender() == address(parentContract),
            "Voucher: Not allowed "
        );

        // for (uint256 i; i < num; i++) {
        //     uint256 tokenId = _tokenIds.current();
        //     _safeMint(minter, tokenId);
        //     _tokenIds.increment();
        // }
        _safeMint(minter, id);
    }

    function burn(uint256 id) public {
        require(
            _msgSender() == address(parentContract),
            "Voucher: Not allowed"
        );
        super._burn(id);
    }

    function setParent(address _parentContract) public onlyOwner {
        parentContract = ERC721(_parentContract);
    }

    function isApprovedForAll(address owner, address operator)
        public
        view
        override
        returns (bool)
    {
        if (_msgSender() == address(parentContract)) {
            return true;
        }
        return false;
    }
}