const SCOPE = require("../enums/scope");
const ROLES = require("../enums/roles");
const assetsGrants = require("./assets");
const { grantSeller } = require("./seller.grant");
const { grantSuperuser } = require("./superuser.grant");


const grants = {
  [SCOPE.ASSETS]: assetsGrants,
  [ROLES.SUPERUSER]: grantSuperuser,
  [ROLES.SELLER]: grantSeller
}

module.exports = {
  grants
}