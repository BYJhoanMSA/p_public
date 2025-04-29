const axios = require('axios');
const { activarModulo } = require('../utils/checkAccess');

// ✅ Clave válida para activar el módulo
const CLAVE_CORRECTA = 'CLAVE123';

// 🔗 URL de la hoja de cálculo con productos (editable desde Google Sheets)
const SHEET_URL = 'https://opensheet.elk.sh/1r_0r-lkGof7WuYNtqLF-QGtoh4s56UJA-ZYDol6woks/Productos';

/**
 * Valida la clave ingresada por el usuario
 * Si es correcta, activa el módulo
 */
async function validarClave(texto) {
    if (texto.trim() === CLAVE_CORRECTA) {
        activarModulo('productos');
        return '✅ Clave correcta. Puedo ayudarte con lo que necesites.';
    } else {
        return '❌ Clave incorrecta. Por favor, intenta nuevamente.';
    }
}

/**
 * Obtiene productos desde Google Sheets y los devuelve en un formato legible
 */
async function obtenerProductos() {
    try {
        const { data } = await axios.get(SHEET_URL);

        if (!Array.isArray(data) || data.length === 0) {
            return '🚫 No hay productos disponibles en este momento.';
        }

        // Muestra los primeros 5 productos
        const productosMostrar = data.slice(0, 5);
        let mensaje = '🛒 *Productos Disponibles:*\n\n';
        productosMostrar.forEach((producto, index) => {
            mensaje += `*${index + 1}. ${producto.Nombre_Producto}*\n`;
            mensaje += `_${producto.descripcion}_\n`;
            mensaje += `💵 Precio: *$${producto.precio}*\n\n`;
        });

        return mensaje.trim();
    } catch (error) {
        return '❌ Error al cargar los productos.';
    }
}

module.exports = {
    obtenerProductos,
    validarClave
};
