const ethSigUtil = require('eth-sig-util');
const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];
async function domainSeparator(name, version, chainId, verifyingContract) {
  return '0x' + ethSigUtil.TypedDataUtils.hashStruct(
    'EIP712Domain',
    { name, version, chainId, verifyingContract },
    { EIP712Domain },
  ).toString('hex');
}


module.exports = {
  createTypeData: function (domainData, primaryType, message, types) {
    return {
      types: Object.assign({
        EIP712Domain: EIP712Domain,
      }, types),
      domain: domainData,
      primaryType: primaryType,
      message: message
    };
  },

  signTypedData: function (web3, from, data) {
    return new Promise(async (resolve, reject) => {
      function cb(err, result) {
        if (err) {
          return reject(err);
        }
        if (result.error) {
          return reject(result.error);
        }

        const sig = result.result;
        const sig0 = sig.substring(2);
        const r = "0x" + sig0.substring(0, 64);
        const s = "0x" + sig0.substring(64, 128);
        const v = parseInt(sig0.substring(128, 130), 16);

        resolve({
          data,
          sig,
          v, r, s
        });
      }
      if (web3.currentProvider.isMetaMask) {
        web3.currentProvider.sendAsync({
          jsonrpc: "2.0",
          method: "eth_signTypedData_v4",
          params: [from, JSON.stringify(data)],
          id: new Date().getTime()
        }, cb);
      } else {
        let send = web3.currentProvider.sendAsync;
        if (!send) send = web3.currentProvider.send;
        send.bind(web3.currentProvider)({
          jsonrpc: "2.0",
          method: "eth_signTypedData_v4",
          params: [from, data],
          id: new Date().getTime()
        }, cb);
      }
    });
  },
  domainSeparator
};