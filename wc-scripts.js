let web3;
let provider;
let selectedAccount;

const projectId = "5056a2b581e5962f9e3083d68053b5d8"; // your WalletConnect project ID

async function connectWallet() {
  provider = new WalletConnectProvider.default({
    rpc: {
      8453: "https://mainnet.base.org" // Base Mainnet
    },
    projectId: projectId,
    qrcode: true
  });

  await provider.enable();
  web3 = new Web3(provider);

  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  document.getElementById("walletAddress").innerText = "Connected: " + selectedAccount;
}

document.getElementById("btnConnect").addEventListener("click", connectWallet);

// Map contract name -> address + abi
const contractMap = {
  "GiveawayNFT": { address: "0x2DB841C867b2C6C757F33C93e8e268f23bEbbD62", abi: GiveawayNFT_ABI },
  "DonationTracker": { address: "0x218232D36d27F9284550410380c758AaC2280001", abi: DonationTracker_ABI },
  "VotingSystem": { address: "0x475dF0a82B4A0066a952EA908CcbFAa0ECE60646", abi: VotingSystem_ABI },
  "Escrow": { address: "0xAA168dCC429308B51F0511eca6fB448765a101AC", abi: Escrow_ABI },
  "SubscriptionService": { address: "0x0200C05230F678B9ddCA7Ece63ef9aA7F49Dd3F2", abi: SubscriptionService_ABI },
  "Crowdfunding": { address: "0xED7107FD71b5f41CE7d02B708Fa13bA7f1B7ce2F", abi: Crowdfunding_ABI },
  "Lottery": { address: "0x7804466d44EF4A65bb3526719dFbb006Ec12A19D", abi: Lottery_ABI },
  "MessageBoard": { address: "0xAAc91bf539754Dc4A740e3B38Af99E0FC1E8e11B", abi: MessageBoard_ABI }
};

async function interactContract(name) {
  const c = contractMap[name];
  if (!c) {
    alert("Contract not found");
    return;
  }

  const contract = new web3.eth.Contract(c.abi, c.address);

  let html = `<h3>${name} @ ${c.address}</h3>`;
  html += `<p>Available functions:</p>`;

  c.abi.filter(f => f.type === "function").forEach(fn => {
    html += `<button onclick="callFunction('${name}', '${fn.name}')">${fn.name}</button><br>`;
  });

  document.getElementById("interaction").innerHTML = html;
}

async function callFunction(name, fnName) {
  const c = contractMap[name];
  const contract = new web3.eth.Contract(c.abi, c.address);

  try {
    const fn = c.abi.find(f => f.name === fnName);
    if (!fn) return alert("Function not found");

    if (fn.stateMutability === "view" || fn.stateMutability === "pure") {
      const result = await contract.methods[fnName]().call();
      alert("Result: " + JSON.stringify(result));
    } else {
      const tx = await contract.methods[fnName]().send({ from: selectedAccount });
      alert("TX Hash: " + tx.transactionHash);
    }
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
}
