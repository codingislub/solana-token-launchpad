import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import { TokenLaunchpad } from './CreateToken';
import { useMemo, useState } from 'react';
import { MintToken } from './MintToken';

function DashBoard() {
  const [token, setToken] = useState(null);
  const [mintDone, setMintDone] = useState(false);

  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <div className="min-h-screen bg-blue-200 py-10">
      <ConnectionProvider endpoint={"https://solana-devnet.g.alchemy.com/v2/BspYJpJfbii0agjr2PYehlH34cbw9YbK"}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md font-sans text-center">

              <h1 className="text-3xl font-semibold mb-6 text-blue-700">
                Solana Token Dashboard
              </h1>

              <div className="flex justify-center space-x-3 mb-4">
                <WalletMultiButton className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" />
                <WalletDisconnectButton className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition" />
              </div>

              <div className="mb-6">
                <TokenLaunchpad onTokenCreate={(tokenMint) => {
                  setToken(tokenMint);
                  setMintDone(false);
                }} />
              </div>

              {token && (
                <div className="border border-gray-300 rounded p-4 mb-4 break-words bg-blue-50 text-blue-900 font-mono text-sm">
                  <strong>Token Mint Address:</strong><br />{token.toBase58()}
                </div>
              )}

              {token && (
                <div className="mb-4">
                  <MintToken onDone={() => setMintDone(true)} mintAddress={token} />
                </div>
              )}

              {mintDone && (
                <div className="text-green-700 font-bold text-lg">
                  🎉 Minting completed successfully!
                </div>
              )}

            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

export default DashBoard;
