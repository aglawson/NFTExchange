Moralis.initialize("AdEIwBVQF3IB6TpjoyZidRasNgLuyGAzdfJJdLOT");
Moralis.serverURL = 'https://oo3xsmnesgip.moralis.io:2053/server'
const TOKEN_CONTRACT_ADDRESS = "0xA3384210527705238b63493309B894F2cB863835";

init = async () => {
    hideElement(createItemForm);
    hideElement(userInfo);
    hideElement(userItemsSection);
    window.web3 = await Moralis.Web3.enable();
    window.tokenContract = new web3.eth.Contract(tokenContractAbi, TOKEN_CONTRACT_ADDRESS);
    initUser();
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
    alert("calling create item function");
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
    const nftFileHash = nftFile.hash();

    const metadata = {
        name: createItemNameField.value,
        description: createItemDescriptionField.value,
        image: nftFilePath,
    };

    const nftFileMetadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
    await nftFileMetadataFile.saveIPFS();

    const nftFileMetadataFilePath = nftFileMetadataFile.ipfs();
    const nftFileMetadataFileHash = nftFileMetadataFile.hash();

    const nftId = await mintNft(nftFileMetadataFilePath);

    const Item = Moralis.Object.extend("Item");
    const item = new Item();
    item.set('name', createItemNameField.value);
    item.set('description', createItemDescriptionField.value);
    item.set('nftFilePath', nftFilePath);
    item.set('nftFileHash', nftFileHash);
    item.set('MetadataFilePath', nftFileMetadataFilePath);
    item.set('MetadataFileHash', nftFileMetadataFileHash);

    item.set('nftId', nftId);
    item.set('nftContractAddress', TOKEN_CONTRACT_ADDRESS);
    await item.save();
    console.log(item);

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
        getAndRenderItemData(item, renderUserItem);
    });
    console.log(ownedItems);
}

initTemplate = (id) => {
    const template = document.getElementById(id);
    template.id = "";
    template.parentNode.removeChild(template);
    return template;
}

renderUserItem = (item) => {
    const userItem = userItemTemplate.cloneNode(true);
    userItem.getElementsByTagName("img")[0].src = item.image;
    userItem.getElementsByTagName("img")[0].alt = item.name;
    userItem.getElementsByTagName("h5")[0].innerText = item.name;
    userItem.getElementsByTagName("p")[0].innerText = item.description;
    
    userItems.appendChild(userItem);
}

getAndRenderItemData = (item, renderFunction) => {
    fetch(item.tokenUri)
    .then(response => response.json())
    .then(data => {
        data.symbol = item.symbol;
        data.tokenId = item.tokenId;
        data.tokenAddress = item.tokenAddress;
        renderFunction(data);
    })
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


init();
