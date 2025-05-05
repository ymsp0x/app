import { useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaCopy, FaSpinner } from "react-icons/fa";
import Identicon from "../components/Identicon";
import Toast from "../components/Toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Example default metadata, you should generate or upload your own metadata & image per mint
const defaultTokenURI = "https://ipfs.io/ipfs/<your-metadata-cid>";

export default function TwitterProof() {
  const [status, setStatus] = useState("");
  const [proof, setProof] = useState("");
  const [telegramId, setTelegramId] = useState<string>("");
  const [wallet, setWallet] = useState("");
  const [mintTx, setMintTx] = useState("");
  const [step, setStep] = useState<1|2|3|4>(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{show:boolean, msg:string}>({show:false, msg:""});

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initDataUnsafe) {
      setTelegramId((window as any).Telegram.WebApp.initDataUnsafe.user?.id?.toString() || "");
    }
  }, []);

  useEffect(() => {
    if (telegramId) {
      axios.get(`${API_URL}/api/twitterproof/status?telegram_id=${telegramId}`)
        .then(res => {
          setStatus(res.data.status);
          if (res.data.status === "verified") setStep(3);
        })
        .catch(() => setStatus("none"));
    }
  }, [telegramId]);

  async function submitProof() {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/twitterproof/submit`, {
        telegram_id: telegramId,
        proofData: proof,
        meta: "{}",
      });
      setStatus("Submitted, verifying...");
      setStep(2);
      let tries = 0;
      while (tries < 10) {
        const res = await axios.get(`${API_URL}/api/twitterproof/status?telegram_id=${telegramId}`);
        if (res.data.status === "verified") {
          setStatus("verified");
          setStep(3);
          break;
        }
        if (res.data.status === "invalid" || res.data.status === "error") {
          setStatus("Invalid proof");
          setStep(2);
          break;
        }
        await new Promise(r => setTimeout(r, 2000));
        tries++;
      }
      if (tries === 10) setStatus("Verification timed out.");
    } catch {
      setStatus("Failed to submit proof");
    }
    setLoading(false);
  }

  async function mintNFT() {
    setLoading(true);
    setMintTx("");
    setStatus("Minting...");
    try {
      const r = await axios.post(`${API_URL}/api/mint`, { telegram_id: telegramId, wallet, tokenURI: defaultTokenURI });
      if (r.data.success) {
        setMintTx(r.data.txHash);
        setStatus("NFT minted!");
        setStep(4);
        setToast({show:true,msg:"NFT minted! Check your wallet"});
      } else {
        setStatus(r.data.error);
        setStep(3);
        setToast({show:true,msg:"Mint failed: "+r.data.error});
      }
    } catch {
      setStatus("Mint failed");
      setToast({show:true,msg:"Mint failed"});
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181c2f] to-[#2e3159] flex flex-col items-center justify-center font-mono px-4 py-6">
      <Toast show={toast.show} msg={toast.msg} onHide={()=>setToast({show:false,msg:""})} />
      <div className="w-full max-w-md bg-white/10 rounded-xl shadow-xl p-6 backdrop-blur-md border border-white/20">
        <div className="flex justify-between mb-6">
          <Step active={step>=1} label="1. Proof" />
          <Step active={step>=2} label="2. Verification" />
          <Step active={step>=3} label="3. Mint" />
          <Step active={step===4} label="4. Success" />
        </div>

        <ProofInstructions />

        {step === 1 && <>
          <textarea
            className="w-full rounded-lg bg-black/30 text-white p-3 border border-white/20 mb-4"
            rows={5}
            value={proof}
            onChange={e => setProof(e.target.value)}
            placeholder="Paste your Twitter WebProof JSON here"
          />
          <button
            className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg font-bold text-lg text-white shadow hover:scale-105 transition"
            onClick={submitProof}
            disabled={loading || !proof}
          >
            {loading ? <FaSpinner className="animate-spin inline" /> : "Submit Proof"}
          </button>
        </>}

        {step === 2 && (
          <div className="flex flex-col items-center gap-4">
            {loading ? <FaSpinner className="animate-spin text-3xl text-blue-400" /> : null}
            <div className="text-white text-xl">{status}</div>
          </div>
        )}

        {step >= 3 && status === "verified" && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              className="w-full rounded-lg bg-black/30 text-white p-3 border border-white/20"
              placeholder="0x... wallet address"
              value={wallet}
              onChange={e => setWallet(e.target.value)}
            />
            <div className="flex items-center gap-2">
              {wallet && <Identicon address={wallet} size={8}/>}
              <span className="text-xs text-gray-300">{wallet.slice(0,6)}...{wallet.slice(-4)}</span>
            </div>
            <button
              className="w-full py-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg font-bold text-lg text-white shadow hover:scale-105 transition"
              onClick={mintNFT}
              disabled={loading || !wallet}
            >
              {loading ? <FaSpinner className="animate-spin inline" /> : "Mint NFT"}
            </button>
            <div className="text-white">{status}</div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4 items-center">
            <FaCheck className="text-green-400 text-4xl" />
            <div className="text-white text-lg font-bold">NFT minted to:</div>
            <span className="text-green-100 flex items-center gap-2">{wallet && <Identicon address={wallet} size={8}/>} {wallet}</span>
            {mintTx && (
              <div className="flex items-center gap-2">
                <a className="underline text-blue-200" href={`https://sepolia-optimism.etherscan.io/tx/${mintTx}`} target="_blank" rel="noopener noreferrer">
                  View on Etherscan
                </a>
                <button
                  className="ml-2 text-white bg-black/20 px-2 py-1 rounded hover:bg-black/40"
                  onClick={() => {navigator.clipboard.writeText(mintTx);setToast({show:true,msg:"Tx hash copied!"})}}
                >
                  <FaCopy />
                </button>
              </div>
            )}
          </div>
        )}

        {status && status.startsWith("Invalid") && (
          <div className="text-red-400 mt-4">{status}</div>
        )}
      </div>
      <div className="mt-8 text-gray-400 text-xs text-center">
        Powered by <span className="font-bold text-blue-200">vlayer</span> | Built by your team
      </div>
    </div>
  );
}

function Step({active, label}:{active:boolean,label:string}) {
  return (
    <span className={`px-2 py-1 rounded-lg text-sm ${active ? "bg-gradient-to-r from-green-400 to-blue-500 text-white" : "bg-gray-700 text-gray-400"}`}>
      {label}
    </span>
  );
}

function ProofInstructions() {
  return (
    <div className="bg-blue-50 p-3 rounded-lg mb-4 text-blue-900 flex flex-col gap-1 text-sm">
      <b>How to get your Twitter WebProof:</b>
      <ol className="list-decimal pl-4">
        <li>Install the <a href="https://chrome.google.com/webstore/detail/vlayer-webproof/..." target="_blank" className="underline text-blue-700">vlayer WebProof extension</a> in your browser.</li>
        <li>Open your Twitter/X profile page in your browser.</li>
        <li>Click the vlayer extension icon, then click <b>“Generate WebProof”</b>.</li>
        <li>Copy the entire JSON proof result.</li>
        <li>Paste it into the box below and click <b>Submit Proof</b>.</li>
      </ol>
      <a className="text-blue-700 underline mt-1 text-xs" href="https://docs.vlayer.xyz/user-guide/webproof" target="_blank">See video/gif tutorial</a>
    </div>
  );
}
