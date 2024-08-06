import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"
import path from "path"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Upload the image
        const image = await readFile(path.join(__dirname, "/rug.png"));
        const umiImageFile = createGenericFile(image, "rug.png", {
            contentType: "image/png",
        });
        const [imageUri] = await umi.uploader.upload([umiImageFile]);
        console.log("Your image URI: ", imageUri);

        // Create and upload the metadata
        const metadata = {
            name: "Persian Rug",
            symbol: "RUG",
            description: "Soft and hand-made.",
            image: imageUri,
            attributes: [
                {trait_type: 'Style', value: 'Elegant'}
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: imageUri
                    },
                ]
            },
            creators: [
                {
                    address: keypair.publicKey,
                    share: 100
                }
            ]
        };

        const metadataFile = createGenericFile(
            Buffer.from(JSON.stringify(metadata)),
            "metadata.json",
            {
                contentType: "application/json",
            }
        );
        const [metadataUri] = await umi.uploader.upload([metadataFile]);

        console.log("Your metadata URI: ", metadataUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();