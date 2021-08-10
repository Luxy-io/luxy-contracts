//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "./ERC1155BaseUri.sol";
import "../../RoyaltiesV1Luxy.sol";

contract ERC1155Luxy is
    OwnableUpgradeable,
    ERC1155BurnableUpgradeable,
    ERC1155BaseURI,
    RoyaltiesV1Luxy
{
    string public name;
    string public symbol;
    mapping(address => bool) private defaultApprovals;
    event DefaultApproval(address indexed operator, bool hasApproval);

    function __ERC1155Luxy_init_unchained(
        string memory _name,
        string memory _symbol
    ) internal initializer {
        name = _name;
        symbol = _symbol;
        __Ownable_init_unchained();
        __ERC1155Burnable_init_unchained();
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
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public {
        _mint(account, id, amount, data);
    }

    function updateAccount(
        uint256 _id,
        address _from,
        address _to
    ) external {
        require(_msgSender() == _from, "not allowed");
        super._updateAccount(_id, _from, _to);
    }
}
