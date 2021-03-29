import * as React from "react"

Moralis.initialize("AdEIwBVQF3IB6TpjoyZidRasNgLuyGAzdfJJdLOT");
Moralis.serverURL = 'https://oo3xsmnesgip.moralis.io:2053/server'
const TOKEN_CONTRACT_ADDRESS = "0x2e18c551E447cDe714e7E62cac6c0099c790176A";

init = async () => {
    hideElement(createItemForm);
    hideElement(userInfo);
    window.web3 = await Moralis.Web3.enable();
    initUser();
}

initUser = async () => {
    if (await Moralis.User.current()) {
        hideElement(userConnectButton);
        showElement(userProfileButton);
        showElement(openCreateItemButton);
    }else {
        hideElement(openCreateItemButton);
        showElement(userConnectButton);
        hideElement(userProfileButton);
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
        nftFilePath: nftFilePath,
        nftFileHash: nftFileHash
    };

    const nftFileMetadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
    await nftFileMetadataFile.saveIPFS();

    const nftFileMetadataFilePath = nftFileMetadataFile.ipfs();
    const nftFileMetadataFileHash = nftFileMetadataFile.hash();

    const Item = Moralis.Object.extend("Item");
    const item = new Item();
    item.set('name', createItemNameField.value);
    item.set('description', createItemDescriptionField.value);
    item.set('nftFilePath', nftFilePath);
    item.set('nftFileHash', nftFileHash);
    item.set('MetadataFilePath', nftFileMetadataFilePath);
    item.set('MetadataFileHash', nftFileMetadataFileHash);

    await item.save();
    console.log(item);

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

init();

export default init