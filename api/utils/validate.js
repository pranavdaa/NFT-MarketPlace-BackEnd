const web3 = require('web3');

function isValid(address) {
    console.log(web3.utils.isAddress(address))
    return (web3.utils.isAddress(address));
}

module.exports = {
    isValid
}