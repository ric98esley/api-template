const ROLES = require("../enums/roles");
const { grantSeller } = require("./seller.grant");
const { grantSuperuser } = require("./superuser.grant");


const grants = {
  [ROLES.SUPERUSER]: grantSuperuser,
  [ROLES.SELLER]: grantSeller
}

module.exports = {
  grants
}