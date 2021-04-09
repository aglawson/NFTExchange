Moralis.initialize("65Sp0XaKbuzcDeRBtpRCUkMfQ3ICogBxjbKIWiWP");
Moralis.serverURL = 'https://uavkeiigq1dw.moralis.io:2053/server'
const TOKEN_CONTRACT_ADDRESS = "0x849f1a62a51E84125EccB8ea02139ddc02835E07";
const MARKETPLACE_CONTRACT_ADDRESS = "0x38C274A23D97B51F7cCB1747A1e8d991Ed8a4D27";
const STORAGE_CONTRACT_ADDRESS = "0x1218353a6b9ae2a943cbB1D03BcB82e0AC4565E2";
init = async () => {
    hideElement(createItemForm);
    hideElement(userInfo);
    hideElement(userItemsSection);
    window.web3 = await Moralis.Web3.enable();
    window.tokenContract = new web3.eth.Contract(tokenContractAbi, TOKEN_CONTRACT_ADDRESS);
    window.marketplaceContract = new web3.eth.Contract(marketplaceContractAbi, MARKETPLACE_CONTRACT_ADDRESS);

    initUser();
    loadItems();

    const soldItemsQuery = new Moralis.Query('SoldItems');
    const soldItemsSubscription = await soldItemsQuery.subscribe();
    soldItemsSubscription.on("create", onItemSold);

    const itemsAddedQuery = new Moralis.Query('SoldItems');
    const itemsAddedSubscription = await itemsAddedQuery.subscribe();
    itemsAddedSubscription.on("create", onItemAdded);
}

onItemSold = async (item) => {
    const listing = document.getElementById(`item-${item.attributes.uid}`);
    if(listing) {
        listing.parentNode.removeChild(listing);
    }
    user = await Moralis.User.current();
    if(user) {
        const params = {uid: `${item.attributes.uid}`};
            const soldItem = await Moralis.Cloud.run('getItem', params);
            if(soldItem) {
                if(user.get('accounts').includes(item.attributes.buyer)){
                    getAndRenderItemData(soldItem, renderUserItem);
                }

                const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
                if(userItemListing) userItemListing.parentNode.removeChild(userItemListing);
            }
        
    }

}

onItemAdded = async (item) => {
    const params = {uid: `${item.attributes.uid}`};
    const addedItem = await Moralis.Cloud.run('getItem', params);
    if(addedItem) {
        listing.parentNode.removeChild(listing);
    }
    user = await Moralis.User.current();
    if(user) {
        if(user.get('accounts').includes(addedItem.ownerOf)){
            const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
            if(userItemListing) userItemListing.parentNode.removeChild(userItemListing);

            getAndRenderItemData(addedItem, renderUserItem);
            return;
        }
        getAndRenderItemData(addedItem, renderItem);
    }

}

initUser = async () => {
    if (await Moralis.User.current()) {
        hideElement(userConnectButton);
        showElement(userProfileButton);
        showElement(openCreateItemButton);
        showElement(openUserItemsButton);
        loadUserItems();
    }else {
        hideElement(openCreateItemButton);
        showElement(userConnectButton);
        hideElement(userProfileButton);
        hideElement(openUserItemsButton);
    }
}

login = async () => {
    try {
        await Moralis.Web3.authenticate();
        initUser();
    }catch (error) {
        alert(error);
    }
}

logout = async () => {
    await Moralis.User.logOut();
    hideElement(userInfo);
    initUser();
}

openUserInfo = async () => {
    user = await Moralis.User.current();
    if(user){
        const email = user.get('email');
        if(email){
            userEmailField.value = email;
        }else {
            userEmailField.value = "";
        }

        userUsernameField.value = user.get('username');

        const userAvatar = user.get('avatar');
        if(userAvatar) {
            userAvatarImg.src = userAvatar.url();
            showElement(userAvatarImg);
        }else {
            hideElement(userAvatarImg);

        }

        showElement(userInfo);
    }else {
        login();
    }
}

saveUserInfo = async () => {
    user.set('email', userEmailField.value);
    user.set('username', userUsernameField.value);

    if (userAvatarFile.files.length > 0) {
      
        const avatar = new Moralis.File("avatar.jpg", userAvatarFile.files[0]);
        user.set('avatar', avatar);
    }

    await user.save();
    alert("User info saved successfully");
    openUserInfo();
}

createItem = async () => {
    if(createItemFile.files.length == 0){
        alert("Please select a file.");
        return;
    } else if(createItemNameField.value.length == 0){
        alert("Please give item a name.");
        return;
    }

    const data = createItemFile.files[0];
    const nftFile = new Moralis.File(data.name, data);
    console.log(nftFile);
    await nftFile.saveIPFS();

    const nftFilePath = nftFile.ipfs();

    const metadata = {
        name: createItemNameField.value,
        description: createItemDescriptionField.value,
        image: nftFilePath,
    };

    const nftFileMetadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
    await nftFileMetadataFile.saveIPFS();

    const nftFileMetadataFilePath = nftFileMetadataFile.ipfs();

    const nftId = await mintNft(nftFileMetadataFilePath);

    user = await Moralis.User.current();
    const userAddress = user.get('ethAddress');

    switch(createItemStatusField.value) {
        case "0":
            return;
        case "1": 
            await ensureMarketplaceIsApproved(nftId, TOKEN_CONTRACT_ADDRESS);
            await marketplaceContract.methods.addItemToMarket(nftId, TOKEN_CONTRACT_ADDRESS, createItemPriceField.value).send({from: userAddress});
            break;
        case "2":
            alert("Auction not yet supported, item has been minted");
            return;
    }
}

mintNft = async (metadataUrl) => {
    const receipt = await tokenContract.methods.createItem(metadataUrl).send({from: ethereum.selectedAddress});
    console.log(receipt);
    return receipt.events.Transfer.returnValues.tokenId;
}

openUserItems = async () => {
    user = await Moralis.User.current();
    if(user) {
        showElement(userItemsSection);
    }else {
        login();
    }
}

loadUserItems = async () => {
    const ownedItems = await Moralis.Cloud.run("getUserItems");
    ownedItems.forEach(item => {
        const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
        if(userItemListing) return;
        getAndRenderItemData(item, renderUserItem);
    });
}

loadItems = async () => {
    // user = await Moralis.User.current();
    console.log("loadItems is called");
    const items = await Moralis.Cloud.run("getItems");
    items.forEach(item => {
        getAndRenderItemData(item, renderItem);
    });
}

initTemplate = (id) => {
    const template = document.getElementById(id);
    template.id = "";
    template.parentNode.removeChild(template);
    return template;
}

renderUserItem = (item) => {
    const userItemListing = document.getElementById(`user-item-${item.tokenObjectId}`);
    if(userItemListing) return;

    const userItem = userItemTemplate.cloneNode(true);
    userItem.getElementsByTagName("img")[0].src = item.image;
    userItem.getElementsByTagName("img")[0].alt = item.name;
    userItem.getElementsByTagName("h5")[0].innerText = item.name;
    userItem.getElementsByTagName("p")[0].innerText = item.description;

    userItem.getElementsByTagName("input")[0].value = item.askingPrice ?? 1;
    userItem.getElementsByTagName("input")[0].disabled = item.askingPrice > 0;
    userItem.getElementsByTagName("button")[0].disabled = item.askingPrice > 0;
    userItem.getElementsByTagName("button")[0].onclick = async () => {
        user = await Moralis.User.current();
        if(!user) {
            login();
            return;
        }
        await ensureMarketplaceIsApproved(item.tokenId, item.tokenAddress);
        await marketplaceContract.methods.addItemToMarket(item.tokenId, item.tokenAddress, userItem.getElementsByTagName("input")[0].value).send({from:user.get('ethAddress')});
    };
    

    userItem.id = `user-item-${item.tokenObjectId}`;
    
    userItems.appendChild(userItem);
}

getAndRenderItemData = (item, renderFunction) => {
    fetch(item.tokenUri)
    .then(response => response.json())
    .then(data => {
        item.name = data.name;
        item.description = data.description;
        item.image = data.image;
        renderFunction(item);
    })
}

ensureMarketplaceIsApproved = async (tokenId, tokenAddress) => { 
    user = await Moralis.User.current();
    const userAddress = user.get('ethAddress');
    const contract = new web3.eth.Contract(tokenContractAbi, tokenAddress);
    const approvedAddress = await contract.methods.getApproved(tokenId).call({from: userAddress});
    if(approvedAddress != MARKETPLACE_CONTRACT_ADDRESS){
        await contract.methods.approve(MARKETPLACE_CONTRACT_ADDRESS, tokenId).send({from: userAddress});
    }
} 

renderItem = (item) => {
    const itemForsale = marketplaceItemTemplate.cloneNode(true);
    if(item.avatar) {
        itemForsale.getElementsByTagName("img")[0].src = item.sellerAvatar.url();
        itemForsale.getElementsByTagName("img")[0].alt = item.sellerUsername;
    }
    itemForsale.getElementsByTagName("img")[1].src = item.image;
    itemForsale.getElementsByTagName("img")[1].alt = item.name;
    itemForsale.getElementsByTagName("h5")[0].innerText = item.name;
    itemForsale.getElementsByTagName("p")[0].innerText = item.description;

    itemForsale.getElementsByTagName("button")[0].innerText = `Buy for ${item.askingPrice}`;
    itemForsale.getElementsByTagName("button")[0].onclick = () => buyItem(item);
    itemForsale.id = `item-${item.uid}`;
    itemsForsale.appendChild(itemForsale);
}

buyItem = async (item) => {
    user = await Moralis.User.current();
    if(!user) {
        login();
        return;
    }
    await marketplaceContract.methods.buyItem(item.uid).send({from: user.get('ethAddress'), value: item.askingPrice});

}

hideElement = (element) => element.style.display = "none";
showElement = (element) => element.style.display = "block";

// Navbar
const userConnectButton = document.getElementById("btnConnect");
userConnectButton.onclick = login;
const userProfileButton = document.getElementById("btnUserInfo");
userProfileButton.onclick = openUserInfo;

//User Info Form
const userInfo = document.getElementById("userInfo");
const userClose = document.getElementById("btnCloseUserInfo");
userClose.onclick = () => hideElement(userInfo);
const userLogout = document.getElementById("btnLogout");
userLogout.onclick = logout;
//User Info Fields
const userUsernameField = document.getElementById("txtUsername");
const userEmailField = document.getElementById("txtEmail");
const userAvatarImg = document.getElementById("imgAvatar");
const userAvatarFile = document.getElementById("fileAvatar");

const userSaveButton = document.getElementById("btnSaveUserInfo");
userSaveButton.onclick = saveUserInfo;

//Create Item Form
const createItemForm = document.getElementById("createItem");
const openCreateItemButton = document.getElementById("btnOpenCreateItem");
openCreateItemButton.onclick = () => showElement(createItemForm);

const closeCreateItem = document.getElementById("btnCloseCreateItem");
closeCreateItem.onclick = () => hideElement(createItemForm);

//Create Item Fields
const createItemNameField = document.getElementById("txtCreateItemName");
const createItemDescriptionField = document.getElementById("txtCreateItemDescription");
const createItemPriceField = document.getElementById("numCreateItemPrice");
const createItemStatusField = document.getElementById("selectCreateItemStatus");
const createItemFile = document.getElementById("fileCreateItemFile");
document.getElementById("btnCreateItem").onclick = createItem;


//User Items
const userItemsSection = document.getElementById("userItems");
const userItems = document.getElementById("userItemsList");
document.getElementById("btnCloseUserItems").onclick = () => hideElement(userItemsSection);
const openUserItemsButton = document.getElementById("btnMyItems");
openUserItemsButton.onclick = openUserItems;

const userItemTemplate = initTemplate("itemTemplate");

const itemsForSale = document.getElementById("itemsForSale");
const marketplaceItemTemplate = initTemplate("marketplaceItemTemplate");


init();