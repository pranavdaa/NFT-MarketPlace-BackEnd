let config = require("../../config/config");
const adminService = require("../services/admin");
const bcrypt = require("bcryptjs");
let adminServiceInstance = new adminService();
var genSalt = bcrypt.genSaltSync(10);
var hashedPassword = bcrypt.hashSync(config.admin_password, genSalt);

let params = {
  username: config.admin_username,
  password: hashedPassword,
};

async function create(params) {
  let admin = await adminServiceInstance.getAdmin(params);

  if (!admin) {
    let newAdmin = await adminServiceInstance.createAdmin(params);
    return newAdmin;
  } else {
    return "";
  }
}

create(params)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
