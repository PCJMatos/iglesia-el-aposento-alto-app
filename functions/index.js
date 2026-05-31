const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendNotification = functions.https.onCall(async (data, context) => {
  const title = data.title || "Iglesia El Aposento Alto";
  const body = data.body || "Nuevo aviso pastoral";

  const snapshot = await admin.firestore().collection("pushTokens").get();

  const tokens = snapshot.docs
    .map((doc) => doc.data().token)
    .filter(Boolean);

  if (tokens.length === 0) {
    return { success: false, message: "No hay tokens registrados." };
  }

  const response = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: {
      title,
      body,
    },
    webpush: {
      notification: {
        icon: "/favicon.svg",
      },
    },
  });

  return {
    success: true,
    sent: response.successCount,
    failed: response.failureCount,
  };
});