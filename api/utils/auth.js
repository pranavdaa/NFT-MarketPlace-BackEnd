let signUtil = require("eth-sig-util");
var ethUtil = require("ethereumjs-util");
let config = require('../../config/config')

function getSignTypedData({ owner }) {
  return {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "host", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Test: [{ name: "owner", type: "string" }],
    },
    domain: {
      name: "Opensea on Matic",
      host: "",
      version: "1",
      verifyingContract: "0x0",
      chainId: "",
    },
    primaryType: "Test",
    message: { owner },
  };
}

function isValidSignature({ owner, signature }) {
  const signedData = getSignTypedData({ owner });
  let recovered;
  try {
    recovered = signUtil.recoverTypedSignature({
      data: signedData,
      sig: signature,
    });
  } catch (e) {}

  if (
    !recovered ||
    ethUtil.toChecksumAddress(recovered) !== ethUtil.toChecksumAddress(owner)
  ) {
    return false;
  }
  return true;
}

module.exports = {
  isValidSignature,
};
