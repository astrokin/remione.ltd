export async function sendContact({ name, email, message }) {
  const [{ addDoc, collection, getFirestore, serverTimestamp }, { app }] =
    await Promise.all([import("firebase/firestore"), import("./firebase.js")]);
  await addDoc(collection(getFirestore(app), "contactRequests"), {
    name,
    email,
    message,
    createdAt: serverTimestamp(),
  });
}
