pragma solidity 0.7.2;

import "../node_modules/@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./Storage.sol";

contract MarketContract is Storage{
    //AuctionItem[] public itemsForSale;

    event itemAdded(uint256 id, uint256 tokenId, address tokenAddress, uint256 askingPrice);
    event itemSold(uint256 id, address buyer, uint256 askingPrice);

    function addItemToMarket(uint256 tokenId, address tokenAddress, uint256 askingPrice) OnlyItemOwner(tokenAddress, tokenId) HasTransferApproval(tokenAddress, tokenId) external returns (uint256) {
        require(activeItems[tokenAddress][tokenId] == false, "Item is already on sale.");
        _uintStorage["newItemId"] = itemsForSale.length;
        itemsForSale.push(AuctionItem(_uintStorage["newItemId"], tokenAddress, tokenId, payable(msg.sender), askingPrice, false));
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
}