/** @type {import('tailwindcss').Config} */
export default {
  // "content" debe llevar una lista de las rutas de archivos que Tailwind
  // debe "observar" ("watch") para detectar las clases que usamos.
  content: [
    // Incluimos el archivo del index (nuestro "entry point").
    "./index.html",
    // Incluimos todos los archivos que tengan como extensión vue, js, jsx,
    // ts o tsx, sin importar su nombre (*.{vue,js,jsx,ts,tsx}), que estén
    // en la carpeta "src/" (./src/) o en cualquiera de sus subcarpetas
    // (**/).
    "./src/**/*.{vue,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      height: {
        '25': '6.25rem',
      },
      gridTemplateRows: {
        'layout': '64px 1fr 100px',
      }
    },
  },
  plugins: [],
}

