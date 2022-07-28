import { wait } from './helpers';

const NewToken = artifacts.require("NewToken");
const decentralizedBank = artifacts.require("DecentralizedBank");

require('chai').use(require('chai-as-promised')).should()

contract('decentralizedBank', ([deployer, user]) => {
    let dBank, token;
    const interestPerSecond = 3170979198

    beforeEach(async () => {
        token = await NewToken.new();
        dBank = await decentralizedBank.new(token.address);
        await token.passMinterRole(dBank.address, {from: deployer});
    })

    describe('testing token functionalities ...', () => {
        describe('success', () => {
            it('Token name check', async () => {
                expect(await token.name()).to.be.eq('Decentralized Bank Token');
            })

            it('Token symbol check', async () => {
                expect(await token.symbol()).to.be.eq('DBT');
            })

            it('Initial total supply check', async () => {
                expect(Number(await token.totalSupply())).to.be.eq(0);
            })

            it('Minter role with decentralized bank contract', async() => {
                expect(await token.minter()).to.be.eq(dBank.address);
            })
        })

        describe('failure', () => {
            it('Only minter can transfer minter role', async () => {
                await token.passMinterRole(user, {from: deployer}).should.be.rejectedWith('VM Exception while processing transaction: revert');
            })

            it('Only minter can mint tokens', async () => {
                await token.mint(user, '1', {from: deployer}).should.be.rejectedWith('VM Exception while processing transaction: revert');
            })
        })
    })

    describe('testing deposit in dBank...', () => {
        let balance;

        beforeEach(async () => {
            await dBank.deposit({value: 1e16, from: user});
        })

        describe('success', () => {
            it('deposit value increases', async () => {
                expect(Number(await dBank.etherBalanceOf(user))).to.be.eq(1e16);
            })
    
            it('deposit time should increase', async () => {
                expect(Number(await dBank.depositStartTime(user))).to.be.above(0);
            })
    
            it('deposit flag should be true', async () => {
                expect(await dBank.isDeposited(user)).to.eq(true);
            })
        })

        describe('failure', () => {
            it('small deposit value should be rejected', async () => {
                await dBank.deposit({value: 1e15, from: user}).should.be.rejectedWith('VM Exception while processing transaction: revert');
            })
        })
    })

    describe('testing interest accrual...', () => {
        let balance;

        describe('success', () => {
            beforeEach(async() => {
                await dBank.deposit({value: 1e18, from: user});

                await wait(3);
    
                await dBank.calculateTokenBalance({from: user});
            })

            it('token balance should increase', async () => {
                expect(Number(await dBank.tokenBalanceOf(user))).to.be.above(0);
            })
        })

        describe('failure', () => {
            it('no token balance if deposit not made', async () => {
                await dBank.calculateTokenBalance({from: user}).should.be.rejectedWith('VM Exception while processing transaction: revert');
            })
        })
    })

    describe('testing ether withdrawals ...', () => {
        let balance;

        describe('success', () => {
            before(async () => {
                await dBank.deposit({value: 1e18, from: user});
                await wait(5);
                balance = await web3.eth.getBalance(user);
                await dBank.withdrawEther(1e7, {from: user});
            })
    
            it('users ether balance should increase', async () => {
                expect(Number(await web3.eth.getBalance(user))).to.be.above(Number(balance));
            })

            it('users ehter balance in bank should decrease', async () => {
                expect(Number(await dBank.etherBalanceOf(user))).to.be.below(1e18);
            })
        })

        describe('failure', () => {
            before(async () => {
                await dBank.deposit({value: 1e18, from: user});
                await wait(5);
                balance = await web3.eth.getBalance(user);
            })

            it('withdrawing more than deposit is not allowed', async () => {
                await dBank.withdrawEther(1e10, {from: user}).should.be.rejectedWith('VM Exception while processing transaction: revert');
            })

            it('minimum withdrawal limit should be met', async () => {
                await dBank.withdrawEther(1e6, {from: user}).should.be.rejectedWith('VM Exception while processing transaction: revert')
            })
        })

        describe('failure', () => {
            it('withdrawing without depositing is not allowed', async () => {
                await dBank.withdrawEther(1e7, {from: user}).should.be.rejectedWith('VM Exception while processing transaction: revert')
            })
        })
    })

    describe('testing token withdrawal...', () => {
        let balance;

        describe('success', () => {
            beforeEach(async () => {
                await dBank.deposit({ value: 1e18, from: user});
                await wait(5);
                await dBank.calculateTokenBalance({from: user});
                balance = Number(await dBank.tokenBalanceOf(user));
                await dBank.withdrawToken(10000, {from: user});
            })
    
            it('token balance in bank should decrease', async () => {
                expect(Number(await dBank.tokenBalanceOf(user))).to.be.below(balance);
            })
    
            it('token balance in wallet should increase', async () => {
                expect(Number(await token.balanceOf(user))).to.be.above(0);
            })
        })

        describe('failure', () => {
            beforeEach(async () => {
                await dBank.deposit({ value: 1e18, from: user});
                await wait(2);
                await dBank.calculateTokenBalance({from: user});
                balance = Number(await dBank.tokenBalanceOf(user));
            })

            it('token withdrawal amount is more than balance', async () => {
                await dBank.withdrawToken(balance*2, {from: user}).should.be.rejectedWith('VM Exception while processing transaction: revert');
            })
        })

        describe('failure', () => {
            it('can not withdraw token without depositing ether', async () => {
                await dBank.withdrawToken(100, {from: user}).should.be.rejectedWith('VM Exception while processing transaction: revert');
            })
        })
    })

    describe('testing loan borrow...', () => {
        describe('success', () => {
            beforeEach(async () => {
                await dBank.deposit({value: 1e18, from: user});
                await dBank.borrow(2e9, {from: user});
            })

            it('Ether balance of user should decrease', async () => {
                expect(Number(await dBank.etherBalanceOf(user))).to.be.below(1e18);
            })

            it('colateral balance of user should increase', async () => {
                expect(Number(await dBank.colateralAmount(user))).to.be.eq(1e18);
            })

            it('token balance of user should increase', async () => {
                expect(Number(await token.balanceOf(user))).to.be.eq(2e18);
            })

            it('loan amount of user in dbank should increase', async () => {
                expect(Number(await dBank.loanDueOf(user))).to.be.eq(2e18);
            })
        })

        describe('failure', () => {
            beforeEach(async () => {
                await dBank.deposit({value: 1e18, from: user});
                await dBank.borrow(1e7, {from: user});
            })

            it('only one loan can be taken at a time', async () => {
                await dBank.borrow(1e7, {from: user}).should.be.rejectedWith('VM Exception while processing transaction: revert')
            })
        })

        describe('failure', () => {
            beforeEach(async () => {
                await dBank.deposit({value: 1e16, from: user});
            })

            it('available colateral is less than required for loan', async () => {
                await dBank.borrow(1e9, {from: user}).should.be.rejectedWith('VM Exception while processing transaction: revert')
            })
        })

        describe('failure', () => {
            it('loan can not be taken without depositing', async () => {
                await dBank.borrow(1e9, {from: user}).should.be.rejectedWith('VM Exception while processing transaction: revert')
            })
        })
    })

    describe('testing loan payoff...', () => {
        let balance;
        let tokenBalance;
        let colateral;
        let loan;

        describe('success', () => {
            beforeEach(async () => {
                await dBank.deposit({value: 1e18, from: user});
                await dBank.borrow(1e7, {from: user});
                balance = Number(await dBank.etherBalanceOf(user));
                colateral = Number(await dBank.colateralAmount(user));
                loan = Number(await dBank.loanDueOf(user));
                tokenBalance = Number(await token.balanceOf(user));
                await dBank.payBack({from: user});
            })

            it('loan amount reduces', async () => {
                expect(Number(await dBank.loanDueOf(user))).to.be.eq(loan - 1e15);
            })

            it('colateral amount reduces', async () => {
                expect(Number(await dBank.colateralAmount(user))).to.be.eq(colateral/8);
            })

            it('ether balance increases', async () => {
                expect(Number(await dBank.etherBalanceOf(user))).to.be.eq(balance + colateral - colateral/8);
            })

            it('token balance in wallet reduces', async () => {
                expect(Number(await token.balanceOf(user))).to.be.eq(tokenBalance - 1e15);
            })
        })

        describe('failure', () => {
            beforeEach(async () => {
                await dBank.deposit({value: 1e18, from: user});
            })

            it('loan can not be paid off without borrowing', async () => {
                await dBank.payBack({from: user}).should.be.rejectedWith('VM Exception while processing transaction: revert');
            })
        })
    })
})