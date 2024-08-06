import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../wba-wallet.json"
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

(async () => {
    try {
        const metadataUri = "https://arweave.net/qQNc7iYksPpwuMu6Q8vWJ7iKz93FdXvfCyQtnkHxIzc";

        let tx = await createNft(
            umi, 
            {
                mint, 
                name: "Persian Rug",
                symbol: "PRUG",  
                uri: metadataUri, 
                sellerFeeBasisPoints: percentAmount(1),
                creators: [
                    {
                        address: myKeypairSigner.publicKey,
                        share: 100,
                        verified: false,
                    }
                ],
            }
        );
        
        let result = await tx.sendAndConfirm(umi);
        
        const signature = base58.encode(result.signature);
        
        console.log(`Successfully Minted! Check out your TX here:`);
        console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        console.log("Mint Address: ", mint.publicKey.toString());
    } catch (error) {
        console.error("Error minting NFT:", error);
    }
})();