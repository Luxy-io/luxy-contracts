const { createTypeData, signTypedData } = require("../EIP712");

const Types = {
	Luxy1155: [
		{name: 'tokenId', type: 'uint256'},
		{name: 'tokenURI', type: 'string'}
	]
};

async function sign(account, tokenId, tokenURI, royalties, verifyingContract) {
	const chainId = Number(await web3.eth.getChainId());
	const data = createTypeData({
		name: "Luxy1155",
		chainId,
		version: "1",
		verifyingContract
	}, 'Luxy1155', { tokenId, tokenURI }, Types);
	return (await signTypedData(web3, account, data)).sig;
}

module.exports = { sign }