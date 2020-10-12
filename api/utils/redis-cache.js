const fetch = require("node-fetch");
const redis = require("redis");
const TokenService = require("../services/tokens");
const tokenServiceInstance = new TokenService();

const client = redis.createClient(6379);

async function getTokenData(tokenId, contract, chainId) {
  const redisKey = "metadata:" + contract + ":" + tokenId;

  return new Promise((resolve, reject) => {
    client.get(redisKey, async (err, details) => {
      if (err) {
        reject(err);
      }

      if (details) {
        resolve(JSON.parse(details));
      } else {
        let token = await tokenServiceInstance.getTokenDetail({
          tokenId,
          contractAddress: contract,
          chainId,
        });

        if (!token) {
          client.setex(redisKey, 86400, JSON.stringify({}));
          resolve({});
        } else {
          if (token.uri === "") {
            client.setex(redisKey, 86400, JSON.stringify({}));
            resolve({});
          }

          const id= token.token_id;
          const cadd= token.contract === "0x14cAf5c9DdC44FC3AcD03A6F28DCE60f1Df694Dd"?"0xf5b0a3efb8e8e4c201e2a935f110eaaf3ffecb8d":"0x629a673a8242c2ac4b7b8c5d8735fbeac21a6205";
          let openSeaApiURL="https://api.opensea.io/api/v1/assets?&token_ids="+id+"&asset_contract_address="+cadd;
          fetch(openSeaApiURL)
            .then((response) => {
              return response.json();
            })
            .then((details) => {
              let metadata = {
                name: details["assets"][0].name,
                description: details["assets"][0].description,
                image: details["assets"][0].image_url,
                attributes:details["assets"][0].traits
              };
              client.setex(redisKey, 86400, JSON.stringify(metadata));
              resolve(metadata);
            })
            .catch((err) => {
              reject(err);
            });
        }
      }
    });
  });
}

module.exports = {
  getTokenData,
};
