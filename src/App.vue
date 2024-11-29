<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { logout, subscribeToAuthChanges } from './services/auth';

const router = useRouter();

const loggedUser = ref({
    id: null,
    email: null,
});

onMounted(() => {
    subscribeToAuthChanges(newUserData => loggedUser.value = newUserData);
});

const handleLogout = () => {
    logout();
    router.push('/iniciar-sesion');
}
</script>

<template>
    <!-- 
    Muchas de las clases que permiten tener un tamaño asociado, como:
        .p- (padding)
        .m- (margin)
        .h- (height)
        .w- (width)
    
    Permiten varios tipos distintos de valores. El más común que existe en
    todos es llevar un número que es un múltiplo de ".25rem".
    Por ejemplo:
        .p-1 => padding: .25rem;
        .p-2 => padding: .5rem;
        .p-3 => padding: .75rem;
        .p-4 => padding: 1rem;
        .p-5 => padding: 1.25rem;
        .p-8 => padding: 2rem;
    
    # Repaso rem / em:
    em (que viene de la letra "m") es una unidad de mediad relativa de CSS.
    Indica una proporción en relación al tamaño de la fuente del elemento.
    En general, la mayoría de los clientes (browsers) tienen por defecto
    un tamaño de fuente de 16px. Esto hace que para hacer cálculos 
    aproximados, normalmente tomemos que 1em ~= 16px

    em/rem deben usarse, como mínimo, para tamaño de fuente tipográfica.
    -->
    <nav class="flex justify-between items-center p-4 bg-slate-200 text-slate-800">
        <router-link to="/" class="text-xl">DV Social</router-link>

        <ul class="flex gap-4 items-center">
            <li><router-link class="block py-1 px-2" to="/">Home</router-link></li>
            <template v-if="loggedUser.id !== null">
                <li><router-link class="block py-1 px-2" to="/publicaciones">Publicaciones</router-link></li>
                <li><router-link class="block py-1 px-2" to="/chat">Chat</router-link></li>
                <li><router-link class="block py-1 px-2" to="/mi-perfil">Mi Perfil</router-link></li>
                <li>
                    <form action="#" @submit.prevent="handleLogout">
                        <button type="submit">{{ loggedUser.email }} (Cerrar Sesión)</button>
                    </form>
                </li>
            </template>
            <template v-else>
                <li><router-link class="block py-1 px-2" to="/registrarse">Crear Cuenta</router-link></li>
                <li><router-link class="block py-1 px-2" to="/iniciar-sesion">Iniciar Sesión</router-link></li>
            </template>
        </ul>
    </nav>
    <main class="p-4">
        <router-view />
    </main>
    <!-- 
    Para el alto del footer teníamos 100px.
    Revisando, vemos que Tailwind no tiene contemplado ese tamaño específico.
    Lo más cercano que abarca, es h-24 que son 96px.

    Si eso es suficiente, listo.
    ¿Pero qué pasa si necesitamos que sea exactamente 100px, un valor que
    Tailwind no contempla?
    Tenemos 3 opciones:
    1. Saltearnos a Tailwind, y crear una clase que defina ese valor por
    nuestra cuenta. En general, no es la manera recomendada.
    2. Usar estilos con valores arbitrarios.
        Tailwind nos permite cuando especificamos una clase indicar un valor
        arbitrario para el valor del estilo, usando [].
        Esto es especialmente útil para poner estilos "one-off" (de una única
        vez).
    3. Registrar el valor con un estilo en la configuración de Tailwind.
    -->
    <!-- <footer class="flex justify-center items-center h-[6.25rem] bg-slate-800 text-white"> -->
    <footer class="flex justify-center items-center h-25 bg-slate-800 text-white">
        <p>Copyright &copy; Da Vinci 2024</p>
    </footer>
</template>

