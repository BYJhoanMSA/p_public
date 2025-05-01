const axios = require('axios');
const fs = require('fs');
const { activarModulo } = require('../utils/checkAccess');
const path = require('path');

// ✅ Clave válida para activar el módulo
const CLAVE_CORRECTA = 'CLAVE123';

// Ruta para guardar el enlace de Google Sheets
const rutaSheet = './modules/recordatorios-sheet.json';
// Ruta para guardar los recordatorios descargados
const rutaRecordatorios = './modules/recordatorios.json';

// Número de milisegundos en un día
const MILISEGUNDOS_UN_DIA = 86400000;

/**
 * Valida la clave ingresada por el usuario
 * Si es correcta, activa el módulo
 */
async function validarClave(texto) {
    if (texto.trim() === CLAVE_CORRECTA) {
        activarModulo('recordatorios');
        return '✅ Clave correcta. Puedo ayudarte con lo que necesites.';
    } else {
        return '❌ Clave incorrecta. Por favor, intenta nuevamente.';
    }
}

/**
 * Solicita el enlace del documento de Google Sheets para los recordatorios
 */
async function obtenerEnlaceSheet(numero) {
    const enlaceSheet = await obtenerEnlaceGuardado();
    if (!enlaceSheet) {
        return '🔗 No se ha configurado un enlace para el documento de recordatorios. Envíame el enlace del Google Sheets para continuar.';
    }
    return `📅 El enlace del documento de recordatorios es: ${enlaceSheet}`;
}

/**
 * Guarda el enlace de Google Sheets en un archivo para futura referencia
 */
async function guardarEnlaceSheet(enlace) {
    try {
        const fs = require('fs');
        fs.writeFileSync(rutaSheet, JSON.stringify({ enlace }), 'utf8');
        return '✅ Enlace de Google Sheets guardado con éxito. Ahora puedo gestionarlo para recordatorios.';
    } catch (error) {
        return '❌ Error al guardar el enlace de Google Sheets. Intenta nuevamente.';
    }
}

/**
 * Obtiene el enlace guardado de Google Sheets
 */
async function obtenerEnlaceGuardado() {
    const fs = require('fs');
    if (fs.existsSync(rutaSheet)) {
        const data = JSON.parse(fs.readFileSync(rutaSheet, 'utf8'));
        return data.enlace;
    }
    return null;
}

/**
 * Obtiene los recordatorios desde Google Sheets y los guarda localmente
 */
async function obtenerRecordatorios() {
    const enlace = await obtenerEnlaceGuardado();
    if (!enlace) {
        return '❌ No se ha configurado un enlace para el documento de recordatorios. Envíame el enlace del Google Sheets.';
    }

    try {
        // Verifica si la información de los recordatorios se actualizó el día de hoy
        const ultimaActualizacion = obtenerFechaUltimaActualizacion();
        const fechaHoy = new Date();
        
        if (!ultimaActualizacion || (fechaHoy - ultimaActualizacion) >= MILISEGUNDOS_UN_DIA) {
            // Si no hay archivo o no se actualizó hoy, descarga los nuevos recordatorios
            const { data } = await axios.get(enlace);
            if (!Array.isArray(data) || data.length === 0) {
                return '🚫 No hay recordatorios disponibles en este momento.';
            }

            // Guardar los recordatorios descargados en un archivo local
            fs.writeFileSync(rutaRecordatorios, JSON.stringify(data), 'utf8');
            actualizarFechaUltimaActualizacion(fechaHoy); // Actualizar la fecha de la última actualización
            return '✅ Los recordatorios han sido actualizados correctamente.';
        }

        // Si ya se actualizó hoy, solo leer los recordatorios guardados
        const recordatorios = JSON.parse(fs.readFileSync(rutaRecordatorios, 'utf8'));
        if (!Array.isArray(recordatorios) || recordatorios.length === 0) {
            return '🚫 No hay recordatorios disponibles en este momento.';
        }

        // Muestra los primeros 5 recordatorios
        const recordatoriosMostrar = recordatorios.slice(0, 5);
        let mensaje = '📅 *Recordatorios pendientes:*\n\n';
        recordatoriosMostrar.forEach((recordatorio, index) => {
            mensaje += `*${index + 1}. ${recordatorio.titulo}*\n`;
            mensaje += `_${recordatorio.descripcion}_\n`;
            mensaje += `📅 Fecha: *${recordatorio.fecha}*\n\n`;
        });

        return mensaje.trim();
    } catch (error) {
        return '❌ Error al cargar los recordatorios desde Google Sheets.';
    }
}

/**
 * Obtiene la fecha de la última actualización de los recordatorios
 */
function obtenerFechaUltimaActualizacion() {
    const rutaFecha = './modules/fecha_ultima_actualizacion.json';
    if (fs.existsSync(rutaFecha)) {
        const data = JSON.parse(fs.readFileSync(rutaFecha, 'utf8'));
        return new Date(data.fecha);
    }
    return null;
}

/**
 * Actualiza la fecha de la última actualización de los recordatorios
 */
function actualizarFechaUltimaActualizacion(fecha) {
    const rutaFecha = './modules/fecha_ultima_actualizacion.json';
    fs.writeFileSync(rutaFecha, JSON.stringify({ fecha: fecha.toISOString() }), 'utf8');
}

module.exports = {
    obtenerRecordatorios,
    validarClave,
    obtenerEnlaceSheet,
    guardarEnlaceSheet
};
