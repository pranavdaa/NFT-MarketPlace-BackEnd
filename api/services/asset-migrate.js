const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
let { hasNextPage } = require("../utils/helper.js");
let constants = require("../../config/constants");

/**
 * Includes all the Asset Migration services that controls
 * the asset migrate Data object from the database
 */

class AssetMigrateService {
  async createAssetMigrate(params) {
    try {
      let assetMigrate = await prisma.assetmigrate.create({
        data: {
          type: params.type,
          txhash: params.txhash,
          categories: { connect: { id: parseInt(params.category_id) } },
          users: { connect: { id: parseInt(params.userId) } },
          token_array: { set: params.token_array },
        },
      });
      return assetMigrate;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getAssetMigrations({ type, userId, limit, offset, orderBy }) {
    try {
      let where = {
        type: type,
        users_id: parseInt(userId),
      };

      let count = await prisma.assetmigrate.count({ where });
      let assetMigrations = await prisma.assetmigrate.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      });
      return {
        assetMigrations,
        limit,
        offset,
        has_next_page: hasNextPage({ limit, offset, count }),
      };
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getAssetMigration(params) {
    try {
      let assetMigration = await prisma.assetmigrate.findOne({
        where: { id: parseInt(params.assetMigrationId) },
      });
      return assetMigration;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateAssetMigration(params) {
    try {
      let current = await this.getAssetMigration(params);
      let assetMigration = await prisma.assetmigrate.update({
        where: { id: parseInt(params.assetMigrationId) },
        data: {
          status: params.status ? parseInt(params.status) : current.status,
          exit_txhash: params.exit_txhash
            ? params.exit_txhash
            : current.exit_txhash,
        },
      });
      return assetMigration;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = AssetMigrateService;
