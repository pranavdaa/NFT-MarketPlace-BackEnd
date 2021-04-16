const e = require("express");
const orderService = require("../api/services/order");
let orderServiceInstance = new orderService();
const TokenService = require("../api/services/tokens");
const tokenServiceInstance = new TokenService();
let helper = require("../api/utils/helper");

async function tokenMigrate() {
  let orderList = await orderServiceInstance.getFullOrderList();

  for (order of orderList) {
    try {
      let token = await tokenServiceInstance.getToken({
        token_id: order.tokens_id,
        category_id: order.categories.id,
      });

      let metadata;
      if (order.categories.tokenURI) {
        metadata = await helper.fetchMetadataFromTokenURI(
          order.categories.tokenURI + order.tokens_id
        );
      } else {
        let tokenDetails = await helper.fetchMetadata(
          order.categories.categoriesaddresses[0].address,
          order.tokens_id
        );

        if (tokenDetails) {
          if (!tokenDetails.metadata) {
            if (tokenDetails.token_uri) {
              metadata = await helper.fetchMetadataFromTokenURI(
                tokenDetails.token_uri
              );
            }
          } else {
            metadata = JSON.parse(tokenDetails.metadata);
          }
        }
      }

      if (!token) {
        token = await tokenServiceInstance.createToken({
          token_id: order.tokens_id,
          category_id: order.categories.id,
          name: metadata ? metadata.name : "",
          description: metadata ? metadata.description : "",
          image_url: metadata ? metadata.image : "",
          external_url: metadata ? metadata.external_url : "",
          attributes: metadata ? JSON.stringify(metadata.attributes) : "",
        });
        console.log("created");
      } else {
        token = await tokenServiceInstance.updateToken({
          token_id: order.tokens_id,
          category_id: order.categories.id,
          name: metadata ? metadata.name : "",
          description: metadata ? metadata.description : "",
          image_url: metadata ? metadata.image : "",
          external_url: metadata ? metadata.external_url : "",
          attributes: metadata ? JSON.stringify(metadata.attributes) : "",
        });
        console.log("updated");
      }
      console.log(order.id);
    } catch (err) {
      console.log(err);
      console.log("error in ", order.id);
    }
  }
}

tokenMigrate()
  .then(() => {
    console.log("success");
  })
  .catch((err) => {
    console.log(err);
  });
