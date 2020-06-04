const web3 = require('web3');

function isValidEthereumAddress(address) {
    console.log(web3.utils.isAddress(address))
    return (web3.utils.isAddress(address));
}

module.exports = {
    isValidEthereumAddress
}
