const MoraribleToken = artifacts.require("MoraribleToken");

module.exports = function (deployer) {
  deployer.deploy(MoraribleToken);
};
