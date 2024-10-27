// React Component (frontend - App.js)
import React, { useState } from 'react';
import Web3 from 'web3';
import './App.css';

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_INFURA_PROJECT_URL));

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

const knownTokens = [
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'USDT', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  { address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', name: 'USDC', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'DAI', logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' },
  { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', name: 'LINK', logo: 'https://cryptologos.cc/logos/chainlink-link-logo.png' },
  { address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', name: 'SHIBA', logo: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png' },
  { address: '0x111111111117dc0aa78b770fa6a738034120c302', name: '1INCH', logo: 'https://cryptologos.cc/logos/1inch-1inch-logo.png' },
  { address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF', name: 'BAT', logo: 'https://cryptologos.cc/logos/basic-attention-token-bat-logo.png' },
  { address: '0xC011a72400E58ecD99Ee497CF89E3775d4bd732F', name: 'SNX', logo: 'https://cryptologos.cc/logos/synthetix-snx-logo.png' },
  { address: '0xD533a949740bb3306d119CC777fa900bA034cd52', name: 'CRV', logo: 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png' },
  { address: '0xE41d2489571d322189246DaFA5ebDe1F4699F498', name: 'ZRX', logo: 'https://cryptologos.cc/logos/0x-zrx-logo.png' },
  { address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', name: 'YFI', logo: 'https://cryptologos.cc/logos/yearn-finance-yfi-logo.png' },
  { address: '0x7BeBd226154E865954A87650FAefa9F772B980C0', name: 'REN', logo: 'https://cryptologos.cc/logos/ren-ren-logo.png' },
  { address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', name: 'LDO', logo: 'https://cryptologos.cc/logos/lido-dao-ldo-logo.png' },
  { address: '0x408e41876cCCDC0F92210600ef50372656052a38', name: 'REN', logo: 'https://cryptologos.cc/logos/ren-ren-logo.png' },
  { address: '0x4fabb145d64652a948d72533023f6e7a623c7c53', name: 'BUSD', logo: 'https://cryptologos.cc/logos/binance-usd-busd-logo.png' },
  { address: '0x6c6EE5e31d828De241282B9606C8e98Ea48526E2', name: 'HOT', logo: 'https://cryptologos.cc/logos/holotoken-hot-logo.png' },
  { address: '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd', name: 'LRC', logo: 'https://cryptologos.cc/logos/loopring-lrc-logo.png' },
  { address: '0x0000000000085d4780B73119b644AE5ecd22b376', name: 'TUSD', logo: 'https://cryptologos.cc/logos/trueusd-tusd-logo.png' },
  { address: '0xb8c77482e45f1f44de1745f52c74426c631bdd52', name: 'BNB', logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png' },
];

const App = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(null);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // 添加加载状态

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleCheckBalance = async () => {
    setError(null);
    setIsLoading(true);
    setBalance(null);
    setTokenBalances([]);

    try {
      if (!web3.utils.isAddress(address)) {
        setError('Please enter a valid Ethereum address.');
        setIsLoading(false);
        return;
      }

      // 查询 ETH 余额
      const balanceWei = await web3.eth.getBalance(address);
      const etherBalance = web3.utils.fromWei(balanceWei, 'ether');
      setBalance(`${etherBalance} ETH`);

      // 查询 ERC-20 代币余额
      const balances = await Promise.all(knownTokens.map(async (token) => {
        try {
          console.log(`Fetching balance for token: ${token.name}`);
          const tokenContract = new web3.eth.Contract(minABI, token.address);
          const tokenBal = await tokenContract.methods.balanceOf(address).call();
          console.log(`${token.name} raw balance: ${tokenBal}`);
          const decimals = await tokenContract.methods.decimals().call();
          console.log(`${token.name} decimals: ${decimals}`);
          const formattedTokenBalance = parseFloat(web3.utils.fromWei(tokenBal, 'ether')) / Math.pow(10, Number(decimals));
          if (formattedTokenBalance > 0) {
            return { name: token.name, balance: formattedTokenBalance.toFixed(Number(decimals)), logo: token.logo };
          } else {
            return null;
          }
        } catch (tokenError) {
          console.error(`Failed to fetch balance for ${token.name}`, tokenError);
          return null;
        }
      }));
      setTokenBalances(balances.filter(balance => balance !== null));
    } catch (err) {
      console.error('Error occurred during balance check:', err);
      if (err.message.includes('Invalid JSON RPC response')) {
        setError('Network error: Unable to connect to Ethereum network. Please check your connection or Infura setup.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App" style={{ fontFamily: 'Arial, sans-serif', color: '#000', padding: '20px', backgroundImage: 'url(https://source.unsplash.com/1600x900/?technology,network)', backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
      <div 
        className="container" 
        style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          padding: '30px', 
          backgroundColor: 'rgba(255, 255, 255, 0.85)', 
          borderRadius: '16px', 
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)';
          e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
        }}
      >
        <h1 style={{ color: '#333', marginBottom: '20px', textAlign: 'center', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>EchoPay Wallet Plugin Prototype</h1>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Enter recipient address"
          style={{ 
            width: 'calc(100% - 20px)', 
            padding: '10px', 
            marginBottom: '20px', 
            borderRadius: '8px', 
            border: '1px solid #ccc', 
            backgroundColor: '#fafafa', 
            color: '#000',
            boxSizing: 'border-box'
          }}
        />
        <button 
          onClick={handleCheckBalance} 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: isLoading ? '#888' : '#333', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s, transform 0.3s'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isLoading ? 'Checking...' : 'Check Balance'}
        </button>
        <div className="result" style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f7f7f7', borderRadius: '8px', textAlign: 'left' }}>
          {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
          {balance && <p style={{ fontSize: '1.2em', marginTop: '20px' }}>ETH Balance: <strong>{balance}</strong></p>}
          {tokenBalances.length > 0 && (
            <div>
              <h2 style={{ color: '#333', marginTop: '20px', fontSize: '1.2em' }}>Token Balances:</h2>
              {tokenBalances.map((token, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '10px' }}>
                  <img src={token.logo} alt={token.name} style={{ width: '24px', height: '24px', marginRight: '10px' }} />
                  <p style={{ fontSize: '1.1em' }}>{token.name}: <strong>{token.balance}</strong></p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
