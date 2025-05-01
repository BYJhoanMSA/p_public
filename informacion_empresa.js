const fs = require('fs');
const axios = require('axios');
const { activarModulo } = require('../utils/checkAccess');

// ✅ Clave válida para activar el módulo
const CLAVE_CORRECTA = 'CLAVE123';

// Ruta para guardar el enlace de Google Docs
const rutaGoogleDocs = './modules/informacion_empresa-doc.json';

/**
 * Valida la clave ingresada por el usuario
 * Si es correcta, activa el módulo y solicita la URL del Google Docs si no está guardada.
 */
async function validarClave(texto) {
    if (texto.trim() === CLAVE_CORRECTA) {
        activarModulo('informacion_empresa');
        
        const enlace = await obtenerEnlaceGuardado();
        if (!enlace) {
            return '❌ No tengo un enlace de Google Docs guardado. Por favor, envíame el enlace del documento para continuar.';
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
 * Solicita el enlace al usuario
 */
async function solicitarEnlaceGoogleDocs() {
    return '🔗 Por favor, envíame el enlace del documento de Google Docs para continuar.';
}

/**
 * Procesa y valida el enlace proporcionado por el usuario.
 * Si es válido y contiene datos esperados, lo guarda.
 */
async function procesarEnlaceGoogleDocs(enlace) {
    try {
        const { data } = await axios.get(enlace);

        if (!Array.isArray(data) || data.length === 0 || !data[0].titulo || !data[0].descripcion) {
            return {
                exito: false,
                mensaje: '⚠️ El documento no tiene el formato esperado. Debe ser un JSON con "titulo" y "descripcion".'
            };
        }

        fs.writeFileSync(rutaGoogleDocs, JSON.stringify({ enlace }), 'utf8');
        return {
            exito: true,
            mensaje: '✅ Enlace válido y guardado exitosamente. Ahora puedo mostrar la información de la empresa.'
        };

    } catch (error) {
        return {
            exito: false,
            mensaje: '❌ No se pudo acceder al enlace. Asegúrate de que esté compartido públicamente y que sea un enlace válido.'
        };
    }
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

/**
 * Función para activar el módulo de información de la empresa.
 */
async function activarModuloInformacionEmpresa(claveUsuario) {
    if (claveUsuario.trim() !== CLAVE_CORRECTA) {
        return '❌ Clave incorrecta. El módulo no se puede activar.';
    }

    const enlace = await obtenerEnlaceGuardado();
    if (!enlace) {
        return '❌ No se ha configurado un enlace de Google Docs. No puedo activar el módulo sin él. Por favor, proporciona el enlace primero.';
    }

    return '✅ El módulo de información de la empresa está activado y funcionando correctamente.';
}

module.exports = {
    validarClave,
    solicitarEnlaceGoogleDocs,
    procesarEnlaceGoogleDocs,
    mostrarInformacionEmpresa,
    activarModuloInformacionEmpresa
};
