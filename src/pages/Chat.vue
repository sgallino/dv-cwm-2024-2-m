<script setup>
import BaseHeading1 from '../components/BaseHeading1.vue';
import BaseButton from '../components/BaseButton.vue';
import { onMounted, ref } from 'vue';
import { savePublicChatMessage, subscribeToPublicChatMessages } from '../services/public-chat';
import { useLoggedUser } from '../composables/useLoggedUser';
import { formatDate } from '../helpers/date';

const messages = ref([]);

const newMessage = ref({
    text: '',
});

const { loggedUser } = useLoggedUser();

// Tan pronto se carga el componente, queremos leer los mensajes de
// Firestore.
onMounted(async () => {
    subscribeToPublicChatMessages(newMessages => messages.value = newMessages);
});

function handleSubmit() {
    savePublicChatMessage({
        user_id: loggedUser.value.id,
        email: loggedUser.value.email,
        text: newMessage.value.text,
    });
    
    newMessage.value.text = '';
}
</script>

<template>
    <BaseHeading1>Chat Público</BaseHeading1>

    <div class="flex gap-4">
        <section class="w-3/4">
            <h2 class="sr-only">Mensajes</h2>

            <div class="min-h-32 p-4 border rounded">
                <ul class="flex flex-col items-start gap-2">
                    <li 
                        v-for="message in messages"
                        class="p-4 rounded bg-gray-200"
                    >
                        <div>
                            <router-link
                                :to="`/usuario/${message.user_id}`"
                                class="font-bold text-blue-700 underline"
                            >{{ message.email }}</router-link> 
                            dijo:
                        </div>
                        <div>{{ message.text }}</div>
                        <div class="text-sm text-gray-700">{{ formatDate(message.created_at) || 'Enviando...' }}</div>
                    </li>
                </ul>
            </div>
        </section>
        <section class="w-1/4">
            <h2 class="mb-4 text-xl">Enviar un mensaje</h2>
            <form 
                action="#"
                @submit.prevent="handleSubmit"
            >
                <div class="mb-4">
                    <span for="email" class="block mb-2">Email</span>
                    <span>{{ loggedUser.email }}</span>
                </div>
                <div class="mb-4">
                    <label for="text" class="block mb-2">Mensaje</label>
                    <textarea 
                        id="text"
                        class="w-full min-h-10 p-2 border rounded"
                        v-model="newMessage.text"
                    ></textarea>
                </div>
                <BaseButton 
                    class="w-full" 
                >Enviar</BaseButton>
            </form>
        </section>
    </div>
</template>