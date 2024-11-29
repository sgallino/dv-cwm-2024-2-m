import { onMounted, ref } from "vue";
import { getUserProfileById } from "../services/user-profile";

export function useUser(id) {
    const user = ref({
        id: null,
        displayName: null,
        email: null,
        photoURL: null,
        bio: null,
        career: null,
    });
    const loading = ref(false);
    
    onMounted(async () => {
        loading.value = true;
        user.value = await getUserProfileById(id);
        loading.value = false;
    });

    return {
        user,
        loading,
    }
}