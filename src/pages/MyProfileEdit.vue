<script setup>
import { onMounted, ref } from 'vue';
import BaseHeading1 from '../components/BaseHeading1.vue';
import BaseButton from '../components/BaseButton.vue';
import { editMyProfile, subscribeToAuthChanges } from '../services/auth';
import { onUnmounted } from 'vue';

let unsubscribeFromAuth = () => {}

const loading = ref(false);
const editData = ref({
    displayName: '',
    bio: '',
    career: '',
});

onMounted(() => {
    unsubscribeFromAuth = subscribeToAuthChanges(
        newUserData => editData.value = {
            displayName: newUserData.displayName || '',
            bio: newUserData.bio || '',
            career: newUserData.career || '',
        }
    );
});

onUnmounted(() => {
    unsubscribeFromAuth();
});

const handleSubmit = async () => {
    // Si ya estamos trabajando, no hacemos nada.
    if(loading.value) return;
    
    loading.value = true;

    try {
        await editMyProfile({...editData.value});
    } catch (error) {
        // TODO: Manejar el error y mostrar un mensaje de feedback.
    }
    
    loading.value = false;
}
</script>

<template>
    <BaseHeading1>Editar Mi Perfil</BaseHeading1>

    <form 
        action="#"
        @submit.prevent="handleSubmit"
    >
        <div class="mb-4">
            <label for="bio" class="block mb-2">Biografía</label>
            <textarea 
                id="bio"
                class="w-full min-h-10 p-2 border rounded read-only:bg-gray-200"
                :readonly="loading"
                v-model="editData.bio"
            ></textarea>
        </div>
        <div class="mb-4">
            <label for="displayName" class="block mb-2">Nombre de Usuario</label>
            <input
                type="text"
                id="displayName"
                class="w-full p-2 border rounded read-only:bg-gray-200"
                :readonly="loading"
                v-model="editData.displayName"
            >
        </div>
        <div class="mb-4">
            <label for="career" class="block mb-2">Carrera</label>
            <input
                type="text"
                id="career"
                class="w-full p-2 border rounded read-only:bg-gray-200"
                :readonly="loading"
                v-model="editData.career"
            >
        </div>
        <BaseButton>
            {{ !loading ? 'Guardar Cambios' : 'Grabando...' }}
        </BaseButton>
    </form>
</template>