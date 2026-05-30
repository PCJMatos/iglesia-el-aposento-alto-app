import { useState } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
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

  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [events, setEvents] = useState([]);

  const [sermonTitle, setSermonTitle] = useState("");
  const [sermonSpeaker, setSermonSpeaker] = useState("");
  const [sermonLink, setSermonLink] = useState("");
  const [sermons, setSermons] = useState([]);

  const [devotionalVerse, setDevotionalVerse] = useState("");
  const [devotionalText, setDevotionalText] = useState("");
  const [devotionals, setDevotionals] = useState([]);

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

  async function resetPassword() {
    if (!email) {
      setMessage("⚠️ Escriba su correo electrónico primero.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("📧 Se envió un enlace para restablecer su contraseña.");
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

  async function saveEvent() {
    if (!eventTitle || !eventDate || !eventTime) {
      setMessage("⚠️ Complete título, fecha y hora del evento.");
      return;
    }

    await addDoc(collection(db, "events"), {
      title: eventTitle,
      date: eventDate,
      time: eventTime,
      location: eventLocation,
      description: eventDescription,
      createdAt: serverTimestamp(),
    });

    setEventTitle("");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
    setEventDescription("");
    setMessage("📅 Evento guardado correctamente.");
    loadPastorPanel();
  }

  async function saveSermon() {
    if (!sermonTitle || !sermonLink) {
      setMessage("⚠️ Complete título y enlace del sermón.");
      return;
    }

    await addDoc(collection(db, "sermons"), {
      title: sermonTitle,
      speaker: sermonSpeaker,
      link: sermonLink,
      createdAt: serverTimestamp(),
    });

    setSermonTitle("");
    setSermonSpeaker("");
    setSermonLink("");
    setMessage("🎥 Sermón guardado correctamente.");
    loadPastorPanel();
  }

  async function saveDevotional() {
    if (!devotionalVerse || !devotionalText) {
      setMessage("⚠️ Complete versículo y reflexión.");
      return;
    }

    await addDoc(collection(db, "devotionals"), {
      verse: devotionalVerse,
      text: devotionalText,
      createdAt: serverTimestamp(),
    });

    setDevotionalVerse("");
    setDevotionalText("");
    setMessage("📖 Devocional guardado correctamente.");
    loadPastorPanel();
  }

  async function loadPastorPanel() {
    const prayersSnapshot = await getDocs(collection(db, "prayerRequests"));
    const feelingsSnapshot = await getDocs(collection(db, "feelings"));
    const eventsSnapshot = await getDocs(collection(db, "events"));
    const sermonsSnapshot = await getDocs(collection(db, "sermons"));
    const devotionalsSnapshot = await getDocs(collection(db, "devotionals"));

    setPrayers(prayersSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setFeelingsList(feelingsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setEvents(eventsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setSermons(sermonsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setDevotionals(devotionalsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));

    setMessage("📋 Panel pastoral cargado correctamente.");
  }

  async function deleteItem(collectionName, id) {
    await deleteDoc(doc(db, collectionName, id));
    setMessage("🗑️ Eliminado correctamente.");
    loadPastorPanel();
  }

  function formatDate(createdAt) {
    if (!createdAt || !createdAt.toDate) return "Fecha no disponible";
    return createdAt.toDate().toLocaleString();
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
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" style={input} />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" type="password" style={input} />

            <button onClick={login} style={buttonOrange}>Entrar</button>
            <button onClick={resetPassword} style={buttonGray}>🔑 Olvidé mi contraseña</button>
            <button onClick={createAccount} style={buttonGreen}>Crear Cuenta</button>
          </>
        ) : (
          <>
            <p>Sesión iniciada como: <strong>{user.email}</strong></p>
            <button onClick={logout} style={buttonGray}>Cerrar Sesión</button>
            <button onClick={loadPastorPanel} style={buttonGreen}>📋 Abrir Panel Pastoral</button>
          </>
        )}
      </div>

      <div style={card}>
        <h2>🙏 Peticiones de Oración</h2>
        <textarea value={prayer} onChange={(e) => setPrayer(e.target.value)} placeholder="Escriba aquí su petición..." style={textarea} />
        <button onClick={savePrayer} style={buttonRed}>Enviar Petición</button>
      </div>

      <div style={card}>
        <h2>🗣️ Mi Sentir</h2>
        <textarea value={feeling} onChange={(e) => setFeeling(e.target.value)} placeholder="Comparta cómo se siente..." style={textarea} />
        <button onClick={saveFeeling} style={buttonBlue}>Enviar Comentario</button>
      </div>

      <div style={card}>
        <h2>📅 Próximos Eventos</h2>
        {events.length === 0 ? <p>No hay eventos cargados todavía.</p> : events.map((item) => (
          <div key={item.id} style={panelItem}>
            <h3>{item.title}</h3>
            <p><strong>Fecha:</strong> {item.date}</p>
            <p><strong>Hora:</strong> {item.time}</p>
            <p><strong>Lugar:</strong> {item.location}</p>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      <div style={card}>
        <h2>🎥 Sermones</h2>
        {sermons.length === 0 ? <p>No hay sermones cargados todavía.</p> : sermons.map((item) => (
          <div key={item.id} style={panelItem}>
            <h3>{item.title}</h3>
            <p><strong>Predicador:</strong> {item.speaker}</p>
            <a href={item.link} target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>Ver sermón</a>
          </div>
        ))}
      </div>

      <div style={card}>
        <h2>📖 Devocionales</h2>
        {devotionals.length === 0 ? <p>No hay devocionales cargados todavía.</p> : devotionals.map((item) => (
          <div key={item.id} style={panelItem}>
            <h3>{item.verse}</h3>
            <p>{item.text}</p>
          </div>
        ))}
      </div>

      {user && (
        <div style={card}>
          <h2>👨‍💼 Panel Pastoral</h2>

          <h3>📅 Crear Evento</h3>
          <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Título del evento" style={input} />
          <input value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="Fecha" style={input} />
          <input value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="Hora" style={input} />
          <input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Lugar" style={input} />
          <textarea value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Descripción" style={textarea} />
          <button onClick={saveEvent} style={buttonGreen}>Guardar Evento</button>

          <h3>🎥 Agregar Sermón</h3>
          <input value={sermonTitle} onChange={(e) => setSermonTitle(e.target.value)} placeholder="Título del sermón" style={input} />
          <input value={sermonSpeaker} onChange={(e) => setSermonSpeaker(e.target.value)} placeholder="Predicador" style={input} />
          <input value={sermonLink} onChange={(e) => setSermonLink(e.target.value)} placeholder="Enlace YouTube/Facebook" style={input} />
          <button onClick={saveSermon} style={buttonBlue}>Guardar Sermón</button>

          <h3>📖 Agregar Devocional</h3>
          <input value={devotionalVerse} onChange={(e) => setDevotionalVerse(e.target.value)} placeholder="Versículo bíblico" style={input} />
          <textarea value={devotionalText} onChange={(e) => setDevotionalText(e.target.value)} placeholder="Reflexión devocional" style={textarea} />
          <button onClick={saveDevotional} style={buttonOrange}>Guardar Devocional</button>

          <h3>🙏 Peticiones Recibidas</h3>
          {prayers.map((item) => (
            <div key={item.id} style={panelItem}>
              <p><strong>Usuario:</strong> {item.userEmail || "Invitado"}</p>
              <p><strong>Petición:</strong> {item.text}</p>
              <p><strong>Fecha:</strong> {formatDate(item.createdAt)}</p>
              <button onClick={() => deleteItem("prayerRequests", item.id)} style={buttonRed}>🗑️ Eliminar</button>
            </div>
          ))}

          <h3>🗣️ Comentarios / Mi Sentir</h3>
          {feelingsList.map((item) => (
            <div key={item.id} style={panelItem}>
              <p><strong>Usuario:</strong> {item.userEmail || "Invitado"}</p>
              <p><strong>Comentario:</strong> {item.text}</p>
              <p><strong>Fecha:</strong> {formatDate(item.createdAt)}</p>
              <button onClick={() => deleteItem("feelings", item.id)} style={buttonRed}>🗑️ Eliminar</button>
            </div>
          ))}

          <h3>📅 Eventos Administrados</h3>
          {events.map((item) => (
            <div key={item.id} style={panelItem}>
              <p><strong>{item.title}</strong></p>
              <p>{item.date} - {item.time}</p>
              <button onClick={() => deleteItem("events", item.id)} style={buttonRed}>🗑️ Eliminar Evento</button>
            </div>
          ))}

          <h3>🎥 Sermones Administrados</h3>
          {sermons.map((item) => (
            <div key={item.id} style={panelItem}>
              <p><strong>{item.title}</strong></p>
              <button onClick={() => deleteItem("sermons", item.id)} style={buttonRed}>🗑️ Eliminar Sermón</button>
            </div>
          ))}

          <h3>📖 Devocionales Administrados</h3>
          {devotionals.map((item) => (
            <div key={item.id} style={panelItem}>
              <p><strong>{item.verse}</strong></p>
              <button onClick={() => deleteItem("devotionals", item.id)} style={buttonRed}>🗑️ Eliminar Devocional</button>
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
  maxWidth: "750px",
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