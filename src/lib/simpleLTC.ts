
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
import { broadcastLitecoinTx } from "./broadcast";

const ECPair = ECPairFactory(ecc);

const LITECOIN_NETWORK = {
  messagePrefix: "\x19Litecoin Signed Message:\n",
  bech32: "ltc",
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe,
  },
  pubKeyHash: 0x30,
  scriptHash: 0x32,
  wif: 0xb0,
};

const BLOCKCYPHER_API = "https://api.blockcypher.com/v1";

export async function sendLitecoinNow(
  fromAddress: string,
  toAddress: string,
  amount: number, // in litoshis
  wif: string
): Promise<{ success: boolean; txHex?: string; txId?: string; error?: string }> {
  try {
    console.log(
      `🔥 Sending ${(amount / 1e8).toFixed(8)} LTC from ${fromAddress} to ${toAddress}`
    );

    const utxoResp = await fetch(
      `${BLOCKCYPHER_API}/ltc/main/addrs/${fromAddress}?unspentOnly=true&limit=50`
    );
    const utxoData = await utxoResp.json();

    if (!utxoData.txrefs || utxoData.txrefs.length === 0) {
      return { success: false, error: "No UTXOs available" };
    }

    const utxo = utxoData.txrefs[0];
    console.log(
      `✅ Using UTXO ${utxo.tx_hash}:${utxo.tx_output_n} = ${utxo.value} litoshis`
    );

    const prevResp = await fetch(
      `${BLOCKCYPHER_API}/ltc/main/txs/${utxo.tx_hash}?includeHex=true`
    );
    const prevData = await prevResp.json();
    if (!prevData.hex) {
      return { success: false, error: "Failed to fetch prev tx hex" };
    }

    const keyPair = ECPair.fromWIF(wif, LITECOIN_NETWORK);

    const derivedAddr = bitcoin.payments.p2pkh({
      pubkey: Buffer.from(keyPair.publicKey),
      network: LITECOIN_NETWORK,
    }).address;

    if (derivedAddr !== fromAddress) {
      return {
        success: false,
        error: `WIF does not match fromAddress (got ${derivedAddr})`,
      };
    }

    const psbt = new bitcoin.Psbt({ network: LITECOIN_NETWORK });

    psbt.addInput({
      hash: utxo.tx_hash,
      index: utxo.tx_output_n,
      nonWitnessUtxo: Buffer.from(prevData.hex, "hex"),
    });

    const fee = 10000;
    const change = utxo.value - amount - fee;

    if (change < 0) {
      return { success: false, error: "Insufficient funds for amount + fee" };
    }

    psbt.addOutput({ address: toAddress, value: amount });

    if (change > 0) {
      psbt.addOutput({ address: fromAddress, value: change });
    }

    const signer = {
      publicKey: Buffer.from(keyPair.publicKey),
      sign: (hash: Buffer) => Buffer.from(keyPair.sign(hash)),
    };

    psbt.signInput(0, signer);
    psbt.validateSignaturesOfAllInputs((pubkey, msghash, signature) =>
      keyPair.verify(msghash, signature)
    );
    psbt.finalizeAllInputs();

    const tx = psbt.extractTransaction();
    const txHex = tx.toHex();
    const txId = tx.getId();

    console.log("🎉 Transaction built:", txId);
    console.log("Hex:", txHex);

    const broadcastResult = await broadcastLitecoinTx(txHex);

    if (broadcastResult.success) {
      return { success: true, txHex, txId: broadcastResult.txId };
    } else {
      return {
        success: false,
        txHex,
        txId,
        error: broadcastResult.error,
      };
    }
  } catch (err) {
    console.error("Simple send failed:", err);
    return { success: false, error: String(err) };
  }
}
