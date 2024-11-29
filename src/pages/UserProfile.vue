<script setup>
import { useRoute } from 'vue-router';
import BaseHeading1 from '../components/BaseHeading1.vue';
import ProfileData from '../components/profile/ProfileData.vue';
import { useUser } from '../composables/useUser';

const route = useRoute();

const { user, loading } = useUser(route.params.id);
</script>

<template>
    <BaseHeading1>Perfil de {{ user.email }}</BaseHeading1>

    <ProfileData :user="user" />

    <hr class="mb-4">

    <router-link
        :to="`/usuario/${user.id}/chat`"
        class="text-blue-700 underline"
    >Conversación Privada con {{ user.email }}</router-link>
</template>