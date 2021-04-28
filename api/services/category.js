const prisma = require("../../prisma");
let { hasNextPage } = require("../utils/request-utils");
let constants = require("../../config/constants");

/**
 * Includes all the Category services that controls
 * the Category Data object from the database
 */

class CategoryService {
  async createCategory(params, file) {
    let { name, description, url, address, type, tokenURI } = params;
    try {
      let category = await prisma.categories.create({
        data: {
          name: name,
          description: description,
          url: url,
          img_url: file ? file.path : "",
          categoriesaddresses: {
            create: JSON.parse(address),
          },
          type: type,
          tokenURI: tokenURI,
          name_lowercase: name.toLowerCase()
        },
      });
      return category;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getCategories({ limit, offset, orderBy }) {
    try {
      let where = {
        active: true,
      };

      let count = await prisma.categories.count({ where });
      let categories = await prisma.categories.findMany({
        where,
        orderBy,
        include: {
          categoriesaddresses: true,
          orders: { select: { id: true }, where: { status: 0 } },
        },
      });
      return {
        categories,
        limit,
        offset,
        has_next_page: hasNextPage({ limit, offset, count }),
      };
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getCategoryByAddress({ categoryAddress, chainId }) {
    try {
      let category = await prisma.categoriesaddresses.findOne({
        where: {
          address_chain_id: {
            address: categoryAddress,
            chain_id: chainId,
          },
        },
      });

      return category;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async categoryExists(params) {
    try {
      let { name } = params;
      let categories = await prisma.categories.findOne({
        where: { name_lowercase: name.toLowerCase() },
      });
      return categories;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async categoryAddressExists(params) {
    let { address } = params;
    try {
      let categories = await prisma.categoriesaddresses.findOne({
<<<<<<< HEAD
        where: {
          address_chain_id: {
            address: params.address,
            chain_id: params.chain_id,
          },
        },
=======
        where: { address: address },
>>>>>>> 2dc8baa00484ecb733ec21fb86e03d091ea6b4fb
      });

      categories;
      return categories;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getCategory(params) {
    try {
      let { categoryId } = params;
      let categories = await prisma.categories.findOne({
        where: { id: parseInt(categoryId) },
      });
      return categories;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateCategory(params, file) {
    try {
      let current = await this.getCategory(params);
      let { description: current_description, url: current_url, img_url: current_img_url, type: current_type } = current;
      let { description: params_description, address: params_address, type: params_type, url: params_url } = params;
      let category = await prisma.categories.update({
        where: { id: parseInt(params.categoryId) },
        data: {
          description: params_description
            ? params_description
            : current_description,
          url: params_url ? params_url : current_url,
          img_url: file ? file.path : current_img_url,
          categoriesaddresses: {
            create: params_address ? JSON.parse(params_address) : [],
          },
          type: params_type ? params_type : current_type,
        },
      });
      return category;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = CategoryService;
