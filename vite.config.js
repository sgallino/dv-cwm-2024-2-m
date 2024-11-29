// Importamos el plugin de Vue que queremos registrar.
import vue from '@vitejs/plugin-vue';

// Como todo archivo de configuración, tenemos que exportar un objeto
// de configuración.
export default {
    // Registramos el plugin.
    plugins: [vue()],
}