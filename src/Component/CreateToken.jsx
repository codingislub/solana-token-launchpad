import { useState } from "react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
    MINT_SIZE, 
    TOKEN_PROGRAM_ID, 
    createInitializeMint2Instruction, 
    getMinimumBalanceForRentExemptMint 
} from "@solana/spl-token";

export function TokenLaunchpad({ onTokenCreate }) {
    const { connection } = useConnection();
    const wallet = useWallet();

    // State for inputs
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [initialSupply, setInitialSupply] = useState("");

    async function createToken() {
        if (!wallet.publicKey) {
            alert("Please connect your wallet before creating a token.");
            return;
        }

        try {
            const mintKeypair = Keypair.generate();
            const lamports = await getMinimumBalanceForRentExemptMint(connection);

            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    space: MINT_SIZE,
                    lamports,
                    programId: TOKEN_PROGRAM_ID,
                }),
                createInitializeMint2Instruction(
                    mintKeypair.publicKey, // mint address
                    9,                     // decimals
                    wallet.publicKey,      // mint authority
                    wallet.publicKey,      // freeze authority
                    TOKEN_PROGRAM_ID
                )
            );

            transaction.feePayer = wallet.publicKey;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            transaction.partialSign(mintKeypair);

            await wallet.sendTransaction(transaction, connection);
            console.log(`✅ Token mint created at ${mintKeypair.publicKey.toBase58()}`);

            // Optionally you can pass the metadata too, but your on-chain program needs to support it
            onTokenCreate(mintKeypair.publicKey);
        } catch (err) {
            console.error("❌ Token creation failed:", err);
            alert("Token creation failed: " + err.message);
        }
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md flex flex-col space-y-4 font-sans">
            <h1 className="text-2xl font-semibold text-center text-blue-700">Solana Token Launchpad</h1>

            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
                type="text"
                placeholder="Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
                type="text"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
                type="number"
                placeholder="Initial Supply"
                value={initialSupply}
                onChange={(e) => setInitialSupply(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                min={0}
            />

            <button
                onClick={createToken}
                className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
            >
                Create a token
            </button>
        </div>
    );
}
