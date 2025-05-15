import { useState } from 'react';

const BASE_URL = 'http://192.168.43.42:3000';

function Signup() {
  const [form, setForm] = useState({ name: '', weight: '', gender: '' });
  const [status, setStatus] = useState('⏳ Menunggu kartu RFID...');
  const [polling, setPolling] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const startCardRegistration = () => {
    const { name, weight, gender } = form;

    if (!name || !weight || !gender) {
      alert('❗ Harap isi semua data terlebih dahulu!');
      return;
    }

    setStatus('Tempelkan kartu RFID Anda...');

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BASE_URL}/scan/card`);
        if (res.ok) {
          const data = await res.json();
          const cardId = data.cardId;
          clearInterval(interval);

          const registerRes = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardId, name, weight, gender }),
          });

          const registerData = await registerRes.json();
          if (registerRes.ok) {
            alert('✅ Registrasi berhasil!');
            window.location.href = '/';
          } else {
            alert('❌ Gagal registrasi: ' + registerData.message);
            setStatus('❌ Registrasi gagal.');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        setStatus('❌ Terjadi kesalahan.');
      }
    }, 2000);

    setPolling(interval);
  };

  return (
    <>
      <header><h1>Registrasi Pengguna</h1></header>
      <main>
        <input type="text" id="name" placeholder="Nama lengkap" value={form.name} onChange={handleChange} required />
        <input type="number" id="weight" placeholder="Berat badan (kg)" value={form.weight} onChange={handleChange} required />
        <select id="gender" value={form.gender} onChange={handleChange} required>
          <option value="">Pilih Jenis Kelamin</option>
          <option value="1">Laki-laki</option>
          <option value="2">Perempuan</option>
        </select>
        <button onClick={startCardRegistration}>Lanjutkan dan Tempelkan Kartu</button>
        <p style={{ marginTop: 20, fontWeight: 'bold' }}>{status}</p>
      </main>
      <footer><p>&copy; 2025 Fitness Tracker</p></footer>
    </>
  );
}

export default Signup;
