pragma solidity 0.7.2;
import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Storage {
    mapping (string => uint256) _uintStorage;
    mapping (string => address) _addressStorage;
    mapping (string => bool) _boolStorage;
    mapping (string => string) _stringStorage;
    mapping (string => bytes4) _bytesStorage;
    address public owner;
    bool public _initialized;

    struct AuctionItem {
        uint256 id; 
        address tokenAddress;
        uint256 tokenId;
        address payable seller;
        uint256 askingPrice;
        bool isSold;
    }

    mapping(address => mapping(uint256 => bool)) public activeItems;
    AuctionItem[] public itemsForSale;

    modifier OnlyItemOwner(address tokenAddress, uint256 tokenId){
        IERC721 tokenContract = IERC721(tokenAddress);
        require(tokenContract.ownerOf(tokenId) == msg.sender);
        _;
    }

    modifier HasTransferApproval(address tokenAddress, uint256 tokenId){
        IERC721 tokenContract = IERC721(tokenAddress);
        require(tokenContract.getApproved(tokenId) == address(this));
        _;
    }

    modifier ItemExists(uint256 id) {
        require(id < itemsForSale.length && itemsForSale[id].id == id, "Could not find item");
        _;
    }

    modifier IsForSale(uint256 id) {
        require(itemsForSale[id].isSold == false, "Item is already sold");
        _;
    }
}