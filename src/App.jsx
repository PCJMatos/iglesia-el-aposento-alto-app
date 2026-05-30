import { useState } from "react";
import { db, auth, messagingPromise } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getToken, onMessage } from "firebase/messaging";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [pushToken, setPushToken] = useState("");

  const [prayer, setPrayer] = useState("");
  const [privatePrayer, setPrivatePrayer] = useState("");
  const [feeling, setFeeling] = useState("");

  const [prayers, setPrayers] = useState([]);
  const [privatePrayers, setPrivatePrayers] = useState([]);
  const [feelingsList, setFeelingsList] = useState([]);
  const [events, setEvents] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [devotionals, setDevotionals] = useState([]);
  const [members, setMembers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [donations, setDonations] = useState([]);
  const [radioLinks, setRadioLinks] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeText, setNoticeText] = useState("");

  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const [sermonTitle, setSermonTitle] = useState("");
  const [sermonSpeaker, setSermonSpeaker] = useState("");
  const [sermonCategory, setSermonCategory] = useState("Sermón");
  const [sermonLink, setSermonLink] = useState("");

  const [devotionalVerse, setDevotionalVerse] = useState("");
  const [devotionalText, setDevotionalText] = useState("");

  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberAddress, setMemberAddress] = useState("");
  const [memberBirthday, setMemberBirthday] = useState("");
  const [memberMinistry, setMemberMinistry] = useState("");
  const [memberRole, setMemberRole] = useState("Miembro");

  const [donationTitle, setDonationTitle] = useState("");
  const [donationLink, setDonationLink] = useState("");

  const [radioTitle, setRadioTitle] = useState("");
  const [radioLink, setRadioLink] = useState("");

  const [chatGroup, setChatGroup] = useState("General");
  const [chatText, setChatText] = useState("");

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
    setMessage("Sesión cerrada.");
  }

  async function enableNotifications() {
    try {
      const permission = await Notification.requestPermission();
  
      if (permission !== "granted") {
        setMessage("⚠️ No se activaron las notificaciones.");
        return;
      }
  
      const messaging = await messagingPromise;
  
      if (!messaging) {
        setMessage("⚠️ Este navegador no soporta notificaciones push.");
        return;
      }
  
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
  
      const token = await getToken(messaging, {
        vapidKey:
          "BGDHIEZe04GcXtvw9HxSD7peTG76e2MUkLqgihFk7kL7g3cSxSO0QBcip21Qe93eX0m1sR8D5arJ6vljcdtHHUM",
        serviceWorkerRegistration: registration,
      });
  
      await addDoc(collection(db, "pushTokens"), {
        token,
        userEmail: user ? user.email : "Invitado",
        createdAt: serverTimestamp(),
      });
  
      setPushToken(token);
      setMessage("🔔 Notificaciones activadas correctamente.");
  
      onMessage(messaging, (payload) => {
        setMessage(
          "🔔 " +
            (payload.notification?.title || "Nueva notificación") +
            ": " +
            (payload.notification?.body || "")
        );
      });
    } catch (error) {
      setMessage("❌ Error activando notificaciones: " + error.message);
    }
  }

  async function savePrayer() {
    if (!prayer.trim()) return setMessage("⚠️ Escriba una petición primero.");

    await addDoc(collection(db, "prayerRequests"), {
      text: prayer,
      userEmail: user ? user.email : "Invitado",
      anonymous: true,
      prayerCount: 0,
      createdAt: serverTimestamp(),
    });

    setPrayer("");
    setMessage("🙏 Petición enviada correctamente.");
    loadPastorPanel();
  }

  async function prayForRequest(id) {
    await updateDoc(doc(db, "prayerRequests", id), {
      prayerCount: increment(1),
    });
    setMessage("🙏 Marcado: estoy orando por esta petición.");
    loadPastorPanel();
  }

  async function savePrivatePrayer() {
    if (!privatePrayer.trim()) return setMessage("⚠️ Escriba la petición privada.");

    await addDoc(collection(db, "privatePrayers"), {
      text: privatePrayer,
      userEmail: user ? user.email : "Invitado",
      createdAt: serverTimestamp(),
    });

    setPrivatePrayer("");
    setMessage("🔒 Petición privada enviada al pastor.");
    loadPastorPanel();
  }

  async function saveFeeling() {
    if (!feeling.trim()) return setMessage("⚠️ Escriba su sentir primero.");

    await addDoc(collection(db, "feelings"), {
      text: feeling,
      userEmail: user ? user.email : "Invitado",
      anonymous: true,
      createdAt: serverTimestamp(),
    });

    setFeeling("");
    setMessage("🗣️ Comentario enviado correctamente.");
    loadPastorPanel();
  }

  async function saveNotice() {
    if (!noticeTitle.trim() || !noticeText.trim()) {
      return setMessage("⚠️ Complete título y mensaje del aviso.");
    }

    await addDoc(collection(db, "notices"), {
      title: noticeTitle,
      text: noticeText,
      createdAt: serverTimestamp(),
    });

    setNoticeTitle("");
    setNoticeText("");
    setMessage("📢 Aviso publicado correctamente.");
    loadPastorPanel();
  }

  async function saveEvent() {
    if (!eventTitle || !eventDate || !eventTime) {
      return setMessage("⚠️ Complete título, fecha y hora del evento.");
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
      return setMessage("⚠️ Complete título y enlace del sermón.");
    }

    await addDoc(collection(db, "sermons"), {
      title: sermonTitle,
      speaker: sermonSpeaker,
      category: sermonCategory,
      link: sermonLink,
      createdAt: serverTimestamp(),
    });

    setSermonTitle("");
    setSermonSpeaker("");
    setSermonCategory("Sermón");
    setSermonLink("");
    setMessage("🎥 Sermón guardado correctamente.");
    loadPastorPanel();
  }

  async function saveDevotional() {
    if (!devotionalVerse || !devotionalText) {
      return setMessage("⚠️ Complete versículo y reflexión.");
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

  async function saveMember() {
    if (!memberName.trim()) return setMessage("⚠️ Escriba el nombre del miembro.");

    await addDoc(collection(db, "members"), {
      name: memberName,
      phone: memberPhone,
      address: memberAddress,
      birthday: memberBirthday,
      ministry: memberMinistry,
      role: memberRole,
      email: user ? user.email : "",
      createdAt: serverTimestamp(),
    });

    setMemberName("");
    setMemberPhone("");
    setMemberAddress("");
    setMemberBirthday("");
    setMemberMinistry("");
    setMemberRole("Miembro");
    setMessage("👥 Miembro guardado correctamente.");
    loadPastorPanel();
  }

  async function saveDonation() {
    if (!donationTitle || !donationLink) {
      return setMessage("⚠️ Complete nombre y enlace de donación.");
    }

    await addDoc(collection(db, "donations"), {
      title: donationTitle,
      link: donationLink,
      createdAt: serverTimestamp(),
    });

    setDonationTitle("");
    setDonationLink("");
    setMessage("💳 Enlace de donación guardado.");
    loadPastorPanel();
  }

  async function saveRadio() {
    if (!radioTitle || !radioLink) {
      return setMessage("⚠️ Complete título y enlace de radio.");
    }

    await addDoc(collection(db, "radioLinks"), {
      title: radioTitle,
      link: radioLink,
      createdAt: serverTimestamp(),
    });

    setRadioTitle("");
    setRadioLink("");
    setMessage("📻 Radio guardada.");
    loadPastorPanel();
  }

  async function saveChatMessage() {
    if (!chatText.trim()) return setMessage("⚠️ Escriba un mensaje.");

    await addDoc(collection(db, "chatMessages"), {
      group: chatGroup,
      text: chatText,
      userEmail: user ? user.email : "Invitado",
      createdAt: serverTimestamp(),
    });

    setChatText("");
    setMessage("💬 Mensaje enviado.");
    loadPastorPanel();
  }

  async function loadPastorPanel() {
    const prayersSnapshot = await getDocs(collection(db, "prayerRequests"));
    const feelingsSnapshot = await getDocs(collection(db, "feelings"));
    const privateSnapshot = await getDocs(collection(db, "privatePrayers"));
    const eventsSnapshot = await getDocs(collection(db, "events"));
    const sermonsSnapshot = await getDocs(collection(db, "sermons"));
    const devotionalsSnapshot = await getDocs(collection(db, "devotionals"));
    const membersSnapshot = await getDocs(collection(db, "members"));
    const noticesSnapshot = await getDocs(collection(db, "notices"));
    const donationsSnapshot = await getDocs(collection(db, "donations"));
    const radioSnapshot = await getDocs(collection(db, "radioLinks"));
    const chatSnapshot = await getDocs(collection(db, "chatMessages"));

    setPrayers(prayersSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setFeelingsList(feelingsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setPrivatePrayers(privateSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setEvents(eventsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setSermons(sermonsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setDevotionals(devotionalsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setMembers(membersSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setNotices(noticesSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setDonations(donationsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setRadioLinks(radioSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    setChatMessages(chatSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));

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
            <button onClick={enableNotifications} style={buttonBlue}>🔔 Activar Notificaciones</button>
            {pushToken && <p style={{ fontSize: "12px" }}>Token guardado ✅</p>}
          </>
        )}
      </div>

      <Section title="📢 Avisos Pastorales" items={notices} empty="No hay avisos todavía." render={(item) => (
        <div style={noticeItem}>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          <small>{formatDate(item.createdAt)}</small>
        </div>
      )} />

      <div style={card}>
        <h2>🙏 Peticiones de Oración Pública</h2>
        <textarea value={prayer} onChange={(e) => setPrayer(e.target.value)} placeholder="Escriba aquí su petición pública..." style={textarea} />
        <button onClick={savePrayer} style={buttonRed}>Enviar Petición</button>
      </div>

      <div style={card}>
        <h2>🔒 Petición Privada al Pastor</h2>
        <textarea value={privatePrayer} onChange={(e) => setPrivatePrayer(e.target.value)} placeholder="Solo el pastor verá esta petición..." style={textarea} />
        <button onClick={savePrivatePrayer} style={buttonGray}>Enviar Petición Privada</button>
      </div>

      <div style={card}>
        <h2>🗣️ Mi Sentir</h2>
        <textarea value={feeling} onChange={(e) => setFeeling(e.target.value)} placeholder="Comparta cómo se siente..." style={textarea} />
        <button onClick={saveFeeling} style={buttonBlue}>Enviar Comentario</button>
      </div>

      <Section title="🙏 Muro de Oración" items={prayers} empty="No hay peticiones públicas cargadas." render={(item) => (
        <div style={panelItem}>
          <p>{item.text}</p>
          <p>🙏 Personas orando: {item.prayerCount || 0}</p>
          <button onClick={() => prayForRequest(item.id)} style={buttonGreen}>🙏 Estoy orando</button>
        </div>
      )} />

      <Section title="📅 Calendario de Eventos" items={events} empty="No hay eventos cargados." render={(item) => (
        <div style={panelItem}>
          <h3>{item.title}</h3>
          <p>{item.date} - {item.time}</p>
          <p>{item.location}</p>
          <p>{item.description}</p>
        </div>
      )} />

      <Section title="🎥 Biblioteca de Sermones" items={sermons} empty="No hay sermones cargados." render={(item) => (
        <div style={panelItem}>
          <h3>{item.title}</h3>
          <p><strong>Categoría:</strong> {item.category}</p>
          <p><strong>Predicador:</strong> {item.speaker}</p>
          <a href={item.link} target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>Ver sermón</a>
        </div>
      )} />

      <Section title="📖 Devocional del Día" items={devotionals} empty="No hay devocionales cargados." render={(item) => (
        <div style={panelItem}>
          <h3>{item.verse}</h3>
          <p>{item.text}</p>
        </div>
      )} />

      <Section title="👥 Directorio de Miembros" items={members} empty="No hay miembros cargados." render={(item) => (
        <div style={panelItem}>
          <h3>{item.name}</h3>
          <p>{item.phone}</p>
          <p>{item.email}</p>
          <p>{item.address}</p>
          <p>{item.birthday}</p>
          <p>{item.ministry} - {item.role}</p>
        </div>
      )} />

      {user && (
        <div style={card}>
          <h2>👨‍💼 Panel Pastoral</h2>

          <h3>📢 Crear Aviso</h3>
          <input value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="Título del aviso" style={input} />
          <textarea value={noticeText} onChange={(e) => setNoticeText(e.target.value)} placeholder="Mensaje del aviso" style={textarea} />
          <button onClick={saveNotice} style={buttonOrange}>📢 Publicar Aviso</button>

          <h3>👥 Registrar Miembro</h3>
          <input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Nombre completo" style={input} />
          <input value={memberPhone} onChange={(e) => setMemberPhone(e.target.value)} placeholder="Teléfono" style={input} />
          <input value={memberAddress} onChange={(e) => setMemberAddress(e.target.value)} placeholder="Dirección" style={input} />
          <input value={memberBirthday} onChange={(e) => setMemberBirthday(e.target.value)} placeholder="Cumpleaños: MM/DD" style={input} />
          <input value={memberMinistry} onChange={(e) => setMemberMinistry(e.target.value)} placeholder="Ministerio" style={input} />

          <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)} style={input}>
            <option>Miembro</option>
            <option>Líder</option>
            <option>Pastor</option>
            <option>Pastora</option>
            <option>Diácono</option>
            <option>Diaconisa</option>
            <option>Maestro</option>
            <option>Alabanza</option>
          </select>

          <button onClick={saveMember} style={buttonGreen}>👥 Guardar Miembro</button>

          <h3>📅 Crear Evento</h3>
          <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Título del evento" style={input} />
          <input value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="Fecha" style={input} />
          <input value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="Hora" style={input} />
          <input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Lugar" style={input} />
          <textarea value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Descripción" style={textarea} />
          <button onClick={saveEvent} style={buttonGreen}>Guardar Evento</button>

          <h3>🎥 Agregar Sermón</h3>
          <input value={sermonTitle} onChange={(e) => setSermonTitle(e.target.value)} placeholder="Título" style={input} />
          <input value={sermonSpeaker} onChange={(e) => setSermonSpeaker(e.target.value)} placeholder="Predicador" style={input} />
          <select value={sermonCategory} onChange={(e) => setSermonCategory(e.target.value)} style={input}>
            <option>Sermón</option>
            <option>Estudio Bíblico</option>
            <option>Matrimonios</option>
            <option>Jóvenes</option>
            <option>Avivamiento</option>
          </select>
          <input value={sermonLink} onChange={(e) => setSermonLink(e.target.value)} placeholder="Enlace YouTube/Facebook" style={input} />
          <button onClick={saveSermon} style={buttonBlue}>Guardar Sermón</button>

          <h3>📖 Agregar Devocional</h3>
          <input value={devotionalVerse} onChange={(e) => setDevotionalVerse(e.target.value)} placeholder="Versículo RV1960" style={input} />
          <textarea value={devotionalText} onChange={(e) => setDevotionalText(e.target.value)} placeholder="Reflexión" style={textarea} />
          <button onClick={saveDevotional} style={buttonOrange}>Guardar Devocional</button>

          <h3>💳 Agregar Donación</h3>
          <input value={donationTitle} onChange={(e) => setDonationTitle(e.target.value)} placeholder="PayPal, CashApp, Zelle..." style={input} />
          <input value={donationLink} onChange={(e) => setDonationLink(e.target.value)} placeholder="Enlace" style={input} />
          <button onClick={saveDonation} style={buttonGreen}>Guardar Donación</button>

          <h3>📻 Agregar Radio</h3>
          <input value={radioTitle} onChange={(e) => setRadioTitle(e.target.value)} placeholder="Título de radio" style={input} />
          <input value={radioLink} onChange={(e) => setRadioLink(e.target.value)} placeholder="Enlace de radio" style={input} />
          <button onClick={saveRadio} style={buttonBlue}>Guardar Radio</button>

          <AdminList title="🔒 Peticiones Privadas" items={privatePrayers} collectionName="privatePrayers" deleteItem={deleteItem} />
          <AdminList title="🙏 Peticiones Públicas" items={prayers} collectionName="prayerRequests" deleteItem={deleteItem} />
          <AdminList title="🗣️ Mi Sentir" items={feelingsList} collectionName="feelings" deleteItem={deleteItem} />
          <AdminList title="📢 Avisos" items={notices} collectionName="notices" deleteItem={deleteItem} />
          <AdminList title="📅 Eventos" items={events} collectionName="events" deleteItem={deleteItem} />
          <AdminList title="🎥 Sermones" items={sermons} collectionName="sermons" deleteItem={deleteItem} />
          <AdminList title="📖 Devocionales" items={devotionals} collectionName="devotionals" deleteItem={deleteItem} />
          <AdminList title="👥 Miembros" items={members} collectionName="members" deleteItem={deleteItem} />
          <AdminList title="💳 Donaciones" items={donations} collectionName="donations" deleteItem={deleteItem} />
          <AdminList title="📻 Radio" items={radioLinks} collectionName="radioLinks" deleteItem={deleteItem} />
          <AdminList title="💬 Chat" items={chatMessages} collectionName="chatMessages" deleteItem={deleteItem} />
        </div>
      )}
    </div>
  );
}

function Section({ title, items, empty, render }) {
  return (
    <div style={card}>
      <h2>{title}</h2>
      {items.length === 0 ? <p>{empty}</p> : items.map((item) => (
        <div key={item.id}>{render(item)}</div>
      ))}
    </div>
  );
}

function AdminList({ title, items, collectionName, deleteItem }) {
  return (
    <>
      <h3>{title}</h3>
      {items.map((item) => (
        <div key={item.id} style={panelItem}>
          <p><strong>Contenido:</strong> {item.text || item.title || item.name || item.verse || "Registro guardado"}</p>
          <p><strong>Usuario:</strong> {item.userEmail || item.email || "No disponible"}</p>
          <button onClick={() => deleteItem(collectionName, item.id)} style={buttonRed}>🗑️ Eliminar</button>
        </div>
      ))}
    </>
  );
}

const page = { background: "#0f172a", color: "white", minHeight: "100vh", padding: "30px", fontFamily: "Arial" };
const title = { color: "#f59e0b", textAlign: "center", fontSize: "42px" };
const subtitle = { textAlign: "center", fontSize: "20px" };
const messageStyle = { textAlign: "center", color: "#22c55e", fontSize: "18px", fontWeight: "bold" };
const card = { background: "#1e293b", padding: "20px", borderRadius: "15px", maxWidth: "750px", margin: "20px auto" };
const input = { width: "100%", padding: "12px", marginBottom: "10px", fontSize: "16px" };
const textarea = { width: "100%", height: "120px", padding: "10px", marginBottom: "10px", fontSize: "16px" };
const buttonOrange = { width: "100%", padding: "12px", background: "#f59e0b", color: "black", border: "none", borderRadius: "10px", marginBottom: "10px", fontSize: "16px", cursor: "pointer" };
const buttonGreen = { ...buttonOrange, background: "#22c55e" };
const buttonRed = { ...buttonOrange, background: "#dc2626", color: "white" };
const buttonBlue = { ...buttonOrange, background: "#2563eb", color: "white" };
const buttonGray = { ...buttonOrange, background: "#475569", color: "white" };
const panelItem = { background: "#0f172a", padding: "12px", borderRadius: "10px", marginBottom: "12px", border: "1px solid #334155" };
const noticeItem = { background: "#78350f", padding: "15px", borderRadius: "12px", marginBottom: "12px", border: "1px solid #f59e0b" };