// ============================
// FORMATEADORES COMPARTIDOS
// ============================

/**
 * Formatea un valor como RUT chileno (ej: "123456789" → "12.345.678-9").
 * @param {string} value - Valor sin formato
 * @returns {string} RUT formateado
 */
export const formatRut = (value) => {
    // Limpia todo lo que no sea número o K
    let clean = value.replace(/[^0-9kK]/g, "");
    if (clean.length <= 1) return clean;

    const dv = clean.slice(-1).toUpperCase();
    let body = clean.slice(0, -1);

    // Pone los puntos
    body = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${body}-${dv}`;
};

/**
 * Formatea un número de teléfono chileno.
 * @param {string} value - Valor numérico
 * @returns {string} Teléfono formateado (solo dígitos, máx 9)
 */
export const formatTelefono = (value) => {
    return value.replace(/[^0-9]/g, "").slice(0, 9);
};

/**
 * Capitaliza la primera letra de un texto.
 * @param {string} texto
 * @returns {string}
 */
export const capitalizar = (texto) => {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

/**
 * Formatea una fecha ISO a formato legible (dd/mm/yyyy).
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatFecha = (fechaISO) => {
    if (!fechaISO) return "";
    const date = new Date(fechaISO);
    return date.toLocaleDateString("es-CL");
};

/**
 * Formatea un valor como moneda chilena (CLP).
 * @param {number} valor
 * @returns {string} Ej: "$1.234.567"
 */
export const formatMoneda = (valor) => {
    if (valor == null || isNaN(valor)) return "$0";
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0,
    }).format(valor);
};
