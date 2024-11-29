// Archivo de creación y configuración del Router.
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import { subscribeToAuthChanges } from '../services/auth';
import Home from '../pages/Home.vue';
import Chat from '../pages/Chat.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import MyProfile from '../pages/MyProfile.vue';
import MyProfileEdit from '../pages/MyProfileEdit.vue';
import MyProfileEditPhoto from '../pages/MyProfileEditPhoto.vue';
import UserProfile from '../pages/UserProfile.vue';
import PrivateChat from '../pages/PrivateChat.vue';
import Posts from '../pages/Posts.vue';

// Definimos las rutas.
const routes = [
    { path: '/',                        component: Home, },
    { path: '/iniciar-sesion',          component: Login, },
    { path: '/registrarse',             component: Register, },
    { path: '/chat',                    component: Chat,                meta: { requiresAuth: true }, },
    { path: '/mi-perfil',               component: MyProfile,           meta: { requiresAuth: true }, },
    { path: '/mi-perfil/editar',        component: MyProfileEdit,       meta: { requiresAuth: true }, },
    { path: '/mi-perfil/editar/foto',   component: MyProfileEditPhoto,  meta: { requiresAuth: true }, },
    { path: '/usuario/:id',             component: UserProfile,         meta: { requiresAuth: true }, },
    { path: '/usuario/:id/chat',        component: PrivateChat,         meta: { requiresAuth: true }, },
    { path: '/publicaciones',           component: Posts,               meta: { requiresAuth: true }, },
];

// Creamos el router.
// createRouter() recibe un objeto con al menos dos propiedades: routes y
//  history.
// Para history, Vue Router incluye dos opciones:
// - createWebHashHistory()
//  Utiliza el hash ("#") para indicar la ruta a mostrar.
// - createWebHistory()
//  Utiliza la API de History de JS.
// ¿Cuál conviene?
// Desde el punto de vista del SEO, createWebHistory es infinitamente mejor.
// Por esto, de poder usarlo, es lejos la mejor opción.
// ¿Por qué "de poder usarlo"?
// Porque para que funcione adecuadamente en una web, es necesario configurar
// el servidor de una manera especial.
const router = createRouter({
    // routes: routes,
    routes,
    history: createWebHashHistory(),
    // history: createWebHistory(),
});

// Nos suscribimos a los datos del usuario autenticado.
let loggedUser = {
    id: null,
    email: null,
    displayName: null,
    bio: null,
    career: null,
}

subscribeToAuthChanges(newUserData => loggedUser = newUserData);

// Agregamos que en cada navegación de ruta se verifique si la ruta
// requiere autenticación, y de así serlo, verifique si el usuario está
// autenticado. De no estarlo, lo mandamos al login.
router.beforeEach((to, from) => {
    if(to.meta.requiresAuth && loggedUser.id === null) {
        // Redireccionamos al usuario retornando un objeto de ruta.
        return {
            path: '/iniciar-sesion',
        }
    }
});

export default router;