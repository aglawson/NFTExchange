pragma solidity 0.7.2;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";

contract Token is ERC20, Ownable, ERC20Burnable {
    //uint8 public decimals = 18;

    uint256 public initialSupply = 25000000 * 10 ** 18;

    constructor () ERC20 ("ExchangeToken", "EXT") public {
        _mint(msg.sender, initialSupply);
    }

    function burn(uint256 amount) public onlyOwner override {
        transfer(0x000000000000000000000000000000000000dEaD, amount);
    }

    function mint(uint256 _amount) public onlyOwner {
        _mint(msg.sender, _amount);
    }
}

