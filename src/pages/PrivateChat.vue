<script setup>
import BaseButton from '../components/BaseButton.vue';
import BaseHeading1 from '../components/BaseHeading1.vue';
import { useLoggedUser } from '../composables/useLoggedUser';
import { useUser } from '../composables/useUser';
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { savePrivateChatMessage, subscribeToPrivateChatMessages } from '../services/private-chat';
import { formatDate } from '../helpers/date';

const route = useRoute();

const { loggedUser } = useLoggedUser();

const { user, loading: loadingUser } = useUser(route.params.id);

const messages = ref([]);
const loadingMessages = ref(false);

const newMessage = ref({
    text: '',
});

onMounted(async () => {
    loadingMessages.value = true;
    subscribeToPrivateChatMessages(
        loggedUser.value.id,
        route.params.id,
        newMessages => {
            messages.value = newMessages;
            loadingMessages.value = false;
        }
    );
});

async function handleSubmit() {
    try {
        savePrivateChatMessage(
            loggedUser.value.id,
            user.value.id,
            newMessage.value.text,
        );
        newMessage.value.text = '';
    } catch (error) {
        // TODO
    }
}
</script>

<template>
    <BaseHeading1>Chat Privado con {{ user.email }}</BaseHeading1>

    <section class="mb-4">
        <h2 class="sr-only">Mensajes</h2>

        <div class="min-h-[300px] p-4 border rounded">
            <ul class="flex flex-col items-start gap-2">
                <li 
                    v-for="message in messages"
                    class="p-4 rounded"
                    :class="{
                        'bg-gray-200': loggedUser.id !== message.user_id,
                        'bg-green-200 self-end': loggedUser.id === message.user_id,
                        // 'bg-green-200': loggedUser.id === message.user_id,
                        // 'self-end': loggedUser.id === message.user_id,
                    }"
                >
                    <div>{{ message.text }}</div>
                    <div class="text-sm text-gray-700">{{ formatDate(message.created_at) || 'Enviando...' }}</div>
                </li>
            </ul>
        </div>
    </section>
    <form 
        action="#"
        class="flex items-stretch gap-4"
        @submit.prevent="handleSubmit"
    >
        <label for="text" class="sr-only">Mensaje</label>
        <textarea 
            id="text"
            class="w-full min-h-10 p-2 border rounded"
            v-model="newMessage.text"
        ></textarea>
        <BaseButton>Enviar</BaseButton>
    </form>
</template>