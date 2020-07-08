let signUtil = require("eth-sig-util");
var ethUtil = require("ethereumjs-util");

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
      name: "Ether Mail",
      host: "https://rpc-mumbai.matic.today",
      version: "1",
      verifyingContract: "0x0",
      chainId: 80001,
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
