let a = {
  contract: "0x12Ee2605AF9F3784eeA033C7DfB66E5Acd67F8d6",
  token_id:
    "0x9c01abc28bb6796cd5d9434dc2ab442f3e8413fe3588f2bb5ba9c75b1d4634a5",
  owner: "0xfd71dc9721d9ddcf0480a582927c3dcd42f3064c",
  uri:
    "https://api.sorare.com/api/v1/cards/70563756669622763706161384836703849035011620357207434610963428372900619891877",
};

let c = {};

let b = { ...a, ...c };

console.log(b);
