let { ContractWrappers } = require("@0x/contract-wrappers");
let constants = require("../../config/constants");
let { Web3Wrapper } = require("@0x/web3-wrapper");
let utils = require("../utils/helper");

async function execute(signedOrder, takerSign) {
  const contractWrappers = new ContractWrappers(utils.providerEngine(), {
    chainId: parseInt(constants.MATIC_CHAIN_ID),
  });
  const web3Wrapper = new Web3Wrapper(utils.providerEngine());
  const [
    from1,
    from2,
    from3,
    from4,
    from5,
  ] = await web3Wrapper.getAvailableAddressesAsync();

  let tx = await contractWrappers.exchange
    .executeTransaction(takerSign, takerSign.signature)
    .awaitTransactionSuccessAsync({
      from: from4,
      gas: 8000000,
      gasPrice: 10000000000,
      value: utils.calculateProtocolFee([signedOrder]),
    });
  utils.providerEngine().stop();
  return tx.transactionHash;
}

module.exports = {
  execute,
};
