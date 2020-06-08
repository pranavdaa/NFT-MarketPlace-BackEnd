const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/**
 * Includes all the Category services that controls
 * the Category Data object from the database
 */

class CategoryService {

  async createCategory(params, file) {

    try {

      let category = await prisma.categories.create({
        data: {
          name: params.name,
          description: params.description,
          url: params.url,
          img_url: file ? file.path : "",
          categoriesaddresses: {
            create: JSON.parse(params.address)
          }
        }
      })
      return category;
    } catch (err) {
      throw err;
    }
  }

  async getCategories() {
    try {
      let categories = await prisma.categories.findMany({
        include: { categoriesaddresses: true }
      });
      return categories;
    } catch (err) {
      throw err;
    }
  }

  async categoryExists(params) {
    try {

      let categories = await prisma.categories.findOne({
        where: { name: params.name }
      });
      return categories;
    } catch (err) {
      throw err;
    }
  }

  async categoryAddressExists(params) {
    try {

      let categories = await prisma.categoriesaddresses.findOne({
        where: { address: params.address }
      });
      return categories;
    } catch (err) {
      throw err;
    }
  }

  async getCategory(params) {
    try {

      let categories = await prisma.categories.findOne({
        where: { id: parseInt(params.categoryId) }
      });
      return categories;
    } catch (err) {
      throw err;
    }
  }

  async getTokensFromCategory(params) {
    try {

      let tokens = await prisma.categories.findOne({
        select: { tokens: true },
        where: { id: parseInt(params.categoryId) },
      });
      return tokens.tokens;
    } catch (err) {
      throw err;
    }
  }

  async updateCategory(params, file) {

    try {

      let current = await this.getCategory(params);
      let category = await prisma.categories.update({
        where: { id: parseInt(params.categoryId) },
        data: {
          description: params.description ? params.description : current.description,
          url: params.url ? params.url : current.url,
          img_url: file ? file.path : current.img_url,
          categoriesaddresses: {
            create: params.address ? JSON.parse(params.address) : []
          }
        }
      })
      return category;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = CategoryService

