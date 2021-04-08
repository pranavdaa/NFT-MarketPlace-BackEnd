let config = require('./config')

module.exports = {
  PAGINATION_MAX_LIMIT: 50,
  PAGINATION_DEFAULT_LIMIT: 20,
  PAGINATION_DEFAULT_OFFSET: 0,
  JWT_EXPIRY: "24h",
  MATIC_CHAIN_ID: config.MATIC_CHAIN_ID,
  ETHEREUM_CHAIN_ID: config.ETHEREUM_CHAIN_ID,
  RESPONSE_STATUS: {
    SUCCESS: "success",
    FAILURE: "failure",
    ERROR: "error",
    AUTH_ERROR: "auth_error",
    NOT_FOUND: "not found",
    ORDER_EXPIRED: "order expired"
  },
  RESPONSE_STATUS_CODES: {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 204,
    INTERNAL_SERVER_ERROR: 500,
    ORDER_EXPIRED: 202
  },
  SORT_DIRECTION: {
    ASC: "asc",
    DESC: "desc",
  },
  MESSAGES: {
    INTERNAL_SERVER_ERROR: "Internal Server error. Please try again!",
    INVALID_CREDENTIALS: "Invalid credentials",
    LOGIN_SUCCESS: "Login Success",
    UNAUTHORIZED: "Unauthorized access",
    INPUT_VALIDATION_ERROR: "Input Validation Error",
    INVALID_REQUEST: "Invalid Request"
  },
  ORDER_TYPES: {
    FIXED: "FIXED",
    NEGOTIATION: "NEGOTIATION",
    AUCTION: "AUCTION",
  },
  ZERO_EX: {
    GAS_PRICE: 10000000000,
    BASE_DERIVATION_PATH: `44'/60'/0'/0`,
    RPC_URL: config.MATIC_RPC,
  },
  PRICE_API: "https://api.coingecko.com/api/v3/simple/price?ids=",
  ASSET_TRANSFER: {
    DEPOSIT: "DEPOSIT",
    WITHDRAW: "WITHDRAW",
  },
  TOKEN_TYPES: {
    ERC1155: "ERC1155",
    ERC721: "ERC721"
  }
};
