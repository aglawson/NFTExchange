import * as React from "react"

// styles
const pageStyles = {
  color: "#232129",
  padding: 96,
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}
const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
  maxWidth: 320,
}
const headingAccentStyles = {
  color: "#663399",
}
const paragraphStyles = {
  marginBottom: 48,
}
const codeStyles = {
  color: "#8A6534",
  padding: 4,
  backgroundColor: "#FFF4DB",
  fontSize: "1.25rem",
  borderRadius: 4,
}
const listStyles = {
  marginBottom: 96,
  paddingLeft: 0,
}
const listItemStyles = {
  fontWeight: 300,
  fontSize: 24,
  maxWidth: 560,
  marginBottom: 30,
}

const linkStyle = {
  color: "#8954A8",
  fontWeight: "bold",
  fontSize: 16,
  verticalAlign: "5%",
}

const docLinkStyle = {
  ...linkStyle,
  listStyleType: "none",
  marginBottom: 24,
}

const descriptionStyle = {
  color: "#232129",
  fontSize: 14,
  marginTop: 10,
  marginBottom: 0,
  lineHeight: 1.25,
}

const docLink = {
  text: "Documentation",
  url: "https://www.gatsbyjs.com/docs/",
  color: "#8954A8",
}

const badgeStyle = {
  color: "#fff",
  backgroundColor: "#088413",
  border: "1px solid #088413",
  fontSize: 11,
  fontWeight: "bold",
  letterSpacing: 1,
  borderRadius: 4,
  padding: "4px 6px",
  display: "inline-block",
  position: "relative",
  top: -2,
  marginLeft: 10,
  lineHeight: 1,
}

// data
const links = [
  {
    text: "Tutorial",
    url: "https://www.gatsbyjs.com/docs/tutorial/",
    description:
      "A great place to get started if you're new to web development. Designed to guide you through setting up your first Gatsby site.",
    color: "#E95800",
  },
  {
    text: "How to Guides",
    url: "https://www.gatsbyjs.com/docs/how-to/",
    description:
      "Practical step-by-step guides to help you achieve a specific goal. Most useful when you're trying to get something done.",
    color: "#1099A8",
  },
  {
    text: "Reference Guides",
    url: "https://www.gatsbyjs.com/docs/reference/",
    description:
      "Nitty-gritty technical descriptions of how Gatsby works. Most useful when you need detailed information about Gatsby's APIs.",
    color: "#BC027F",
  },
  {
    text: "Conceptual Guides",
    url: "https://www.gatsbyjs.com/docs/conceptual/",
    description:
      "Big-picture explanations of higher-level Gatsby concepts. Most useful for building understanding of a particular topic.",
    color: "#0D96F2",
  },
  {
    text: "Plugin Library",
    url: "https://www.gatsbyjs.com/plugins",
    description:
      "Add functionality and customize your Gatsby site or app with thousands of plugins built by our amazing developer community.",
    color: "#8EB814",
  },
  {
    text: "Build and Host",
    url: "https://www.gatsbyjs.com/cloud",
    badge: true,
    description:
      "Now you’re ready to show the world! Give your Gatsby site superpowers: Build and host on Gatsby Cloud. Get started for free!",
    color: "#663399",
  },
]

// markup
const IndexPage = () => {
  return (
    <main style={pageStyles}>
      <title>Rarible Clone</title>
      <h1 style={headingStyles}>
      <script src="https://cdn.jsdelivr.net/npm/web3@1.3.3/dist/web3.min.js"></script>
    <script src="https://unpkg.com/moralis@0.0.9/dist/moralis.js"></script>
    <script src="https://unpkg.com/moralis/dist/moralis.js"></script>

    <div>
        <button id="btnConnect">Connect Wallet</button>
        <button id="btnUserInfo">Profile</button>
        <button id="btnOpenCreateItem">Create Item</button>

    </div>

    <div id="userInfo">
        <h4>User Profile</h4>
        <input type="text" id="txtUsername" required placeholder ="Enter Username">
        <input type="text" id="txtEmail" placeholder ="Enter Email">
        <small>Optional</small>

        <img width="50" height="50" src="" id="imgAvatar" alt="">
        <label for="fileAvatar">Select Avatar</label>
        <input type="file" id="fileAvatar">

        <button id="btnLogout">Log out</button>
        <button id="btnCloseUserInfo">Close</button>
        <button id="btnSaveUserInfo">Save</button>
    </div>

    <div id="createItem">
        <h4>Create Item</h4>
        <input type="text" id="txtCreateItemName" required placeholder ="Enter Item Name">
        <textarea id="txtCreateItemDescription" cols="30" rows="5" placeholder="Enter Description"></textarea>
        <input type="number" min="1" step="1" id="numCreateItemPrice" placeholder="Enter Price" required>
        <label for="selectCreateItemStatus">Status</label>
        <select id="selectCreateItemStatus">
            <optgroup value="0">Not for sale</optgroup>
            <optgroup value="1">Instant buy</optgroup>
            <optgroup value="2">Accept offers</optgroup>
        </select>

        <label for="fileCreateItemFile">Select Item File</label>
        <img width="50" height="50" src="" id="itemFile" alt="">
        <input type="file" id="fileCreateItemFile">

        <button id="btnCloseCreateItem">Close</button>
        <button id="btnCreateItem">Create!</button>
    </div>

    <script src="main.js"></script>
    </main>
  )
}

export default IndexPage
