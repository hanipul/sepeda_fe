import { useEffect, useState } from "react";

const BASE_URL = "http://192.168.18.198:3000";

function App() {
     const [status, setStatus] = useState("Waiting for RFID scan...");
     const [cardStatus, setCardStatus] = useState("");
     const [dataKartu, setDataKartu] = useState(null);
     const [distance, setDistance] = useState(0);
     const [calories, setCalories] = useState(0);
     const [showResult, setShowResult] = useState(false);
     const [polling, setPolling] = useState(null);
     const [sessionEnded, setSessionEnded] = useState(false);

     const startMonitoring = () => {
          setStatus("⏳ Menunggu kartu RFID...");
          setCardStatus("");
          setShowResult(false);
          setSessionEnded(false);

          let attempt = 0;
          const interval = setInterval(async () => {
               try {
                    const res = await fetch(`${BASE_URL}/scan/card`);
                    attempt++;

                    if (res.ok) {
                         const data = await res.json();
                         clearInterval(interval);
                         localStorage.setItem("activeCardId", data.cardId);

                         const checkRes = await fetch(
                              `${BASE_URL}/sessions/check-user`,
                              {
                                   method: "POST",
                                   headers: {
                                        "Content-Type": "application/json",
                                   },
                                   body: JSON.stringify({
                                        cardId: data.cardId,
                                   }),
                              }
                         );

                         const checkData = await checkRes.json();

                         if (checkData.userExists) {
                              setCardStatus(
                                   "✅ Kartu terbaca! Silakan mulai olahraga."
                              );
                              setDataKartu(data);
                              setStatus("🚴 Monitoring sesi...");
                              setTimeout(() => startEndPolling(), 1500);
                         } else {
                              window.location.href = "/signup";
                         }
                    }

                    if (attempt > 15) {
                         clearInterval(interval);
                         setStatus("⛔ Tidak ada kartu terdeteksi.");
                    }
               } catch (err) {
                    console.error("Polling error:", err);
               }
          }, 2000);

          setPolling(interval);
     };

     const startEndPolling = () => {
          const interval = setInterval(async () => {
               try {
                    const res = await fetch(
                         `${BASE_URL}/sessions/active-latest`
                    );
                    if (res.status === 404 && !sessionEnded) {
                         setSessionEnded(true);
                         clearInterval(interval);

                         const cardId = localStorage.getItem("activeCardId");
                         setCardStatus("✅ Sesi berakhir.");
                         setStatus("⏳ Mengambil hasil latihan...");

                         setTimeout(() => fetchFinalSession(cardId), 1500);
                    }
               } catch (err) {
                    console.error("Polling error on end:", err);
               }
          }, 2000);

          setPolling(interval);
     };

     const fetchFinalSession = async (cardId) => {
          try {
               const res = await fetch(`${BASE_URL}/sessions/${cardId}`);
               const data = await res.json();
               if (data.sessions && data.sessions.length > 0) {
                    const session = data.sessions[0];
                    setStatus("✅ Sesi selesai.");
                    setDistance(session.distance?.toFixed(2) ?? "0");
                    setCalories(session.calories?.toFixed(2) ?? "0");
                    setShowResult(true);
               } else {
                    alert("❌ Sesi tidak ditemukan.");
               }
          } catch (err) {
               console.error("❌ Gagal ambil sesi:", err);
               alert("Gagal mengambil data sesi.");
          }
     };

     const promptUpdateWeight = () => {
          const cardId = localStorage.getItem("activeCardId");
          if (!cardId) return alert("Scan kartu dulu sebelum update berat.");

          const newWeight = prompt("Masukkan berat badan terbaru (kg):");
          if (newWeight && !isNaN(newWeight)) {
               fetch(`${BASE_URL}/users/${cardId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ weight: Number(newWeight) }),
               })
                    .then(async (res) => {
                         const data = await res.json();
                         if (res.ok) {
                              alert("✅ Berat badan berhasil diperbarui!");
                         } else {
                              alert("❌ Gagal update: " + data.message);
                         }
                    })
                    .catch((err) => {
                         console.error(err);
                         alert("Terjadi kesalahan saat mengupdate.");
                    });
          } else {
               alert("Input tidak valid.");
          }
     };

     const fetchLatestUserSesion = async () => {
          try {
               const res = await fetch(
                    `${BASE_URL}/sessions/latest/${dataKartu.cardId}`
               );
               if (res.ok) {
                    const data = await res.json();
                    console.log(
                         "---------------Latest session data ----------- :",
                         data
                    );
               } else {
                    console.error("Failed to fetch latest session.");
               }
          } catch (error) {
               console.error("Error fetching latest user session:", error);
               alert("Gagal mengambil data sesi terbaru.");
          }
     };

     useEffect(() => {
          if (dataKartu) {
               fetchLatestUserSesion();
          }
     }, [dataKartu]);

     return (
          <div className="app-container">
               <header>
                    <h1>SEPEDA STATIS</h1>
               </header>

               <main className="main-content">
                    <button onClick={startMonitoring}>Mulai Monitoring</button>
                    <button onClick={promptUpdateWeight}>Update Berat Badan</button>
                    <p className="status-text">{status}</p>
                    <p className="card-status-text">{cardStatus}</p>

                    {showResult && (
                         <div className="result-box">
                              <p>
                                   <strong>Distance:</strong> {distance} meters
                              </p>
                              <p>
                                   <strong>Calories Burned:</strong> {calories} kcal
                              </p>
                         </div>
                    )}
               </main>

               <footer>
                    <p>&copy; 2025 Fitness Tracker</p>
               </footer>

               <style jsx>{`
                    body {
                         font-family: 'Arial', sans-serif;
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

export default App;
