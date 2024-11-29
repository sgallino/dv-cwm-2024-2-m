/**
* 
* @param {Date|null} date 
* @returns {string} La fecha con formato "DD/MM/AAAA hh:ii". Retorna null si date es null.
*/
export function formatDate(date) {
    if(!date) return null;

    // Vamos a formatear la fecha usando la clase Intl.DateTimeFormat().
    const formatter = new Intl.DateTimeFormat('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false, second: '2-digit',
    });

    // Usamos el formateador que creamos para darle la forma al Date.
    return formatter.format(date).replace(',', '');
}