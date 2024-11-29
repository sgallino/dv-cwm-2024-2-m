import { onMounted, onUnmounted, ref } from "vue";
import { subscribeToAuthChanges } from "../services/auth";

export function useLoggedUser() {
    let unsubscribeFromAuth = () => {};

    const loggedUser = ref({
        id: null,
        email: null,
        displayName: null,
        photoURL: null,
        bio: null,
        career: null,
    });

    onMounted(() => {
        unsubscribeFromAuth = subscribeToAuthChanges(newUserData => loggedUser.value = newUserData);
    });

    onUnmounted(() => {
        // Cancelamos la suscripción.
        unsubscribeFromAuth();
    });

    return {
        loggedUser,
    }
}