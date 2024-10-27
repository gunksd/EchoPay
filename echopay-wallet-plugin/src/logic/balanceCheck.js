// JavaScript logic (balanceCheck.js)
import Web3 from 'web3';

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'));

// Define ABI for ERC-20 balance check
const minABI = [
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function",
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function",
  },
];

export const checkBalance = async (address, tokenContractAddress, setBalance, setTokenBalance, setError) => {
  setError(null);
  try {
    if (web3.utils.isAddress(address)) {
      // Fetch ETH Balance
      const balanceWei = await web3.eth.getBalance(address);
      const etherBalance = web3.utils.fromWei(balanceWei, 'ether');
      setBalance(`${etherBalance} ETH`);

      // Fetch ERC-20 Token Balance
      const tokenContract = new web3.eth.Contract(minABI, tokenContractAddress);
      const tokenBal = await tokenContract.methods.balanceOf(address).call();
      const decimals = await tokenContract.methods.decimals().call();
      const formattedTokenBalance = tokenBal / Math.pow(10, decimals);
      setTokenBalance(`${formattedTokenBalance} TOKEN_NAME`);
    } else {
      setError('Please enter a valid Ethereum address.');
    }
  } catch (err) {
    if (err.message.includes('network')) {
      setError('Network error: Failed to connect to the blockchain. Please check your internet connection and try again.');
    } else if (err.message.includes('contract')) {
      setError('Contract error: Unable to communicate with the token contract. Please verify the token contract address.');
    } else {
      setError('An unexpected error occurred. Please try again later.');
    }
    console.error(err);
  }
};
