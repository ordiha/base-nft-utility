let web3;
let provider;
let accounts = [];

// Contracts in base-nft-utility
const contracts = [
  { name: "Giveaway NFT", address: "0x2DB841C867b2C6C757F33C93e8e268f23bEbbD62" },
  { name: "Donation Tracker", address: "0x218232D36d27F9284550410380c758AaC2280001" },
  { name: "Voting System", address: "0x475dF0a82B4A0066a952EA908CcbFAa0ECE60646" },
  { name: "Escrow", address: "0xAA168dCC429308B51F0511eca6fB448765a101AC" },
  { name: "Subscription Service", address: "0x0200C05230F678B9ddCA7Ece63ef9aA7F49Dd3F2" },
  { name: "Crowdfunding", address: "0xED7107FD71b5f41CE7d02B708Fa13bA7f1B7ce2F" },
  { name: "Lottery", address: "0x7804466d44EF4A65bb3526719dFbb006Ec12A19D" },
  { name: "Message Board", address: "0xAAc91bf539754Dc4A740e3B38Af99E0FC1E8e11B" }
];

// Initialize UI
function initUI() {
  const list = document.getElementById("contract-list");
  contracts.forEach(c => {
    const card = document.createElement("div");
    card.className = "contract-card";
    card.innerHTML = `
      <h3>${c.name}</h3>
      <p><strong>Address:</strong> ${c.address}</p>
      <button class="btn" onclick="interactContract('${c.address}')">Interact</button>
    `;
    list.appendChild(card);
  });
}

async function connectWallet() {
  // WalletConnect fallback
  if (window.ethereum) {
    provider = window.ethereum;
    try {
      accounts = await provider.request({ method: "eth_requestAccounts" });
      web3 = new Web3(provider);
      document.getElementById("wallet-status").innerText = "Connected: " + accounts[0];
    } catch (err) {
      alert("User rejected connection");
    }
  } else {
    // WalletConnect QR
    provider = new WalletConnectProvider.default({
      rpc: { 8453: "https://mainnet.base.org" } // Base mainnet
    });
    await provider.enable();
    web3 = new Web3(provider);
    accounts = await web3.eth.getAccounts();
    document.getElementById("wallet-status").innerText = "Connected via WalletConnect: " + accounts[0];
  }
}

async function interactContract(address) {
  if (!web3) {
    alert("Connect wallet first!");
    return;
  }
  alert(`Interacting with contract at: ${address}`);
  // TODO: load ABI & call contract methods here
}

document.addEventListener("DOMContentLoaded", () => {
  initUI();
  document.getElementById("btnConnect").addEventListener("click", connectWallet);
});
