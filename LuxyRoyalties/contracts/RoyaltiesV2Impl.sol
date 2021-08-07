pragma solidity ^0.8.0;
import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165StorageUpgradeable.sol";
import "hardhat/console.sol";

contract RoyaltiesV2Impl is ERC165StorageUpgradeable {

      struct Royalties {
        address payable account;
        uint96 value;
    }
    /*
     * bytes4(keccak256('getRoyalties(uint256)')) == 0xcad96cca
     */
     bytes4 constant INTERFACE_ID_ROYALTIES = 0xbb3bafd6;
     event RoyaltiesSet(uint256 tokenId, Royalties[] royalties);
     event RoyaltieAccountUpdate(uint256 tokenId,uint index,address previousAccount,address newAccount);
     mapping (uint256 => Royalties[]) internal royalties;

    function __RoyaltiesV2Impl_init_unchained() internal initializer {
        _registerInterface(INTERFACE_ID_ROYALTIES);
        
    }
    function SetInterfaceId() external returns (bytes4){
            return bytes4(keccak256('getRaribleV2Royalties(uint256)'));
    }

    function __RoyaltiesV2Impl_init() public initializer{
        __RoyaltiesV2Impl_init_unchained();
    }
    
    function getRoyalties(uint256 id) external view returns (Royalties[] memory) {
        return royalties[id];
    }


    function _setRoyalties(uint256 _id, Royalties[] memory _royalties) internal {
        for (uint i = 0; i < _royalties.length; i++) {
            require(_royalties[i].account != address(0x0), "Recipient should be present");
            require(_royalties[i].value != 0, "Royalty value should be positive");
            royalties[_id].push(_royalties[i]);
        }
        emit RoyaltiesSet(_id, _royalties);
    }
    function _updateAccount(uint256 _id, address _from, address _to) internal {
        uint length = royalties[_id].length;
        address previousAccount = address(0x0);
        uint index = 0;
        for(uint i = 0; i < length; i++) {
            if (royalties[_id][i].account == _from) {
                previousAccount = royalties[_id][i].account;
                index = i;    
                royalties[_id][i].account = payable(address(uint160(_to)));
            }
        }
        require(previousAccount != address(0x0), "Account not found, are you using the correct wallet?");
        emit RoyaltieAccountUpdate(_id, index, previousAccount, royalties[_id][index].account );
    }
} 