const EIP712 = require("./EIP712");
const ethSigUtil = require('eth-sig-util');
function AssetType(assetClass, data) {
	return { assetClass, data }
}

function Asset(assetClass, assetData, value) {
	return { assetType: AssetType(assetClass, assetData), value };
}

function Order(maker, makeAsset, taker, takeAsset, salt, start, end, dataType, data) {
	return { maker, makeAsset, taker, takeAsset, salt, start, end, dataType, data };
}

const Types = {
	AssetType: [
		{ name: 'assetClass', type: 'bytes4' },
		{ name: 'data', type: 'bytes' }
	],
	Asset: [
		{ name: 'assetType', type: 'AssetType' },
		{ name: 'value', type: 'uint256' }
	],
	Order: [
		{ name: 'maker', type: 'address' },
		{ name: 'makeAsset', type: 'Asset' },
		{ name: 'taker', type: 'address' },
		{ name: 'takeAsset', type: 'Asset' },
		{ name: 'salt', type: 'uint256' },
		{ name: 'start', type: 'uint256' },
		{ name: 'end', type: 'uint256' },
		{ name: 'dataType', type: 'bytes4' },
		{ name: 'data', type: 'bytes' },
	]
};

async function sign(name, version, order, account, verifyingContract) {
	const chainId = Number(await web3.eth.getChainId());
	const data = EIP712.createTypeData({
		name: name,
		version: version,
		chainId: chainId,
		verifyingContract: verifyingContract
	}, 'Order', order, Types);
	return (await EIP712.signTypedData(web3, account, data)).sig;
}
async function signWithPrivateKey(name, version, order,from, verifyingContract, privateKey) {

	const chainId = Number(await web3.eth.getChainId());
	const typedData = EIP712.createTypeData({
		name: name,
		version: version,
		chainId: chainId.toString(),
		verifyingContract: verifyingContract
	}, 'Order', order, Types);
	const privKey = Buffer.from(privateKey.slice(2), 'hex');
      const response = ethSigUtil.signTypedMessage(privKey, {data: typedData}, 'V4');

    return response;

  }

async function domainSeparator(name, version, verifyingContract) {
	const chainId = Number(await web3.eth.getChainId());
	const data = EIP712.domainSeparator(name, version, chainId, verifyingContract);
	return data;
}

module.exports = { AssetType, Asset, Order, sign, domainSeparator, signWithPrivateKey }