import { useEffect, useState, useRef } from "react";
import Signup from "./Signup";

const BASE_URL = "http://192.168.0.111:3000";

export default function App() {
     const [status, setStatus] = useState("Waiting for RFID scan...");
     const [cardStatus, setCardStatus] = useState("");
     const [dataKartu, setDataKartu] = useState(null);
     const [distance, setDistance] = useState(0);
     const [calories, setCalories] = useState(0);
     const [showResult, setShowResult] = useState(false);
     const [sessionEnded, setSessionEnded] = useState(false);
     const [openModal, setOpenModal] = useState(false);
     const [cardId, setCardId] = useState(null);
     const pollRef = useRef(null);

     // Cleanup saat unmount atau ganti polling
     useEffect(() => {
          return () => clearInterval(pollRef.current);
     }, []);

     const startMonitoring = () => {
    clearInterval(pollRef.current);
    setStatus("⏳ Menunggu kartu RFID...");
    setCardStatus("");
    setShowResult(false);
    setSessionEnded(false);

    let attempt = 0;
    pollRef.current = setInterval(async () => {
        attempt++;
        try {
            const res = await fetch(`${BASE_URL}/scan/card`);
            if (!res.ok) {
                if (attempt > 15) {
                    clearInterval(pollRef.current);
                    setStatus("⛔ Tidak ada kartu terdeteksi.");
                }
                return;
            }
            const { cardId } = await res.json();
            clearInterval(pollRef.current);
            localStorage.setItem("activeCardId", cardId);
            setCardId(cardId);

            const checkRes = await fetch(
                `${BASE_URL}/sessions/check-user`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cardId }),
                }
            );
            const { userExists } = await checkRes.json();
            if (userExists) {
                setCardStatus("✅ Kartu terbaca! Silakan mulai olahraga.");
                setDataKartu({ cardId });
                setStatus("🚴 Monitoring sesi...");
                setTimeout(startEndPolling, 1500);
            } else {
                setOpenModal(true);
            }
        } catch (err) {
            console.error("Polling error:", err);
            clearInterval(pollRef.current);
            setStatus("❌ Terjadi kesalahan polling.");
        }
    }, 2000);
};

const startEndPolling = () => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
        try {
            console.log("Polling for active session...");
            const res = await fetch(`${BASE_URL}/sessions/active-latest`);
            const data = await res.json();
            console.log("Polling response data:", data);

            if (res.status === 404 && !sessionEnded) {
                clearInterval(pollRef.current);
                setSessionEnded(true);
                setCardStatus("✅ Sesi berakhir.");
                setStatus("⏳ Mengambil hasil latihan...");
                setTimeout(() => fetchFinalSession(cardId), 1500);
            }
        } catch (err) {
            console.error("Polling error:", err);
            clearInterval(pollRef.current);
        }
    }, 2000);
};


const fetchFinalSession = async (cardId) => {
    if (!cardId) {
        console.error("Card ID is invalid");
        alert("Card ID tidak valid.");
        setStatus("❌ Card ID tidak valid.");
        return;
    }

    const res = await fetch(`${BASE_URL}/sessions/${cardId}`);
    if (!res.ok) {
        console.log("Error fetching session:", res.statusText);
        setStatus("❌ Gagal mengambil data sesi.");
        return;
    }

    const data = await res.json();
    if (data.sessions && data.sessions.length > 0) {
        const session = data.sessions[0];
        setDistance(session.distance);
        setCalories(session.calories);
        setShowResult(true);
        setStatus("✅ Sesi selesai.");
    } else {
        alert("❌ Sesi tidak ditemukan.");
        setStatus("❌ Sesi tidak ditemukan.");
    }
};



     const promptUpdateWeight = () => {
          if (!cardId) return alert("Scan kartu dulu sebelum update berat.");
          const input = prompt("Masukkan berat badan terbaru (kg):");
          const w = Number(input);
          if (!input || isNaN(w)) return alert("Input tidak valid.");
          fetch(`${BASE_URL}/users/${cardId}`, {
               method: "PUT",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ weight: w }),
          })
               .then(async (res) => {
                    const { message } = await res.json();
                    alert(
                         res.ok
                              ? "✅ Berat berhasil diperbarui!"
                              : `❌ ${message}`
                    );
               })
               .catch((e) => {
                    console.error(e);
                    alert("❌ Error updating weight.");
               });
     };

     useEffect(() => {
          if (dataKartu) {
               // bisa fetch latest session atau data user di sini
               console.log("Data kartu:", dataKartu);
          }
     }, [dataKartu]);

     return (
          <div className="app-container">
               <header>
                    <h1>SEPEDA STATIS</h1>
               </header>
               <main className="main-content">
                    <button onClick={startMonitoring}>Mulai Monitoring</button>
                    <button onClick={promptUpdateWeight}>
                         Update Berat Badan
                    </button>
                    <p className="status-text">{status}</p>
                    <p className="card-status-text">{cardStatus}</p>
                    {showResult && (
                         <div className="result-box">
                              <p>
                                   <strong>Distance:</strong> {distance} m
                              </p>
                              <p>
                                   <strong>Calories:</strong> {calories} kcal
                              </p>
                         </div>
                    )}
               </main>
               <footer>
                    <p>&copy; 2025 Fitness Tracker</p>
               </footer>

               {openModal && cardId && (
                    <Signup
                         cardId={cardId}
                         onClose={() => setOpenModal(false)}
                    />
               )}

               <style jsx>{`
                    body {
                         font-family: "Arial", sans-serif;
                         background: linear-gradient(135deg, #6a5acd, #8a2be2);
                         color: white;
                         display: flex;
                         justify-content: center;
                         align-items: center;
                         height: 100vh;
                         margin: 0;
                    }

                    .app-container {
                         text-align: center;
                         width: 100%;
                         max-width: 800px;
                         padding: 20px;
                         box-sizing: border-box;
                    }

                    header h1 {
                         color: #fff;
                         font-size: 36px;
                    }

                    .main-content {
                         background-color: rgba(255, 255, 255, 0.2);
                         padding: 20px;
                         border-radius: 10px;
                         box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }

                    button {
                         background-color: #4b0082;
                         color: white;
                         padding: 10px 20px;
                         border: none;
                         border-radius: 5px;
                         font-size: 16px;
                         cursor: pointer;
                         margin: 10px;
                    }

                    button:hover {
                         background-color: #5a2d99;
                    }

                    .status-text,
                    .card-status-text {
                         font-weight: bold;
                         margin-top: 20px;
                    }

                    .result-box {
                         margin-top: 20px;
                         padding: 10px;
                         background-color: #fff;
                         color: #333;
                         border-radius: 5px;
                         box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }

                    footer {
                         margin-top: 20px;
                         font-size: 14px;
                    }
               `}</style>
          </div>
     );
}
