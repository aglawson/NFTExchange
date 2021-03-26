Moralis.initialize("");
Moralis.serverURL = ''

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

hideElement = (element) => element.style.display = "none";
showElement = (element) => element.style.display = "block";

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


init();
