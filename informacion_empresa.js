const fs = require('fs');
const axios = require('axios');
const { activarModulo } = require('../utils/checkAccess');

// ✅ Clave válida para activar el módulo
const CLAVE_CORRECTA = 'CLAVE123';

// Ruta para guardar el enlace de Google Docs
const rutaGoogleDocs = './modules/informacion_empresa-doc.json';

/**
 * Valida la clave ingresada por el usuario
 * Si es correcta, activa el módulo
 */
async function validarClave(texto) {
    if (texto.trim() === CLAVE_CORRECTA) {
        activarModulo('informacion_empresa');
        
        // Verificar si el enlace ya está guardado
        const enlace = await obtenerEnlaceGuardado();
        if (!enlace) {
            return '🔗 No tengo un enlace de Google Docs guardado. Por favor, envíame el enlace del documento para continuar.';
        }
        
        return '✅ Clave correcta. Ahora puedo mostrar la información de la empresa.';
    } else {
        return '❌ Clave incorrecta. Por favor, intenta nuevamente.';
    }
}

/**
 * Obtiene el enlace de Google Docs guardado
 */
async function obtenerEnlaceGuardado() {
    if (fs.existsSync(rutaGoogleDocs)) {
        const data = JSON.parse(fs.readFileSync(rutaGoogleDocs, 'utf8'));
        return data.enlace;
    }
    return null;
}

/**
 * Guarda el enlace de Google Docs en un archivo para futura referencia
 */
async function guardarEnlaceGoogleDocs(enlace) {
    try {
        fs.writeFileSync(rutaGoogleDocs, JSON.stringify({ enlace }), 'utf8');
        return '✅ Enlace de Google Docs guardado con éxito. Ahora puedo gestionarlo para mostrar la información de la empresa.';
    } catch (error) {
        return '❌ Error al guardar el enlace de Google Docs. Intenta nuevamente.';
    }
}

/**
 * Solicitar y guardar el enlace de Google Docs
 */
async function solicitarEnlaceGoogleDocs() {
    return '🔗 Por favor, envíame el enlace del documento de Google Docs para continuar.';
}

/**
 * Muestra la información de la empresa desde el enlace de Google Docs
 */
async function mostrarInformacionEmpresa() {
    const enlace = await obtenerEnlaceGuardado();
    if (!enlace) {
        return '❌ No se ha configurado un enlace para el documento de Google Docs. Por favor, envíame el enlace para continuar.';
    }

    try {
        const { data } = await axios.get(enlace);
        if (!data || data.length === 0) {
            return '🚫 No se pudo obtener la información de la empresa desde el enlace proporcionado.';
        }

        // Muestra los primeros 5 elementos o toda la información
        let mensaje = '📊 *Información de la Empresa:*\n\n';
        data.slice(0, 5).forEach((info, index) => {
            mensaje += `*${index + 1}. ${info.titulo}*\n`;
            mensaje += `_${info.descripcion}_\n`;
        });

        return mensaje.trim();
    } catch (error) {
        return '❌ Error al cargar la información de la empresa desde el enlace proporcionado.';
    }
}

module.exports = {
    guardarEnlaceGoogleDocs,
    mostrarInformacionEmpresa,
    validarClave,
    solicitarEnlaceGoogleDocs
};
