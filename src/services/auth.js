import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile, getUserProfileById, updateUserProfile } from "./user-profile";
import { getFileURL, uploadFile } from "./file-storage";

let loggedUser = {
    id: null,
    email: null,
    displayName: null,
    photoURL: null,
    bio: null,
    career: null,
    fullyLoaded: false,
};

// Preguntamos si el usuario figure como autenticado, en cuyo caso
// levantamos los datos.
if(localStorage.getItem('user')) {
    loggedUser = JSON.parse(localStorage.getItem('user'));
}

// Array para la lista de observers de la autenticación.
let observers = [];

// Nos "suscribimos" a los cambios de la autenticación.
onAuthStateChanged(auth, async user => {
    if(user) {
        updateLoggedUser({
            // En el usuario de Firebase Authentication, el id se llama
            // uid.
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
        });

        // Buscamos ahora el resto del perfil.
        getUserProfileById(user.uid)
            .then(userProfile => {
                updateLoggedUser({
                    bio: userProfile.bio,
                    career: userProfile.career,
                    fullyLoaded: true,
                });
            });
    } else {
        updateLoggedUser({
            id: null,
            email: null,
            displayName: null,
            photoURL: null,
            bio: null,
            career: null,
            fullyLoaded: false,
        });
        // Actualizamos localStorage.
        localStorage.removeItem('user');
    }
});

export async function register({email, password}) {
    try {
        // Registrarse en la aplicación requiere de 2 acciones:
        // 1. Crear el usuario en Authentication.
        // 2. Crear un documento en Firestore en la collection 'users'
        //  usando el id del usuario en Authentication.
        const credentials = await createUserWithEmailAndPassword(auth, email, password);

        // Creamos el perfil del usuario en Firestore.
        await createUserProfile(credentials.user.uid, { email });
    } catch (error) {
        console.error("[auth.js register] Error al tratar de crear una cuenta: ", error);
        throw error;
    }
}

export async function login({email, password}) {
    // Tratamos de autenticar usando la función signInWithEmailAndPassword().
    // Recibe 3 parámetros:
    // 1. La instancia de Authentication.
    // 2. El email.
    // 3. El password.
    // Retorna una Promise que se resuelve con UserCredentials, y se rechaza
    //  si el login no es exitoso.
    try {
        const user = await signInWithEmailAndPassword(auth, email, password);
        console.log("Sesión iniciada con éxito: ", user);
    } catch (error) {
        console.error("[auth.js login] Error al tratar de iniciar sesión: ", error);
        throw error;
    }
}

/**
 * 
 * @param {{displayName: string, bio: string, career: string}} data
 * @returns {Promise<null>}
 */
export async function editMyProfile({displayName, bio, career}) {
    try {
        // Actualizamos el displayName en Authentication
        const promiseAuth = updateProfile(auth.currentUser, { displayName });

        // Actualizamos el perfil del usuario en Firestore.
        const promiseProfile = updateUserProfile(loggedUser.id, { displayName, bio, career });

        // Esperamos a que ambas promesas se completen, con ayuda de la
        // función Promise.all().
        await Promise.all([promiseAuth, promiseProfile]);

        // Actualizamos los datos locales de loggedUser y notificamos a
        // los observers.
        updateLoggedUser({
            displayName,
            bio,
            career,
        });
        
        // // Actualizamos localStorage.
        // localStorage.setItem('user', JSON.stringify(loggedUser));

        // notifyAll();
    } catch (error) {
        console.error('[auth.js editMyProfile] Error al tratar de editar el perfil: ', error);
        throw error;
    }
}

/**
 * 
 * @param {File} photo 
 */
export async function editMyProfilePhoto(photo) {
    try {
        // Generamos la ruta donde queremos guardar el archivo.
        // La forma que le vamos a dar es: "users/idDelUsuario/archivo".
        const filepath = `users/${loggedUser.id}/avatar.jpg`; // TODO: Manejar otras extensiones.

        // Guardamos la foto.
        await uploadFile(filepath, photo);

        const photoURL = await getFileURL(filepath);

        const promiseAuth = updateProfile(auth.currentUser, { photoURL });
        const promiseFirestore = updateUserProfile(loggedUser.id, { photoURL });

        await Promise.all([promiseAuth, promiseFirestore]);

        updateLoggedUser({ photoURL });
    } catch (error) {
        console.error('[auth.js editMyProfilePhoto] Error al tratar de editar la foto del perfil: ', error);
        throw error;
    }
}

export async function logout() {
    await signOut(auth);
}

/*-------------------------------------------------------------
| Patrón de Diseño: Observer
+--------------------------------------------------------------
| Un patrón de diseño es una solución común de aplicar a un
| determinado problema.
| Muchos patrones están ya "identificados" y se les asignaron un
| nombre.
|
| En esta ocasión, vamos a presentar el patrón Observer.
| Observer permite definir una relación de 1 a muchos entre
| elementos del sistema.
| Por un lado, tenemos un elemento, llamado el "subject" (sujeto),
| y por otro lado tenemos otros elementos llamados "observers"
| (observadores).
| Los observers son elementos que están interesados en ser
| notificados de cambios o sucesos ocurridos en el subject.
|
| La idea de la implementación que vamos a aplicar es que el
| subject maneje la mayor parte.
| El subject va a permitir, a través de una función, que los
| observers puedan "suscribirse" ("subscribe") para recibir
| notificaciones de, en nuestro caso, los cambios en la variable
| del usuario autenticado.
| Esto observers van a ser guardados en un array.
| Finalmente, cada vez que se realice algún cambio en los datos
| de loggedUser, vamos a pedir que se notifique a todos los
| observers suscritos.
|
| Nota: Si bien el término más común para agregar un observer
| es "subscribe", algunas implementaciones lo llaman "attach" o
| "listen".
|
| Es crucial tener presente que siempre un observer debe tener
| un mecanismo para cancelar sus suscripción.
+--------------------------------------------------------------*/
/**
 * 
 * @param {Function} callback
 * @returns {Function} Función para cancelar la suscripción.
 */
export function subscribeToAuthChanges(callback) {
    observers.push(callback);

    // console.log("Observer agregado. El stack actual es: ", observers);

    // Inmediatamente, notificamos al callback los datos actuales
    // del usuario autenticado.
    notify(callback);

    // Retornamos una nueva función que al ejecutarse elimine este
    // observer que acabamos de agregar.
    return () => {
        observers = observers.filter(obs => obs !== callback);
        // console.log("Observer removido. El stack es: ", observers);
    }
}

/**
 * Ejecuta el callback pasándole una copia de los datos del usuario
 * autenticado.
 * 
 * @param {Function} callback 
 */
function notify(callback) {
    // console.log("Notificando a un observer...");
    callback({...loggedUser}); // Muy importante que sea una copia.
}

/**
 * Notifica a todos los observers.
 */
function notifyAll() {
    observers.forEach(callback => notify(callback));
}

/**
 * Actualiza los datos del usuario autenticado.
 * 
 * @param {{}} newData 
 */
function updateLoggedUser(newData) {
    loggedUser = {
        ...loggedUser,
        ...newData,
    }
    localStorage.setItem('user', JSON.stringify(loggedUser));
    notifyAll();
}