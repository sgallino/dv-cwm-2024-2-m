<script setup>
import { ref } from 'vue';
import { editMyProfilePhoto } from '../services/auth';
import BaseButton from '../components/BaseButton.vue';
import BaseHeading1 from '../components/BaseHeading1.vue';

const editData = ref({
    photo: null,
    photoPreview: null,
});
const loading = ref(false);

async function handleSubmit() {
    // Si ya estamos trabajando, no hacemos nada.
    if(loading.value) return;

    loading.value = true;

    try {
        await editMyProfilePhoto(editData.value.photo);
    } catch (error) {
        // TODO
    }

    loading.value = false;
}

function handleFileSelection(ev) {
    /*
    Nuestro objetivo acá es obtener la imagen que el usuario seleccionó,
    guardarla en editData, y leerla para poder armar el preview.
    Para obtener la imagen, necesitamos pedírsela al <input>.
    Si bien la podemos obtener usando un document.getElementById(), no
    se recomienda en Vue usar esta función, porque las referencias obtenidas
    de esta forma pueden perderse en cualquier momento.
    En su lugar, lo recomendable es, en este caso, usar el objeto Event
    con su propiedad "target".
    Con la referencia del input file, podemos obtener los archivos que
    seleccionó usando la propiedad "files", que contiene un "FileList".
    FileList es una clase que, en esencia, es una array de objetos File.
    Como nuestro input no tiene la propiedad "multiple", solo puede contener
    un único archivo. Por lo que podemos hard-codear el [0].
    */
    editData.value.photo = ev.target.files[0];
    // console.log("Archivo: ", editData.value.photo);

    // Ahora que contamos con el File, vamos a leerlo para poder hacer la
    // previsualización.
    // Con este objetivo en mente, instanciamos la clase FileReader.
    const reader = new FileReader();

    // Como sucede con otras APIs (por ejemplo, XHR), antes de leer el 
    // archivo tenemos que configurar lo que queremos que se haga al
    // completarse la lectura.
    reader.addEventListener('load', function() {
        // Guardamos el resultado de la lectura.
        editData.value.photoPreview = reader.result;
    });

    // Leemos el archivo.
    // Como queremos usarlo para el "src" de una etiqueta <img>, necesitamos
    // tener el archivo con un formato de URL. Como no tenemos una ruta
    // realmente para poner, vamos a usar una "data URL".
    // Una "data URL" es una URL que utiliza el protocolo "data:",
    // y contiene un archivo codificado como string, generalmente, en base64.
    reader.readAsDataURL(editData.value.photo);
}
</script>

<template>
    <BaseHeading1>Editar mi Foto de Perfil</BaseHeading1>

    <div class="flex gap-4 items-start">
        <form 
            class="w-1/2"
            action="#"
            @submit.prevent="handleSubmit"
        >
            <div class="mb-4">
                <label for="photo" class="block mb-2">Nueva Foto</label>
                <input
                    type="file"
                    id="photo"
                    class="w-full p-2 border rounded"
                    @change="handleFileSelection"
                >
            </div>
            <BaseButton>{{ !loading ? 'Actualizar Foto' : 'Actualizando...' }}</BaseButton>
        </form>
        <div class="w-1/2">
            <h2>Imagen Seleccionada</h2>
            <img
                v-if="editData.photoPreview"
                :src="editData.photoPreview"
                alt=""
            >
        </div>
    </div>
</template>