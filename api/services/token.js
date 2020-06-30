const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/**
 * Includes all the Token services that controls
 * the Token Data object from the database
 */

class TokenService {

  async createToken(params, file) {

    try {
      let token = await prisma.tokens.create({
        data: {
          name: params.name,
          description: params.description,
          metadata: params.metadata,
          img_url: file ? file.path : "",
          users: { connect: { id: parseInt(params.userId) } },
          token_id: params.token_id,
          categories: { connect: { id: parseInt(params.categoryId) } }
        }
      })
      return token;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async getTokens() {
    try {

      let tokens = await prisma.tokens.findMany();
      return tokens;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async tokenExists(params) {
    try {

      let tokens = await prisma.tokens.findMany({
        where: { token_id: params.token_id }
      });
      return tokens;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async getToken(params) {
    try {

      let token = await prisma.tokens.findOne({
        where: { id: parseInt(params.tokenId) }
      });
      return token;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async getTokensFromUser(params) {
    try {

      let tokens = await prisma.tokens.findMany({
        where: { owner: parseInt(params.userId) }
      });
      return tokens;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }
}

module.exports = TokenService

