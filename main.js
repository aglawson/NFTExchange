Moralis.initialize("");
Moralis.serverURL = ''

init = async () => {
    window.web3 = await Moralis.Web3.enable();
    initUser();
}

initUser = async () => {
    if (await Moralis.User.current()) {
        hideElement(userConnectButton);
        showElement(userProfileButton);
    }else {
        showElement(userConnectButton);
        hideElement(userProfileButton);
    }
}

login = async() => {
    try {
        await Moralis.Web3.authenticate();
        initUser();
    }catch (error) {
        alert(error);
    }
}

hideElement = (element) => element.style.display = "none";
showElement = (element) => element.style.display = "block";

const userConnectButton = document.getElementById("btnConnect");
userConnectButton.onclick = login;
const userProfileButton = document.getElementById("btnUserInfo");


init();