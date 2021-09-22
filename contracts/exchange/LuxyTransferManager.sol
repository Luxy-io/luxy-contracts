// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "./assets/LibAsset.sol";
import "../tokens/ERC721/ERC721Luxy.sol";
import "../tokens/ERC1155/ERC1155Luxy.sol";
import "./LibFill.sol";
import "./lib/LibFeeSide.sol";
import "./interfaces/ITransferManager.sol";
import "./interfaces/ITransferExecutor.sol";
import "./orderControl/LibOrderData.sol";
import "./lib/LibBP.sol";
import "./orderControl/LibOrderDataV1.sol";
import "../Royalties-registry/IRoyaltiesProvider.sol";
import 'hardhat/console.sol';


abstract contract LuxyTransferManager is OwnableUpgradeable, ITransferManager {
    using LibBP for uint;
    using SafeMathUpgradeable for uint;
    uint public protocolFee;
    IRoyaltiesProvider public royaltiesRegistry;
    address public defaultFeeReceiver;
    uint public maxPercentRoyalties;
    mapping(address => address) public feeReceivers;
    mapping(address => uint) public protocolFeeMake;
    mapping(address => uint) public protocolFeeTake;

    function __LuxyTransferManager_init_unchained(
        uint newProtocolFee,
        address newDefaultFeeReceiver,
        IRoyaltiesProvider newRoyaltiesProvider
    ) internal initializer {
        protocolFee = newProtocolFee;
        defaultFeeReceiver = newDefaultFeeReceiver;
        royaltiesRegistry = newRoyaltiesProvider;
        maxPercentRoyalties = 98000;
    }

     function setRoyaltiesRegistry(IRoyaltiesProvider newRoyaltiesRegistry) external onlyOwner {
        royaltiesRegistry = newRoyaltiesRegistry;
    }

      function setProtocolFee(uint newProtocolFee) external onlyOwner {
        protocolFee = newProtocolFee;
    }

    function setMaxPercentRoyalties(uint newPercentage) external onlyOwner {
        maxPercentRoyalties = newPercentage;
    }

    function setDefaultFeeReceiver(address payable newDefaultFeeReceiver) external onlyOwner {
        defaultFeeReceiver = newDefaultFeeReceiver;
    }

    function setSpecialProtocolFee(address token,uint newProtocolFeeMake,uint newProtocolFeeTake) external onlyOwner {
        protocolFeeMake[token] = newProtocolFeeMake;
        protocolFeeTake[token] = newProtocolFeeTake;
    }

     function setMakeProtocolFee(address token,uint newProtocolFeeMake) external onlyOwner {
        protocolFeeMake[token] = newProtocolFeeMake;
    }

     function setTakeProtocolFee(address token,uint newProtocolFeeTake) external onlyOwner {
        protocolFeeTake[token] = newProtocolFeeTake;
    }

    function setFeeReceiver(address token, address wallet) external onlyOwner {
        feeReceivers[token] = wallet;
    }

    function getFeeReceiver(address token) internal view returns (address) {
        address wallet = feeReceivers[token];
        if (wallet != address(0)) {
            return wallet;
        }
        return defaultFeeReceiver;
    }

     function doTransfers(
        LibAsset.AssetType memory makeMatch,
        LibAsset.AssetType memory takeMatch,
        LibFill.FillResult memory fill,
        LibOrder.Order memory leftOrder,
        LibOrder.Order memory rightOrder
    ) override internal returns (uint totalMakeValue, uint totalTakeValue) {
        LibFeeSide.FeeSide feeSide = LibFeeSide.getFeeSide(makeMatch.assetClass, takeMatch.assetClass);
        totalMakeValue = fill.makeValue;
        totalTakeValue = fill.takeValue;
        LibOrderDataV1.DataV1 memory leftOrderData = LibOrderData.parse(leftOrder);
        LibOrderDataV1.DataV1 memory rightOrderData = LibOrderData.parse(rightOrder);
        if (feeSide == LibFeeSide.FeeSide.MAKE) {
            console.log('MAKE SIDE');
            totalMakeValue = doTransfersWithFees(fill.makeValue, leftOrder.maker, rightOrderData, makeMatch, takeMatch,  TO_TAKER);
            transferPayouts(takeMatch, fill.takeValue, rightOrder.maker, leftOrderData.payouts, TO_MAKER);
        } else if (feeSide == LibFeeSide.FeeSide.TAKE) {
            console.log('TAKE SIDE');
            totalTakeValue = doTransfersWithFees(fill.takeValue, rightOrder.maker, leftOrderData, takeMatch, makeMatch, TO_MAKER);
            transferPayouts(makeMatch, fill.makeValue, leftOrder.maker, rightOrderData.payouts, TO_TAKER);
        } else {
            console.log('NONE SIDE');
            transferPayouts(makeMatch, fill.makeValue, leftOrder.maker, rightOrderData.payouts, TO_TAKER);
            transferPayouts(takeMatch, fill.takeValue, rightOrder.maker, leftOrderData.payouts, TO_MAKER);
        }

        
    }
    function doTransfersWithFees(
        uint amount,
        address from,
        LibOrderDataV1.DataV1 memory dataNft,
        LibAsset.AssetType memory matchCalculate,
        LibAsset.AssetType memory matchNft,
        bytes4 transferDirection
    ) internal returns (uint totalAmount) {
        uint[] memory specialFee;
        (totalAmount, specialFee) = calculateTotalAmount(amount, protocolFee, matchNft,transferDirection);
        uint rest = transferProtocolFee(totalAmount,specialFee, amount, from, matchCalculate, transferDirection);
        rest = transferRoyalties(matchCalculate, matchNft, rest, amount, from, transferDirection);
        transferPayouts(matchCalculate, rest, from, dataNft.payouts, transferDirection);
    }

    function transferProtocolFee(
        uint totalAmount,
        uint[] memory specialFee,
        uint amount,
        address from,
        LibAsset.AssetType memory matchCalculate,
        bytes4 transferDirection
    ) internal returns (uint) {
        uint rest;
        uint fee;
        console.log('Checking Total Amount');
        console.log(totalAmount);
        console.log('Checking Amount');
        console.log(amount);
        console.log('Checking PF');
        console.log(protocolFee.mul(2));
        if(specialFee.length == 0){
            console.log('should be here');
            (rest, fee) = subFeeInBp(totalAmount, amount, protocolFee.mul(2));
        } else {
            console.log('should not be here');
            (rest, fee) = subFeeInBp(totalAmount, amount, specialFee[0].add(specialFee[1]));
        }
        console.log('Protocol FEE');
        console.log(fee);
        console.log(rest);
        if (fee > 0) {
            address tokenAddress = address(0);
            if (matchCalculate.assetClass == LibAsset.ERC20_ASSET_CLASS) {
                tokenAddress = abi.decode(matchCalculate.data, (address));
            } else  if (matchCalculate.assetClass == LibAsset.ERC1155_ASSET_CLASS) {
                uint tokenId;
                (tokenAddress, tokenId) = abi.decode(matchCalculate.data, (address, uint));
            }
            console.log('Transfering Protocol fee');
            transfer(LibAsset.Asset(matchCalculate, fee), from, getFeeReceiver(tokenAddress), transferDirection, PROTOCOL);
            console.log('Done');
        }
        return rest;
    }

    function transferRoyalties(
        LibAsset.AssetType memory matchCalculate,
        LibAsset.AssetType memory matchNft,
        uint rest,
        uint amount,
        address from,
        bytes4 transferDirection
    ) internal returns (uint) {
        console.log('Getting royalties');
        LibPart.Part[] memory fees = getRoyaltiesByAssetType(matchNft);
        console.log('Returning royalties');
        for(uint i = 0; i < fees.length; i++){
            console.log('fees:');
            console.log(fees[i].value);
            console.log(fees[i].account);
        }

        (uint result, uint totalRoyalties) = transferFees(matchCalculate, rest, amount, fees, from, transferDirection, ROYALTY);
        require(totalRoyalties <= maxPercentRoyalties, "Royalties are too high (>98%)");
        return result;
    }

    function getRoyaltiesByAssetType(LibAsset.AssetType memory matchNft) internal returns (LibPart.Part[] memory) {
        console.log('Getting royalties');
        console.log(uint32(matchNft.assetClass));
        if (matchNft.assetClass == LibAsset.ERC1155_ASSET_CLASS || matchNft.assetClass == LibAsset.ERC721_ASSET_CLASS) {
            (address token, uint tokenId) = abi.decode(matchNft.data, (address, uint));
            console.log('Token:');
            console.log(token);
            console.log(tokenId);
            return royaltiesRegistry.getRoyalties(token, tokenId);
        }
        LibPart.Part[] memory empty;
        return empty;
    }

    function transferFees(
        LibAsset.AssetType memory matchCalculate,
        uint rest,
        uint amount,
        LibPart.Part[] memory fees,
        address from,
        bytes4 transferDirection,
        bytes4 transferType
    ) internal returns (uint restValue, uint totalFees) {
        totalFees = 0;
        restValue = rest;
        for (uint256 i = 0; i < fees.length; i++) {
            totalFees = totalFees.add(fees[i].value);
            (uint newRestValue, uint feeValue) = subFeeInBp(restValue, amount,  fees[i].value);
            restValue = newRestValue;
            if (feeValue > 0) {
                transfer(LibAsset.Asset(matchCalculate, feeValue), from,  fees[i].account, transferDirection, transferType);
            }
        }
    }

    function transferPayouts(
        LibAsset.AssetType memory matchCalculate,
        uint amount,
        address from,
        LibPart.Part[] memory payouts,
        bytes4 transferDirection
    ) internal {
        uint sumBps = 0;
        uint restValue = amount;
        for (uint256 i = 0; i < payouts.length - 1; i++) {
            uint currentAmount = amount.bp(payouts[i].value);
            sumBps = sumBps.add(payouts[i].value);
            if (currentAmount > 0) {
                restValue = restValue.sub(currentAmount);
                transfer(LibAsset.Asset(matchCalculate, currentAmount), from, payouts[i].account, transferDirection, PAYOUT);
            }
        }
        LibPart.Part memory lastPayout = payouts[payouts.length - 1];
        sumBps = sumBps.add(lastPayout.value);
        require(sumBps == 10000, "Sum payouts Bps not equal 100%");
        if (restValue > 0) {
            transfer(LibAsset.Asset(matchCalculate, restValue), from, lastPayout.account, transferDirection, PAYOUT);
        }
    }

    function calculateTotalAmount(
        uint amount,
        uint feeOnTopBp,
        LibAsset.AssetType memory matchNft,
        bytes4 transferDirection
    ) internal view returns (uint total, uint[] memory specialFee){
        (address token) = abi.decode(matchNft.data, (address));
        if(transferDirection == TO_MAKER){
            if(protocolFeeMake[token] != 0){
                console.log('not here');
                console.log(token);
                console.log(protocolFeeMake[token]);
                total = amount.add(amount.bp(protocolFeeMake[token]));
                specialFee[0] = amount.bp(protocolFeeMake[token]);
                specialFee[1] = amount.bp(protocolFeeTake[token]);
                return (total, specialFee);
            }
        
        }
        else if(transferDirection == TO_TAKER){
              if(protocolFeeTake[token] != 0){
                console.log('not here');
                console.log(token);
                console.log(protocolFeeMake[token]);
                total = amount.add(amount.bp(protocolFeeTake[token]));
                specialFee[0] = amount.bp(protocolFeeMake[token]);
                specialFee[1] = amount.bp(protocolFeeTake[token]);
                return (total, specialFee);
            }
        }
        total = amount.add(amount.bp(feeOnTopBp));

    }

    function subFeeInBp(uint value, uint total, uint feeInBp) internal pure returns (uint newValue, uint realFee) {
        return subFee(value, total.bp(feeInBp));
    }

    function subFee(uint value, uint fee) internal pure returns (uint newValue, uint realFee) {
        if (value > fee) {
            newValue = value.sub(fee);
            realFee = fee;
        } else {
            newValue = 0;
            realFee = value;
        }
    }


    uint256[50] private __gap;


}