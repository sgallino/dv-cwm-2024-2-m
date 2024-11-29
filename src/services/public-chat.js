import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Esto que sigue es un JSDoc.
/**
 * Graba un mensaje del chat público en el backend.
 * 
 * @param {{email: string, text: string}} newMessage
 * @return {Promise}
 */
// export async function savePublicChatMessage(newMessage) {
//     const email = newMessage.email;
//     const text = newMessage.text;
export async function savePublicChatMessage( { user_id, email, text } ) {
    // Escribimos en Firestore.
    // Para interactuar con una collection o document de Firestore, es
    // necesario definir una "referencia" a dicha collection o document.
    // Para las collections usamos la función "collection".
    const chatRef = collection(db, 'public-chat');

    // Para agregar un documento a una collection, usamos la función
    // addDoc, que recibe 2 argumentos:
    // 1. La referencia de la collection.
    // 2. Un objeto con los datos.
    // Este método retorna una Promise que se resuelve cuando termina
    // de escribir.
    await addDoc(chatRef, {
        user_id,
        email,
        text,
        // Usamos la función serverTimestamp para guardar la fecha de
        // creación. Esta función deja indicado que queremos que cuando
        // el registro se grabe en el servidor, se tome la fecha y hora
        // del servidor.
        created_at: serverTimestamp(),
    });
}

export function subscribeToPublicChatMessages(callback) {
    // Para leer los documentos de la collection "public-chat" empezamos
    // por crear la referencia.
    const chatRef = collection(db, 'public-chat');

    // Vamos a hacer la lectura usando la función getDocs().
    // getDocs() retorna una "fotografía" de los datos en el momento de
    // lectura. Pero es una lectura de una única vez.
    // Esta función recibe como argumento la referencia a una collection,
    // y retorna una Promise que se resuelve con un objeto QuerySnapshot.
    // const snapshot = await getDocs(chatRef);
    // console.log("El snapshot es: ", snapshot);

    // El QuerySnapshot por sí solo mucho no nos sirve. Nostoros queremos
    // los documentos. Podemos pedirlos usando la propiedad "docs" del
    // snapshot que retorna un array de objetos QueryDocumentSnapshot.
    // Cada uno de esos objetos representa un documento de la collection,
    // y tiene una propiedad "id" que retorna el id del documento, y un
    // método "data()" que nos retorna un objeto con los datos del documento.
    // messages.value = snapshot.docs.map(doc => {
    //     return {
    //         id: doc.id,
    //         email: doc.data().email,
    //         text: doc.data().text,
    //     }
    // });

    /*
        Creamos un "query" (consulta) para traer los documentos ordenados.
        Es común que tengamos que aplicar algún criterio de ordenamiento
        o de filtrado o de límite a los datos que queremos traer de una
        collection.
        En Firestore, esto se logra con una "query". Se crean con la función
        del mismo nombre, que recibe al menos 2 parámetros:
        1. Una referencia a una collection.
        2. Una o más instrucciones de ordenamiento, filtro o límite.
    */
    const chatQuery = query(chatRef, orderBy('created_at'));

    // Para hacer la lectura en tiempo real, usamos la función onSnapshot.
    // Esta recibe 2 argumentos:
    // 1. La referencia de la collection o el query.
    // 2. El callback a ejecutar cada vez que haya cambios en los datos.
    //  Este callback recibe como parámetro el QuerySnapshot.
    onSnapshot(chatQuery, snapshot => {
        const messages = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                user_id: doc.data().user_id,
                email: doc.data().email,
                text: doc.data().text,
                // Usamos el optional chain operator para pedir la fecha.
                created_at: doc.data().created_at?.toDate(),
            }
        });
        callback(messages);
    });
}