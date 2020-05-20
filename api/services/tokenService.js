const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/**
 * Includes all the Token services that controls
 * the Token Data object from the database
 */

class TokenService {

  async createToken(params, path) {

    try {
      let token = await prisma.tokens.create({
        data: {
          name: params.name,
          description: params.description,
          metadata: params.metadata,
          img_url: path,
          users: { connect: { id: parseInt(params.owner) } },
          token_id: params.token_id,
          categories: { connect: { id: parseInt(params.category) } }
        }
      })
      return token;
    } catch (err) {
      throw err;
    }
  }

  async getTokens() {
    try {

      let tokens = await prisma.tokens.findMany();
      return tokens;
    } catch (err) {
      throw err;
    }
  }

  async tokenExists(params) {
    try {

      let tokens = await prisma.tokens.findMany({
        where: { token_id: params.token_id }
      });
      return tokens;
    } catch (err) {
      throw err;
    }
  }

  async getToken(params) {
    try {

      let token = await prisma.tokens.findOne({
        where: { id: parseInt(params.id) }
      });
      return token;
    } catch (err) {
      throw err;
    }
  }

  async getTokensFromUser(params) {
    try {

      let tokens = await prisma.tokens.findMany({
        where: { owner: parseInt(params.id) }
      });
      return tokens;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = TokenService

