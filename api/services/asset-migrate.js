const prisma = require("../../prisma")
let { hasNextPage } = require("../utils/request-utils");
let constants = require("../../config/constants");
const categoryService = require("../services/category");
let categoryServiceInstance = new categoryService();

/**
 * Includes all the Asset Migration services that controls
 * the asset migrate Data object from the database
 */

class AssetMigrateService {
  async createAssetMigrate(params) {
    try {
      let category = await categoryServiceInstance.getCategory({
        categoryId: params.category_id,
      });

      console.log(category);

      let message;

      if (params.type === "DEPOSIT") {
        message =
          "You initiated a deposit of " +
          params.token_array.length +
          " " +
          category.name +
          " tokens";
      }
      if (params.type === "WITHDRAW") {
        message =
          "You initiated a withdraw of " +
          params.token_array.length +
          " " +
          category.name +
          " tokens";
      }
      let assetMigrate = await prisma.assetmigrate.create({
        data: {
          type: params.type,
          txhash: params.txhash,
          categories: { connect: { id: parseInt(params.category_id) } },
          users: { connect: { id: parseInt(params.userId) } },
          token_array: { set: params.token_array },
          block_number: params.block_number,
          message,
        },
      });
      return assetMigrate;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getAssetMigrations({ status, type, userId, limit, offset, orderBy }) {
    try {
      let where = {
        type: { in: JSON.parse(type) },
        users_id: parseInt(userId),
        status: { in: JSON.parse(status) },
      };

      let count = await prisma.assetmigrate.count({ where });
      let assetMigrations = await prisma.assetmigrate.findMany({
        where,
        include: {
          categories: { select: { img_url: true } },
        },
        orderBy: { created: constants.SORT_DIRECTION.DESC },
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

      let category = await categoryServiceInstance.getCategory({
        categoryId: current.categories_id,
      });

      let message;

      if (current.type === "WITHDRAW") {
        message =
          "You finished a withdraw of " +
          current.token_array.length +
          " " +
          category.name +
          " tokens";
      }
      let assetMigration = await prisma.assetmigrate.update({
        where: { id: parseInt(params.assetMigrationId) },
        data: {
          message,
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
