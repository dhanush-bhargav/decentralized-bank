const newToken = artifacts.require("NewToken");
const decentralizedBank = artifacts.require("DecentralizedBank");

module.exports = async function(_deployer) {
  //deploy NewToken
  await _deployer.deploy(newToken);

  //get token address
  const token = await newToken.deployed();

  //deploy dBank using token address
  await _deployer.deploy(decentralizedBank, token.address);

  //get dBank address
  const dBank = await decentralizedBank.deployed();

  //pass minter role to dBank
  await token.passMinterRole(dBank.address);

  console.log("Token contract deployed at: ", token.address);
  console.log("Decentralized Bank contract deployed at: ", dBank.address);

};
