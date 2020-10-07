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
          fetch(token.uri)
            .then((response) => {
              return response.json();
            })
            .then((details) => {
              let metadata = {
                name: details.name,
                description: details.description,
                image: details.image,
                attributes:details.attributes
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
