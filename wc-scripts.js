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

    // Ensure Base chain (ID: 8453)
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }],
    });
  } catch (err) {
    console.error(err);
    alert("Failed to connect wallet!");
  }
});

function showWallet(addr) {
  document.getElementById("addr").innerText = addr;
  document.getElementById("chain").innerText = "Connected to Base";
}

// Actions for all contracts
const actions = {};

for (const [name, { abi, address }] of Object.entries(CONTRACTS)) {
  actions[name] = {};
  const contract = new web3.eth.Contract(abi, address);

  abi.forEach(fn => {
    if (fn.type === "function" && fn.stateMutability !== "view" && fn.stateMutability !== "pure") {
      const fnName = fn.name;

      actions[name][fnName] = async () => {
        try {
          if (!accounts || !accounts[0]) {
            throw new Error("Wallet not connected");
          }

          const inputs = fn.inputs.map(input => {
            const el = document.getElementById(`${name}_${fnName}_${input.name || "value"}`);
            if (!el || !el.value) throw new Error(`Missing input for ${input.name || "value"}`);
            return input.type === "uint256" ? parseInt(el.value) : el.value;
          });

          const statusEl = document.getElementById(`${name}_${fnName}_status`);
          statusEl.innerText = "Waiting for wallet confirmation...";

          const options = { from: accounts[0] };
          if (fn.stateMutability === "payable") {
            const valueEl = document.getElementById(`${name}_${fnName}_value`);
            if (!valueEl || !valueEl.value) throw new Error("Missing ETH amount");
            options.value = web3.utils.toWei(valueEl.value, "ether");
          }

          // Estimate gas and send transaction
          const gas = await contract.methods[fnName](...inputs).estimateGas(options);
          const tx = await contract.methods[fnName](...inputs).send({
            ...options,
            gas,
            gasPrice: await web3.eth.getGasPrice(),
          });

          statusEl.innerText = `Tx: ${tx.transactionHash}`;
          document.getElementById("txLog").innerText += `Tx [${name}.${fnName}]: ${tx.transactionHash}\n`;
        } catch (err) {
          console.error(err);
          const statusEl = document.getElementById(`${name}_${fnName}_status`);
          statusEl.innerText = `Error: ${err.message}`;
        }
      };
    }
  });
}
