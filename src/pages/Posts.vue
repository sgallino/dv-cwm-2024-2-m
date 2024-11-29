<script setup>
import BaseButton from '../components/BaseButton.vue';
import BaseHeading1 from '../components/BaseHeading1.vue';
import BaseLoader from '../components/BaseLoader.vue';
import { useLoggedUser } from '../composables/useLoggedUser';
import { createPost, fetchPosts, fetchPostsFrom, deletePost } from '../services/posts';
import { ref, onMounted } from 'vue';

const { loggedUser: user } = useLoggedUser();
const { loading, newPost, handleCreate } = usePostCreateForm(user);
const { 
    loading: loadingPosts, 
    posts, 
    newPostLoaderSign, 
    loadingMore: loadingMorePosts,
    handleDeletePost,
} = usePosts();

function usePostCreateForm(user) {
    const loading = ref(false);
    const newPost = ref({
        title: '',
        body: '',
    });

    async function handleCreate() {
        loading.value = true;

        try {
            await createPost({
                ...newPost.value,
                user_id: user.value.id,
                email: user.value.email,
            });
        } catch (error) {
            // TODO:
            console.error("[Posts.vue] Error al crear el post ", error);
        }

        loading.value = false;
    }

    return {
        loading,
        newPost,
        handleCreate,
    }
}

function usePosts() {
    const loading = ref(true);
    const posts = ref([]);
    const newPostLoaderSign = ref(null);
    const loadingMore = ref(false);
    
    // Creamos el Intersection Observer que nos permite detectar la
    // intersección de dos elementos de HTML: Un contenedor, y un
    // "observado".
    const observer = new IntersectionObserver(entries => {
        // Este callback debe indicar lo que queremos que suceda cuando
        // se dispare la intersección entre el elemento contendor
        // y el "observado".
        // "entries" contiene un array de objetos 
        // IntersectionObserverEntry. Este objeto contiene varios datos
        // relaciones, incluyendo "isIntersecting" que nos indica si
        // el elemento es visible o no.
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                // console.log("Intersección detectada");
                loadMorePosts();
            }
        });
    });

    onMounted(async () => {
        posts.value = await fetchPosts();
        loading.value = false;

        setIntersectionObserver();
    });

    function setIntersectionObserver() {
        // console.log(newPostLoaderSign, newPostLoaderSign.value);

        // Observamos al elemento.
        observer.observe(newPostLoaderSign.value);
    }

    async function loadMorePosts() {
        // Si ya estamos trayendo más posts, salimos.
        if(loadingMore.value) return;

        loadingMore.value = true;

        try {
            // Traemos los próximos posts que siguen a los que tenemos.
            const newPosts = await fetchPostsFrom(
                posts.value[posts.value.length - 1].created_at,
            );

            if(newPosts.length == 0) {
                // Cancelamos el observer de intersección, ya que no hay
                // más registros.
                observer.unobserve(newPostLoaderSign.value);
            }

            posts.value = [
                ...posts.value,
                ...newPosts,
            ]
        } catch (error) {
            console.error('[Posts.vue] Error al cargar más posts', error);
        }

        loadingMore.value = false;
    }

    /**
     * 
     * @param {string} id 
     */
    async function handleDeletePost(id) {
        try {
            await deletePost(id);

            // Si el post se eliminó con éxito, lo removemos del array
            // de posts.
            posts.value = posts.value.filter(post => post.id !== id);
        } catch (error) {
            console.error('[Posts.vue] Error al eliminar el post ', id, error);
        }
    }

    return {
        loading,
        loadingMore,
        posts,
        newPostLoaderSign,
        handleDeletePost,
    }
}
</script>

<template>
    <BaseHeading1>Lista de Publicaciones</BaseHeading1>

    <form
        action="#"
        class="mb-4"
        @submit.prevent="handleCreate"
    >
        <div class="mb-4">
            <label for="title" class="block mb-2">Título</label>
            <input
                type="text"
                id="title"
                class="w-full p-2 border rounded"
                v-model="newPost.title"
            >
        </div>
        <div class="mb-4">
            <label for="body" class="block mb-2">Cuerpo</label>
            <textarea 
                id="body"
                class="w-full min-h-10 p-2 border rounded"
                v-model="newPost.body"
            ></textarea>
        </div>
        <BaseButton>Grabar</BaseButton>
    </form>

    <section class="p-4 mb-4">
        <h2 class="mb-4 text-2xl">Publicaciones</h2>

        <ul
            v-if="!loadingPosts"
            class="flex flex-col gap-4"
        >
            <li
                v-for="post in posts"
                class="flex justify-between p-4 border rounded"
            >
                <div>
                    <h3 class="mb-4 text-xl">{{ post.title }}</h3>
                    <p class="mb-4">Escrito por <i>{{ post.email }}</i></p>
                    <div>{{ post.body }}</div>
                </div>
                <div>
                    <form
                        action="#"
                        @submit.prevent="handleDeletePost(post.id)"
                    >
                        <BaseButton color="red">Eliminar</BaseButton>
                    </form>
                </div>
            </li>
        </ul>
        <BaseLoader v-else />

        <BaseLoader v-if="loadingMorePosts" />

        <div ref="newPostLoaderSign"></div>
    </section>
</template>