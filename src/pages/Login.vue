<script setup>
import { ref } from 'vue';
import BaseButton from '../components/BaseButton.vue';
import BaseHeading1 from '../components/BaseHeading1.vue';
import { login } from '../services/auth';

const user = ref({
    email: '',
    password: '',
});
const loading = ref(false);

async function handleSubmit() {
    if(loading.value) return;
    
    loading.value = true;

    try {
        await login({...user.value});
    } catch (error) {
        console.error("[Login handleSubmit] Error al autenticar: ", error);
        // TODO: Manejar el error y mostrar un feedback.
    }

    loading.value = false;
}
</script>

<template>
    <BaseHeading1>Ingresar a tu Cuenta</BaseHeading1>

    <form 
        action="#"
        @submit.prevent="handleSubmit"
    >
        <div class="mb-4">
            <label for="email" class="block mb-2">Email</label>
            <input
                type="email"
                id="email"
                class="w-full p-2 border rounded"
                v-model="user.email"
            >
        </div>
        <div class="mb-4">
            <label for="password" class="block mb-2">Contraseña</label>
            <input
                type="password"
                id="password"
                class="w-full p-2 border rounded"
                v-model="user.password"
            >
        </div>
        <BaseButton :loading="loading">Ingresar</BaseButton>
    </form>
</template>