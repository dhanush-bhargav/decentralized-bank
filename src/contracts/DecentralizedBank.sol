//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NewToken.sol";

contract DecentralizedBank {

  NewToken private token;

  mapping(address=>uint) public etherBalanceOf;
  mapping(address=>uint) public tokenBalanceOf;
  mapping(address=>uint) public depositStartTime;

  mapping(address=>uint) public loanDueOf;
  mapping(address=>uint) public colateralAmount;

  mapping(address=>bool) public loanTaken;
  mapping(address=>bool) public isDeposited;

  event Deposit(address indexed user, uint etherAmount, uint timeStart);
  event CalculateTokenBalance(address indexed user, uint tokenBalance);
  event Withdraw(address indexed user, uint amount, uint depositTime);
  event Borrow(address indexed user, uint colateralAmount, uint loanAmount);
  event PayBack(address indexed user, uint fee);

  constructor(NewToken _token) {
    token = _token;
  }

  function deposit() public payable {
    require(msg.value >= 1e16, "Minimum deposit value: 0.01 ETH");

    if (etherBalanceOf[msg.sender] > 0){
      tokenBalanceOf[msg.sender] = tokenBalanceOf[msg.sender] + _calculateTokenBalance(msg.sender);
    }

    etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value;
    depositStartTime[msg.sender] = block.timestamp;
    isDeposited[msg.sender] = true;

    emit Deposit(msg.sender, msg.value, depositStartTime[msg.sender]);
  }

  function calculateTokenBalance() public {
    require(isDeposited[msg.sender] == true, "Deposit ETH to get Token Payout");

    tokenBalanceOf[msg.sender] = tokenBalanceOf[msg.sender] +  _calculateTokenBalance(msg.sender);
    depositStartTime[msg.sender] = block.timestamp;
    
    emit CalculateTokenBalance(msg.sender, tokenBalanceOf[msg.sender]);
  }

  function withdrawEther(uint amount) public payable {
    require(isDeposited[msg.sender] == true, "Please deposit ether before withdrawing");
    require(amount*1e9 >= 1e16, "Minimum of 0.01 ETH should be withdrawn at a time");
    require(amount*1e9 <= etherBalanceOf[msg.sender], "Requested amount exceeds account balance");

    etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] - amount*1e9;
    depositStartTime[msg.sender] = block.timestamp;

    if (etherBalanceOf[msg.sender] == 0){
      isDeposited[msg.sender] = false;
    }

    payable(msg.sender).transfer(amount*1e9);

    emit Withdraw(msg.sender, amount, block.timestamp - depositStartTime[msg.sender]);
  }

  function withdrawToken(uint amount) public {
    require(isDeposited[msg.sender] == true, "Please deposit ether before withdrawing");
    require(amount <= tokenBalanceOf[msg.sender], "Requested amount exceeds account balance");

    tokenBalanceOf[msg.sender] = tokenBalanceOf[msg.sender] + _calculateTokenBalance(msg.sender);
    tokenBalanceOf[msg.sender] = tokenBalanceOf[msg.sender] - amount;
    depositStartTime[msg.sender] = block.timestamp;

    token.mint(msg.sender, amount);

    emit Withdraw(msg.sender, amount, block.timestamp - depositStartTime[msg.sender]);
  }

  function borrow(uint amount) public {
    require(loanTaken[msg.sender] == false, "Please clear old loan before taking a new one");
    require(isDeposited[msg.sender] == true, "Please deposit ETH as a collateral for your loan");
    require(etherBalanceOf[msg.sender] >= (amount * 1e9)/2, "Deposit collateral must be at least 50% of loan amount");

    colateralAmount[msg.sender] = (amount * 1e9)/2;
    etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] - colateralAmount[msg.sender];
    loanDueOf[msg.sender] = loanDueOf[msg.sender] + amount * 1e9;
    loanTaken[msg.sender] = true;

    token.mint(msg.sender, amount * 1e9);

    emit Borrow(msg.sender, colateralAmount[msg.sender], loanDueOf[msg.sender]);
  }

  function payBack() public {
    require(loanTaken[msg.sender] == true, "You do not have an active loan to repay");
    require(token.transferFrom(msg.sender, address(this), loanDueOf[msg.sender]), "Error, token transaction was not approved");

    etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + colateralAmount[msg.sender] - colateralAmount[msg.sender]/8;
    colateralAmount[msg.sender] = colateralAmount[msg.sender] / 8;

    loanDueOf[msg.sender] = 0;
    loanTaken[msg.sender] = false;

    emit PayBack(msg.sender, colateralAmount[msg.sender]);
  }

  function _calculateTokenBalance(address account) private view returns (uint) {
    uint interestPerSecond = 3170979198 * (etherBalanceOf[account] / 1e18);
    return (interestPerSecond * (block.timestamp - depositStartTime[account]));
  }
}
