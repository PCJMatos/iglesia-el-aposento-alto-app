import { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function App() {
  const [prayer, setPrayer] = useState("");
  const [feeling, setFeeling] = useState("");
  const [message, setMessage] = useState("");

  const savePrayer = async () => {
    if (!prayer.trim()) {
      setMessage("⚠️ Escriba una petición primero.");
      return;
    }

    await addDoc(collection(db, "prayerRequests"), {
      text: prayer,
      anonymous: true,
      createdAt: serverTimestamp(),
    });

    setPrayer("");
    setMessage("🙏 Petición enviada correctamente.");
  };

  const saveFeeling = async () => {
    if (!feeling.trim()) {
      setMessage("⚠️ Escriba su sentir primero.");
      return;
    }

    await addDoc(collection(db, "feelings"), {
      text: feeling,
      anonymous: true,
      createdAt: serverTimestamp(),
    });

    setFeeling("");
    setMessage("🗣️ Comentario enviado correctamente.");
  };

  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        color: "white",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#f59e0b", fontSize: "48px", textAlign: "center" }}>
        🔥 Iglesia El Aposento Alto
      </h1>

      <p style={{ textAlign: "center", fontSize: "22px", marginBottom: "20px" }}>
        Donde todos somos una familia ❤️
      </p>

      {message && (
        <p style={{ textAlign: "center", fontSize: "20px", color: "#22c55e" }}>
          {message}
        </p>
      )}

      <div style={{ maxWidth: "900px", margin: "auto", display: "grid", gap: "20px" }}>
        <div style={{ background: "#1e293b", padding: "20px", borderRadius: "15px" }}>
          <h2>🙏 Peticiones de Oración</h2>

          <textarea
            value={prayer}
            onChange={(e) => setPrayer(e.target.value)}
            placeholder="Escriba aquí su petición..."
            style={{
              width: "100%",
              height: "120px",
              padding: "10px",
              marginTop: "10px",
              fontSize: "16px",
            }}
          />

          <button
            onClick={savePrayer}
            style={{
              marginTop: "15px",
              background: "#dc2626",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "10px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            Enviar Petición
          </button>
        </div>

        <div style={{ background: "#1e293b", padding: "20px", borderRadius: "15px" }}>
          <h2>🗣️ Mi Sentir</h2>

          <textarea
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            placeholder="Comparta cómo se siente..."
            style={{
              width: "100%",
              height: "120px",
              padding: "10px",
              marginTop: "10px",
              fontSize: "16px",
            }}
          />

          <button
            onClick={saveFeeling}
            style={{
              marginTop: "15px",
              background: "#2563eb",
              color: "white",
              padding: "12px 20px",
              border: "none",
              borderRadius: "10px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            Enviar Comentario
          </button>
        </div>

        <div style={{ background: "#1e293b", padding: "20px", borderRadius: "15px" }}>
          <h2>📅 Próximos Eventos</h2>
          <p>Viernes - Culto Evangelístico 7:30 PM</p>
          <p>Domingo - Escuela Bíblica 10:00 AM</p>
        </div>
      </div>
    </div>
  );
}