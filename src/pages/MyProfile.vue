<script setup>
import { useLoggedUser } from '../composables/useLoggedUser';
import BaseHeading1 from '../components/BaseHeading1.vue';
import ProfileData from '../components/profile/ProfileData.vue';

const { loggedUser } = useLoggedUser();

// let unsubscribeFromAuth = () => {};

// const loggedUser = ref({
//     id: null,
//     email: null,
//     displayName: null,
//     photoURL: null,
//     bio: null,
//     career: null,
// });

// onMounted(() => {
//     unsubscribeFromAuth = subscribeToAuthChanges(newUserData => loggedUser.value = newUserData);
// });

// onUnmounted(() => {
//     // Cancelamos la suscripción.
//     unsubscribeFromAuth();
// });
</script>

<template>
    <div class="flex items-end gap-4">
        <BaseHeading1>Mi Perfil</BaseHeading1>
        <router-link 
            to="/mi-perfil/editar"
            class="mb-4 text-blue-700 underline"
        >Editar</router-link>
        <router-link 
            to="/mi-perfil/editar/foto"
            class="mb-4 text-blue-700 underline"
        >Editar mi Foto</router-link>
    </div>

    <ProfileData :user="loggedUser" />
</template>