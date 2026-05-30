import { useState } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
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

  const [prayers, setPrayers] = useState([]);
  const [feelingsList, setFeelingsList] = useState([]);

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
    setPrayers([]);
    setFeelingsList([]);
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

  async function loadPastorPanel() {
    const prayersSnapshot = await getDocs(collection(db, "prayerRequests"));
    const feelingsSnapshot = await getDocs(collection(db, "feelings"));

    setPrayers(
      prayersSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
    );

    setFeelingsList(
      feelingsSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
    );

    setMessage("📋 Panel pastoral cargado correctamente.");
  }

  return (
    <div style={page}>
      <h1 style={title}>🔥 Iglesia El Aposento Alto</h1>

      <p style={subtitle}>Donde todos somos una familia ❤️</p>

      {message && <p style={messageStyle}>{message}</p>}

      <div style={card}>
        <h2>🔐 Login de Miembros</h2>

        {!user ? (
          <>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              style={input}
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              type="password"
              style={input}
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
            <p>
              Sesión iniciada como: <strong>{user.email}</strong>
            </p>

            <button onClick={logout} style={buttonGray}>
              Cerrar Sesión
            </button>

            <button onClick={loadPastorPanel} style={buttonGreen}>
              📋 Abrir Panel Pastoral
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

      {(prayers.length > 0 || feelingsList.length > 0) && (
        <div style={card}>
          <h2>📋 Panel Pastoral</h2>

          <h3>🙏 Peticiones Recibidas</h3>

          {prayers.length === 0 && <p>No hay peticiones cargadas.</p>}

          {prayers.map((item) => (
            <div key={item.id} style={panelItem}>
              <p>
                <strong>Usuario:</strong> {item.userEmail}
              </p>
              <p>
                <strong>Petición:</strong> {item.text}
              </p>
              <p>
                <strong>Anónimo:</strong> {item.anonymous ? "Sí" : "No"}
              </p>
            </div>
          ))}

          <h3>🗣️ Comentarios / Mi Sentir</h3>

          {feelingsList.length === 0 && <p>No hay comentarios cargados.</p>}

          {feelingsList.map((item) => (
            <div key={item.id} style={panelItem}>
              <p>
                <strong>Usuario:</strong> {item.userEmail}
              </p>
              <p>
                <strong>Comentario:</strong> {item.text}
              </p>
              <p>
                <strong>Anónimo:</strong> {item.anonymous ? "Sí" : "No"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const page = {
  background: "#0f172a",
  color: "white",
  minHeight: "100vh",
  padding: "30px",
  fontFamily: "Arial",
};

const title = {
  color: "#f59e0b",
  textAlign: "center",
  fontSize: "42px",
};

const subtitle = {
  textAlign: "center",
  fontSize: "20px",
};

const messageStyle = {
  textAlign: "center",
  color: "#22c55e",
  fontSize: "18px",
  fontWeight: "bold",
};

const card = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "15px",
  maxWidth: "700px",
  margin: "20px auto",
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "10px",
  fontSize: "16px",
};

const textarea = {
  width: "100%",
  height: "120px",
  padding: "10px",
  marginBottom: "10px",
  fontSize: "16px",
};

const buttonOrange = {
  width: "100%",
  padding: "12px",
  background: "#f59e0b",
  color: "black",
  border: "none",
  borderRadius: "10px",
  marginBottom: "10px",
  fontSize: "16px",
  cursor: "pointer",
};

const buttonGreen = {
  ...buttonOrange,
  background: "#22c55e",
};

const buttonRed = {
  ...buttonOrange,
  background: "#dc2626",
  color: "white",
};

const buttonBlue = {
  ...buttonOrange,
  background: "#2563eb",
  color: "white",
};

const buttonGray = {
  ...buttonOrange,
  background: "#475569",
  color: "white",
};

const panelItem = {
  background: "#0f172a",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "12px",
  border: "1px solid #334155",
};