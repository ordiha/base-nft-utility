import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import WalletConnectProvider from "https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider@1.8.0/dist/umd/index.min.js";

let provider;
let signer;

// Connect wallet function
async function connectWallet() {
  try {
    if (window.ethereum) {
      // Try browser extension wallet first (MetaMask, Rabby, etc.)
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      alert("Connected with extension: " + address);
    } else {
      // Fallback to WalletConnect (QR on desktop, deep link on mobile)
      const wcProvider = new WalletConnectProvider({
        rpc: {
          8453: "https://mainnet.base.org" // Base mainnet
        },
        chainId: 8453,
      });

      await wcProvider.enable();
      provider = new ethers.providers.Web3Provider(wcProvider);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      alert("Connected with WalletConnect: " + address);
    }
  } catch (err) {
    console.error("Wallet connection failed:", err);
    alert("Wallet connection failed: " + err.message);
  }
}

// Interact with contract function
async function interactWithContract(contractAddress, abi, action, params = []) {
  if (!signer) {
    alert("Please connect a wallet first!");
    return;
  }
  try {
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract[action](...params);
    alert(`Transaction sent! Hash: ${tx.hash}`);
    await tx.wait();
    alert("✅ Transaction confirmed!");
  } catch (err) {
    console.error("Contract interaction failed:", err);
    alert("Contract interaction failed: " + err.message);
  }
}

// Attach connect button
document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("btnConnect");
  if (connectBtn) connectBtn.addEventListener("click", connectWallet);
});

// Expose to global
window.connectWallet = connectWallet;
window.interactWithContract = interactWithContract;
