// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NewToken is ERC20 {
    address public minter;

    constructor() payable ERC20("Decentralized Bank Token", "DBT"){
        minter = msg.sender;
    }

    function passMinterRole(address decentralizedBank)  public returns (bool) {
        require(msg.sender == minter, "Only minter can pass minter role");
        
        minter = decentralizedBank;

        return true;
    }

    function mint(address account, uint256 amount) public {
        require(msg.sender == minter, "Only minter can mint tokens");
        _mint(account, amount);
    }

}