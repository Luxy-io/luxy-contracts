// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./LibOrder.sol";
import "../lib/LibSignature.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC1271Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";


abstract contract OrderValidator is Initializable, ContextUpgradeable, EIP712Upgradeable {
    using LibSignature for bytes32;
    using AddressUpgradeable for address;
    
    bytes4 constant internal MAGICVALUE = 0x1626ba7e;
    function __OrderValidator_init(string memory name, string memory version) internal initializer{
        __OrderValidator_init_unchained(name, version);
    }
    function __OrderValidator_init_unchained(string memory name, string memory version) internal initializer {
        __EIP712_init_unchained(name, version);
        
    }

    function validate(LibOrder.Order memory order, bytes memory signature) internal view {
        if (order.salt == 0) {
            require(_msgSender() == order.maker, "maker is not tx sender");
        } else {
            if (_msgSender() != order.maker) {
                bytes32 hash = LibOrder.hash(order);
                if (_hashTypedDataV4(hash).recover(signature) != order.maker) {
                    if (order.maker.isContract()) {
                        require(
                            IERC1271Upgradeable(order.maker).isValidSignature(_hashTypedDataV4(hash), signature) == MAGICVALUE,
                            "function selector was not recognized and there's no fallback function"
                        );
                    } else {
                        revert("order signature verification error");
                    }
                }
            }
        }
    }

    uint256[50] private __gap;
}