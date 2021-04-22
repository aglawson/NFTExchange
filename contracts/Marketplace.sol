pragma solidity 0.7.2;
pragma experimental ABIEncoderV2;

import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./Storage.sol";

contract MarketContract is Storage {

    address private _owner;

    event itemAdded(uint256 id, uint256 tokenId, address tokenAddress, uint256 askingPrice);
    event itemSold(uint256 id, address buyer, uint256 askingPrice);
    event itemAuctionStarted(uint256 id, uint256 tokenId, address tokenAddress, uint256 startingPrice, uint startTime, uint endTime);
    event bidPlaced(uint256 id, uint256 tokenId, uint bidValue, uint time);

    function addItemToMarket(uint256 tokenId, address tokenAddress, uint256 askingPrice) OnlyItemOwner(tokenAddress, tokenId) HasTransferApproval(tokenAddress, tokenId) external returns (uint256) {
        require(activeItems[tokenAddress][tokenId] == false, "Item is already on sale.");
        _uintStorage["newItemId"] = itemsForSale.length;
        itemsForSale.push(AuctionItem(_uintStorage["newItemId"], tokenAddress, tokenId, payable(msg.sender), askingPrice, false, block.timestamp, 0));
        activeItems[tokenAddress][tokenId] = true;
        
        assert(itemsForSale[_uintStorage["newItemId"]].id == _uintStorage["newItemId"]);
        emit itemAdded(_uintStorage["newItemId"], tokenId, tokenAddress, askingPrice);
        return _uintStorage["newItemId"];
    }

    function buyItem(uint256 id) payable external ItemExists(id) IsForSale(id) HasTransferApproval(itemsForSale[id].tokenAddress, itemsForSale[id].tokenId) {
        require(msg.value >= itemsForSale[id].askingPrice, "Not enough funds sent!");
        require(msg.sender != itemsForSale[id].seller);

        itemsForSale[id].isSold = true;
        activeItems[itemsForSale[id].tokenAddress][itemsForSale[id].tokenId] = false;
        IERC721(itemsForSale[id].tokenAddress).safeTransferFrom(itemsForSale[id].seller, msg.sender, itemsForSale[id].tokenId);
        itemsForSale[id].seller.transfer(msg.value);

        emit itemSold(id, msg.sender, itemsForSale[id].askingPrice);
    }

    function removeItem(uint256 id) ItemExists(id) IsForSale(id) HasTransferApproval(itemsForSale[id].tokenAddress, itemsForSale[id].tokenId) public {
        activeItems[itemsForSale[id].tokenAddress][itemsForSale[id].tokenId] = false;
        delete activeItems[itemsForSale[id].tokenAddress][itemsForSale[id].tokenId];
    }

    function startAuction(uint256 tokenId, address tokenAddress, uint256 askingPrice) OnlyItemOwner(tokenAddress, tokenId) HasTransferApproval(tokenAddress, tokenId) external returns (uint256) {
        require(activeItems[tokenAddress][tokenId] == false, "Item is already on sale.");
        _uintStorage["newItemId"] = itemsForSale.length;
        uint rightNow = block.timestamp;
        uint ending = block.timestamp + 60000;
        itemsForSale.push(AuctionItem(_uintStorage["newItemId"], tokenAddress, tokenId, payable(msg.sender), askingPrice, false, rightNow, ending));
        activeItems[tokenAddress][tokenId] = true;
        
        assert(itemsForSale[_uintStorage["newItemId"]].id == _uintStorage["newItemId"]);
        emit itemAdded(_uintStorage["newItemId"], tokenId, tokenAddress, askingPrice);
        emit itemAuctionStarted(_uintStorage["newItemId"], tokenId, tokenAddress, askingPrice, rightNow, ending);
        return _uintStorage["newItemId"];
    }

    function bidOnItem(uint256 id) payable external ItemExists(id) IsForSale(id) HasTransferApproval(itemsForSale[id].tokenAddress, itemsForSale[id].tokenId) {
        require(itemsForSale[id].endTime != 0, "This item is not for auction!");
        require(itemsForSale[id].endTime > block.timestamp, "The auction has ended!");
        require(msg.value >= itemsForSale[id].askingPrice, "Not enough funds sent!");
        require(msg.sender != itemsForSale[id].seller, "Cannot bid on your own item!");



        emit bidPlaced(id, itemsForSale[id].tokenId, msg.value, block.timestamp);
    }
