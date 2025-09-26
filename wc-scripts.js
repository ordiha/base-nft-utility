let web3;
let accounts;
let provider;

// Contract ABIs and addresses
const CONTRACTS = {
  GiveawayNFT: { abi: GiveawayNFT_ABI, address: "0x2DB841C867b2C6C757F33C93e8e268f23bEbbD62" },
  DonationTracker: { abi: DonationTracker_ABI, address: "0x218232D36d27F9284550410380c758AaC2280001" },
  VotingSystem: { abi: VotingSystem_ABI, address: "0x475dF0a82B4A0066a952EA908CcbFAa0ECE60646" },
  Escrow: { abi: Escrow_ABI, address: "0xAA168dCC429308B51F0511eca6fB448765a101AC" },
  SubscriptionService: { abi: SubscriptionService_ABI, address: "0x0200C05230F678B9ddCA7Ece63ef9aA7F49Dd3F2" },
  Crowdfunding: { abi: Crowdfunding_ABI, address: "0xED7107FD71b5f41CE7d02B708Fa13bA7f1B7ce2F" },
  Lottery: { abi: Lottery_ABI, address: "0x7804466d44EF4A65bb3526719dFbb006Ec12A19D" },
  MessageBoard: { abi: MessageBoard_ABI, address: "0xAAc91bf539754Dc4A740e3B38Af99E0FC1E8e11B" }
};

// Connect Wallet button
document.getElementById("btnConnect").addEventListener("click", async () => {
  try {
    if (window.ethereum) {
      provider = window.ethereum;
      await provider.request({ method: "eth_requestAccounts" });
    } else {
      const WalletConnectProvider = window.WalletConnectProvider.default;
      provider = new WalletConnectProvider({ infuraId: "5056a2b581e5962f9e3083d68053b5d8" });
      await provider.enable();
    }

    web3 = new Web3(provider);
    accounts = await web3.eth.getAccounts();
    showWallet(accounts[0]);
  } catch (err) {
    console.error(err);
    alert("Failed to connect wallet!");
  }
});

function showWallet(addr) {
  document.getElementById("addr").innerText = addr;
  document.getElementById("chain").innerText = "Connected";
}

// Actions for all contracts
const actions = {};

for (const [name, { abi, address }] of Object.entries(CONTRACTS)) {
  actions[name] = {};

  abi.forEach(fn => {
    if (fn.type === "function") {
      const fnName = fn.name;

      actions[name][fnName] = async () => {
        try {
          const inputs = fn.inputs.map(input => {
            const el = document.getElementById(`${name}_${fnName}_${input.name}`);
            return el ? el.value : undefined;
          });

          const contract = new web3.eth.Contract(abi, address);
          const method = contract.methods[fnName](...inputs);

          if (fn.stateMutability === "view" || fn.stateMutability === "pure") {
            const result = await method.call({ from: accounts[0] });
            document.getElementById(`${name}_${fnName}_status`).innerText = `Result: ${JSON.stringify(result)}`;
          } else {
            const tx = await method.send({ from: accounts[0] });
            document.getElementById(`${name}_${fnName}_status`).innerText = `Tx: ${tx.transactionHash}`;
          }
        } catch (err) {
          console.error(err);
          const statusEl = document.getElementById(`${name}_${fnName}_status`);
          if (statusEl) statusEl.innerText = `Error: ${err.message}`;
        }
      };
    }
  });
}
