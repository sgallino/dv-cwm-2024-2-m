import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * 
 * @param {string} id 
 * @returns {Promise<{id: string, email: string, displayName: string, bio: string, career: string, photoURL: string|null}>}
 */
export async function getUserProfileById(id) {
    const profileRef = doc(db, `/users/${id}`);

    const profileDocument = await getDoc(profileRef);

    return {
        id: profileDocument.id,
        email: profileDocument.data().email,
        displayName: profileDocument.data().displayName,
        photoURL: profileDocument.data().photoURL,
        career: profileDocument.data().career,
        bio: profileDocument.data().bio,
    }
}

/**
 * 
 * @param {string} id 
 * @param {{email: string}} data
 */
export async function createUserProfile(id, { email }) {
    const profileRef = doc(db, `users/${id}`);

    await setDoc(profileRef, { email });
}

/**
 * 
 * @param {string} id 
 * @param {{displayName: string, bio: string, career: string, photoURL: string}} data
 */
export async function updateUserProfile(id, data) {
    // En esta ocasión, nosotros queremos modificar un documento en
    // específico.
    // Esto requeire que usemos la función doc() de Firestore para crear
    // la referencia a un documento.
    const profileRef = doc(db, `/users/${id}`);

    // Editamos el documento usando la función updateDoc().
    await updateDoc(profileRef, {
        ...data,
    });
}