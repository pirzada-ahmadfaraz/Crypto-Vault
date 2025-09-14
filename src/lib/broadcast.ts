/**
 * Broadcast a raw Litecoin transaction using BlockCypher
 */
const BLOCKCYPHER_API = "https://api.blockcypher.com/v1";

export async function broadcastLitecoinTx(
  txHex: string
): Promise<{ success: boolean; txId?: string; error?: string }> {
  try {
    const res = await fetch(`${BLOCKCYPHER_API}/ltc/main/txs/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tx: txHex }),
    });

    const data = await res.json();

    if (res.ok && data.tx && data.tx.hash) {
      console.log("📡 Broadcast success:", data.tx.hash);
      return { success: true, txId: data.tx.hash };
    } else {
      console.error("❌ Broadcast error:", data);
      return { success: false, error: JSON.stringify(data) };
    }
  } catch (err) {
    console.error("⚠️ Broadcast failed:", err);
    return { success: false, error: String(err) };
  }
}
