const fetch = require("node-fetch");
const redis = require("redis");
const config = require("../../config/config");
const client = redis.createClient(6379);

async function getTokenData(tokenId, contractAddress, nftMetadata) {

  try {
    const redisKey = "metadata:" + contractAddress + ":" + tokenId;

    return new Promise((resolve, reject) => {
      client.get(redisKey, async (err, details) => {
        if (err) {
          client.setex(redisKey, 86400, JSON.stringify({}));
          resolve({});
        }

        if (details) {
          resolve(JSON.parse(details));
        } else {
          let metadata = {};

          if (nftMetadata) {
            metadata = {
              name: nftMetadata.name,
              description: nftMetadata.description,
              image: nftMetadata.image,
              external_link: nftMetadata.external_url,
              attributes: nftMetadata.attributes,
            };
          }

          client.setex(redisKey, 86400, JSON.stringify(metadata));
          resolve(metadata);
        }
      });
    });
  } catch (err) {
    client.setex(redisKey, 86400, JSON.stringify({}));
    resolve({});
  }
}

module.exports = {
  getTokenData,
};
