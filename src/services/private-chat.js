/*
# Estructura del chat privado en Firestore
Dentro de los datos de un chat privado, hay 2 estructuras "complejas" de data que queremos
almacenar:

- Los usuarios participantes (en nuestro caso, siempre van a ser 2).
- Los mensajes (pueden ser X).

¿Cómo nos conviene representar esa data en Firestore?
https://firebase.google.com/docs/firestore/manage-data/structure-data?hl=es-419

A partir de ese documento de guía de Firestore, podemos concluir que las estructuras que
nos conviene utilizar son:

- Para los usuarios, vamos a usar un "mapa". Un mapa es, básicamente, un objeto común.
- Para los mensajes, vamos a usar una subcollection.

La estructura va a quedar algo así:
[C] => Collection
[D] => Document

[C] private-chats {
    [D] idChat1 {
        users: {
            [idUser1]: true,
            [idUser2]: true,
        }

        [C] messages {
            [D] idMessage1 {
                user_id: ...,
                text: ...,
                created_at: ...,
            }

            ...
        }
    }

    ...
}

Nota: Observen que en el mapa de los usuarios los ids van a ser las *claves* y no los valores.
*/

import { DocumentReference, addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "./firebase";

/** 
 * La lista de los documentos de chats privados. 
 * La idea es que cada clave del objeto represente un "id" de la conversación, y como
 * valor contenga el documento del chat.
 * Para el id de la conversación, vamos a generar la unión ordenada de los ids de ambos
 * usuarios con un "_".
 * Por ejemplo, si los usuarios de la conversación son:
 *  User1: asd
 *  User2: zxc
 *  Id: asd_zxc
 * 
 * Y el resultado del id debe ser igual sin importar el orden en que tengamos los ids.
 * Es decir:
 *  User1: zxc
 *  User2: asd
 *  Id: asd_zxc
 * 
 * @type {{}}  
 * */
const privateChatCache = {};

/**
 * 
 * @param {string} senderId 
 * @param {string} receiverId 
 * @returns {string}
 */
function getCacheKey(senderId, receiverId) {
    return [senderId, receiverId].sort().join("_");
}

/**
 * 
 * @param {string} key 
 * @param {*} document 
 */
function putInCache(key, document) {
    privateChatCache[key] = document;
}

/**
 * 
 * @param {string} key 
 * @returns {string|null}
 */
function retrieveFromCache(key) {
    return privateChatCache[key] || null;
}

/**
 * 
 * @param {string} senderId 
 * @param {string} receiverId 
 * @returns {Promise<DocumentReference>}
 */
async function getPrivateChatDocument(senderId, receiverId) {
    // Verificamos si tenemos la conversación en el caché.
    const cacheKey = getCacheKey(senderId, receiverId);
    const cachedDoc = retrieveFromCache(cacheKey);

    if(cachedDoc) {
        console.log("Recuperando el documento del chat privado del caché.");
        return cachedDoc;
    }

    console.log("Buscando el documento del chat privado en Firestore.");

    // Buscamos a ver si ya existe.
    const chatRef = collection(db, 'private-chats');

    const chatQuery = query(chatRef, where('users', '==', {
        [senderId]: true,
        [receiverId]: true,
    }), limit(1));

    const chatSnapshot = await getDocs(chatQuery);
    let chatDoc;

    if(chatSnapshot.empty) {
        // Creamos el documento de la conversación privada entre estos usuarios.
        chatDoc = await addDoc(chatRef, {
            users: {
                [senderId]: true,
                [receiverId]: true,
            }
        });
    } else {
        chatDoc = chatSnapshot.docs[0];
    }

    // Guardamos el documento en el caché.
    putInCache(cacheKey, chatDoc);

    return chatDoc;
}

/**
 * 
 * @param {string} senderId 
 * @param {string} receiverId 
 * @param {string} text 
 */
export async function savePrivateChatMessage(senderId, receiverId, text) {
    // Necesitamos tener el documento de la conversación privada.
    const chatDoc = await getPrivateChatDocument(senderId, receiverId);

    // Ahora que tenemos el documento, y especialmente su id, podemos grabar el mensaje en
    // la subcollection de messages del documento.
    const messagesRef = collection(db, `private-chats/${chatDoc.id}/messages`);

    await addDoc(messagesRef, {
        user_id: senderId,
        text,
        created_at: serverTimestamp(),
    });
}

/**
 * 
 * @param {string} senderId 
 * @param {string} receiverId 
 * @param {Function} callback 
 */
export async function subscribeToPrivateChatMessages(senderId, receiverId, callback) {
    const chatDoc = await getPrivateChatDocument(senderId, receiverId);

    const queryMessages = query(
        collection(db, `private-chats/${chatDoc.id}/messages`),
        orderBy('created_at'),
    );

    onSnapshot(queryMessages, snapshot => {
        const messages = snapshot.docs.map(document => {
            return {
                id: document.id,
                user_id: document.data().user_id,
                text: document.data().text,
                created_at: document.data().created_at?.toDate(),
            }
        });

        callback(messages);
    });
}