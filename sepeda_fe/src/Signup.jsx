import { useState, useEffect } from "react";

const BASE_URL = "http://192.168.0.111:3000";

export default function Signup({ cardId, onClose }) {
     const [form, setForm] = useState({ name: "", weight: "", gender: "" });
     const [loading, setLoading] = useState(false);
     const [msg, setMsg] = useState("");

     useEffect(() => {
          setMsg("📋 Isi data untuk kartu: " + cardId);
     }, [cardId]);

     const handleChange = (e) =>
          setForm((f) => ({ ...f, [e.target.id]: e.target.value }));

     const handleRegister = async () => {
          const { name, weight, gender } = form;
          if (!name || !weight || !gender) {
               return setMsg("❗ Semua field wajib diisi!");
          }
          setLoading(true);
          try {
               const res = await fetch(`${BASE_URL}/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cardId, name, weight, gender }),
               });
               const data = await res.json();
               if (res.ok) {
                    setMsg("✅ Registrasi sukses!");
                    setTimeout(() => {
                         onClose();
                         window.location.reload();
                    }, 800);
               } else {
                    setMsg("❌ " + data.message);
               }
          } catch (e) {
               console.error(e);
               setMsg("❌ Gagal mendaftar, cek koneksi.");
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="modal">
               <div className="box">
                    <h2>Registrasi Pengguna</h2>
                    <p className="info">{msg}</p>
                    <input
                         id="name"
                         placeholder="Nama lengkap"
                         onChange={handleChange}
                    />
                    <input
                         id="weight"
                         type="number"
                         placeholder="Berat badan (kg)"
                         onChange={handleChange}
                    />
                    <select id="gender" onChange={handleChange}>
                         <option value="">Pilih Jenis Kelamin</option>
                         <option value="1">Laki-laki</option>
                         <option value="2">Perempuan</option>
                    </select>
                    <button onClick={handleRegister} disabled={loading}>
                         {loading ? "⏳ Daftar..." : "Daftarkan"}
                    </button>
                    <button
                         className="close"
                         onClick={onClose}
                         disabled={loading}>
                         &times;
                    </button>
               </div>

               <style jsx>{`
                    .modal {
                         position: fixed;
                         inset: 0;
                         background: rgba(0, 0, 0, 0.6);
                         display: flex;
                         justify-content: center;
                         align-items: center;
                         animation: fadeIn 0.3s ease;
                    }
                    .box {
                         background: #fff;
                         color: #333;
                         padding: 20px;
                         border-radius: 8px;
                         width: 280px;
                         position: relative;
                         animation: slideIn 0.4s ease;
                    }
                    .info {
                         font-size: 14px;
                         margin-bottom: 10px;
                    }
                    input,
                    select {
                         width: 100%;
                         margin: 6px 0;
                         padding: 8px;
                         box-sizing: border-box;
                    }
                    button {
                         width: 100%;
                         padding: 10px;
                         margin-top: 8px;
                         border: none;
                         border-radius: 4px;
                         background: #6a5acd;
                         color: #fff;
                         font-weight: bold;
                         cursor: pointer;
                    }
                    .close {
                         position: absolute;
                         top: 10px;
                         right: 12px;
                         background: transparent;
                         font-size: 24px;
                         line-height: 1;
                         color: #666;
                    }
                    @keyframes fadeIn {
                         from {
                              opacity: 0;
                         }
                         to {
                              opacity: 1;
                         }
                    }
                    @keyframes slideIn {
                         from {
                              transform: translateY(-20px);
                         }
                         to {
                              transform: translateY(0);
                         }
                    }
               `}</style>
          </div>
     );
}
