import { useState } from "react";
import {
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
    TOKEN_PROGRAM_ID,
    createMintToInstruction
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";

export function MintToken({ mintAddress, onDone }) {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");

    async function mint() {
        try {
            if (!recipient) {
                alert("Please enter a recipient address");
                return;
            }
            if (!amount || isNaN(amount) || Number(amount) <= 0) {
                alert("Please enter a valid token amount");
                return;
            }

            const recipientPubKey = new PublicKey(recipient);

            const associatedToken = getAssociatedTokenAddressSync(
                mintAddress,
                recipientPubKey,
                false,
                TOKEN_PROGRAM_ID
            );

            console.log("Associated token account:", associatedToken.toBase58());

            // Create ATA
            const transaction = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,    // payer
                    associatedToken,     // ATA
                    recipientPubKey,     // owner
                    mintAddress,         // mint
                    TOKEN_PROGRAM_ID
                )
            );

            await wallet.sendTransaction(transaction, connection);

            // Convert amount to smallest units (assuming mint has 9 decimals)
            const amountInSmallestUnit = Number(amount) * 10 ** 9;

            // Mint tokens
            const mintTransaction = new Transaction().add(
                createMintToInstruction(
                    mintAddress,
                    associatedToken,
                    wallet.publicKey,    // mint authority
                    amountInSmallestUnit,
                    [],
                    TOKEN_PROGRAM_ID
                )
            );

            await wallet.sendTransaction(mintTransaction, connection);
            console.log(`✅ Minting done for token ${mintAddress.toBase58()}`);
            onDone();
        } catch (err) {
            console.error("❌ Mint failed:", err);
            alert("Mint failed: " + err.message);
        }
    }

    return (
        <div className="flex flex-wrap items-center space-x-4 max-w-md mx-auto mt-4">
            <input
                type="text"
                placeholder="Recipient wallet address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-28 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                min="0"
                step="any"
            />
            <button
                onClick={mint}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mt-4"
            >
                Mint tokens
            </button>
        </div>
    );
}
