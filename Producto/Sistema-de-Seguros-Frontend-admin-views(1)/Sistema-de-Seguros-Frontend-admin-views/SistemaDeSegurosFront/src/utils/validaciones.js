// ============================
// VALIDACIONES COMPARTIDAS
// ============================

/**
 * Valida un RUT chileno usando el algoritmo Módulo 11.
 * @param {string} rut - RUT con formato (ej: "12.345.678-9")
 * @returns {boolean} true si el RUT es válido
 */
export const validarRut = (rut) => {
    if (!rut || rut.length < 8) return false;
    const clean = rut.replace(/[.-]/g, "");
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1).toUpperCase();

    let suma = 0;
    let multiplo = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        suma += parseInt(body[i]) * multiplo;
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const dvEsperado = 11 - (suma % 11);
    const dvFinal =
        dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

    return dv === dvFinal;
};

/**
 * Valida que los campos obligatorios no estén vacíos.
 * @param {Array<{nombre: string, valor: any}>} campos - Lista de campos a validar
 * @returns {{ valido: boolean, mensaje: string }} Resultado de la validación
 */
export const validarCamposObligatorios = (campos) => {
    const vacios = campos.filter((c) => !String(c.valor).trim());
    if (vacios.length > 0) {
        return {
            valido: false,
            mensaje: `Los siguientes campos son obligatorios: ${vacios.map((c) => c.nombre).join(", ")}`,
        };
    }
    return { valido: true, mensaje: "" };
};

/**
 * Valida que un valor sea numérico.
 * @param {any} valor - Valor a evaluar
 * @returns {boolean} true si el valor es numérico
 */
export const esNumerico = (valor) => {
    return !isNaN(Number(valor));
};

/**
 * Valida que un valor sea un número entero.
 * @param {any} valor - Valor a evaluar
 * @returns {boolean} true si el valor es un número entero
 */
export const esEntero = (valor) => {
    return Number.isInteger(Number(valor));
};

/**
 * Valida que un string tenga un largo mínimo.
 * @param {string} valor - Valor a evaluar
 * @param {number} min - Largo mínimo
 * @returns {boolean}
 */
export const largoMinimo = (valor, min) => {
    return String(valor).trim().length >= min;
};
