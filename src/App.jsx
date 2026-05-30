import { useState } from "react";
import { db, auth } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [prayer, setPrayer] = useState("");
  const [feeling, setFeeling] = useState("");

  async function createAccount() {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      setMessage("✅ Cuenta creada correctamente.");
    } catch (error) {
      setMessage("❌ " + error.message);
    }
  }

  async function login() {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      setMessage("✅ Entró correctamente.");
    } catch (error) {
      setMessage("❌ " + error.message);
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setMessage("Sesión cerrada.");
  }

  async function savePrayer() {
    if (!prayer.trim()) {
      setMessage("⚠️ Escriba una petición primero.");
      return;
    }

    await addDoc(collection(db, "prayerRequests"), {
      text: prayer,
      userEmail: user ? user.email : "Invitado",
      anonymous: true,
      createdAt: serverTimestamp(),
    });

    setPrayer("");
    setMessage("🙏 Petición enviada correctamente.");
  }

  async function saveFeeling() {
    if (!feeling.trim()) {
      setMessage("⚠️ Escriba su sentir primero.");
      return;
    }

    await addDoc(collection(db, "feelings"), {
      text: feeling,
      userEmail: user ? user.email : "Invitado",
      anonymous: true,
      createdAt: serverTimestamp(),
    });

    setFeeling("");
    setMessage("🗣️ Comentario enviado correctamente.");
  }

  return (
    <div style={{
      background: "#0f172a",
      color: "white",
      minHeight: "100vh",
      padding: "30px",
      fontFamily: "Arial"
    }}>
      <h1 style={{ color: "#f59e0b", textAlign: "center" }}>
        🔥 Iglesia El Aposento Alto
      </h1>

      <p style={{ textAlign: "center", fontSize: "20px" }}>
        Donde todos somos una familia ❤️
      </p>

      {message && (
        <p style={{ textAlign: "center", color: "#22c55e", fontSize: "18px" }}>
          {message}
        </p>
      )}

      <div style={{
        background: "#1e293b",
        padding: "20px",
        borderRadius: "15px",
        maxWidth: "600px",
        margin: "20px auto"
      }}>
        <h2>🔐 Login de Miembros</h2>

        {!user ? (
          <>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              style={{ width: "100%", padding: "12px", marginBottom: "10px" }}
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              type="password"
              style={{ width: "100%", padding: "12px", marginBottom: "10px" }}
            />

            <button onClick={login} style={buttonOrange}>
              Entrar
            </button>

            <button onClick={createAccount} style={buttonGreen}>
              Crear Cuenta
            </button>
          </>
        ) : (
          <>
            <p>Sesión iniciada como: {user.email}</p>
            <button onClick={logout} style={buttonGray}>
              Cerrar Sesión
            </button>
          </>
        )}
      </div>

      <div style={card}>
        <h2>🙏 Peticiones de Oración</h2>
        <textarea
          value={prayer}
          onChange={(e) => setPrayer(e.target.value)}
          placeholder="Escriba aquí su petición..."
          style={textarea}
        />
        <button onClick={savePrayer} style={buttonRed}>
          Enviar Petición
        </button>
      </div>

      <div style={card}>
        <h2>🗣️ Mi Sentir</h2>
        <textarea
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          placeholder="Comparta cómo se siente..."
          style={textarea}
        />
        <button onClick={saveFeeling} style={buttonBlue}>
          Enviar Comentario
        </button>
      </div>
    </div>
  );
}

const card = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "15px",
  maxWidth: "600px",
  margin: "20px auto"
};

const textarea = {
  width: "100%",
  height: "120px",
  padding: "10px",
  marginBottom: "10px"
};

const buttonOrange = {
  width: "100%",
  padding: "12px",
  background: "#f59e0b",
  color: "black",
  border: "none",
  borderRadius: "10px",
  marginBottom: "10px",
  fontSize: "16px"
};

const buttonGreen = {
  ...buttonOrange,
  background: "#22c55e"
};

const buttonRed = {
  ...buttonOrange,
  background: "#dc2626",
  color: "white"
};

const buttonBlue = {
  ...buttonOrange,
  background: "#2563eb",
  color: "white"
};

const buttonGray = {
  ...buttonOrange,
  background: "#475569",
  color: "white"
};