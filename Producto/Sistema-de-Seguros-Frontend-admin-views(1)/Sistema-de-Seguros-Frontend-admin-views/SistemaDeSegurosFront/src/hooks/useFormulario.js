import { useState, useCallback } from "react";

/**
 * Hook personalizado para manejar el estado de un formulario CRUD
 * (abrir, cerrar, editar, cambio de inputs).
 *
 * @param {object} valoresVacios - Objeto con los campos vacíos por defecto
 * @param {object} opciones - Opciones adicionales
 * @param {Function} opciones.onInputChange - Callback personalizado para manejar inputs especiales.
 *   Recibe (name, value, setDatos) y debe retornar `true` si manejó el campo, `false` si no.
 * @returns {object} Estado y funciones del formulario
 *
 * Ejemplo de uso:
 *   const { datos, editandoId, mostrar, handleInputChange, abrirNuevo, abrirEditar, cerrar }
 *       = useFormulario(conductorVacio);
 */
export function useFormulario(valoresVacios, opciones = {}) {
    const [datos, setDatos] = useState(valoresVacios);
    const [editandoId, setEditandoId] = useState(null);
    const [mostrar, setMostrar] = useState(false);

    const { onInputChange } = opciones;

    /** Maneja el cambio de cualquier input del formulario */
    const handleInputChange = useCallback(
        (e) => {
            const { name, value } = e.target;

            // Si hay un handler personalizado y manejó el campo, salimos
            if (onInputChange && onInputChange(name, value, setDatos, datos)) {
                return;
            }

            // Comportamiento por defecto
            setDatos((prev) => ({ ...prev, [name]: value }));
        },
        [onInputChange, datos]
    );

    /** Abre el formulario para crear un nuevo registro */
    const abrirNuevo = useCallback(() => {
        setDatos(valoresVacios);
        setEditandoId(null);
        setMostrar(true);
    }, [valoresVacios]);

    /** Abre el formulario para editar un registro existente */
    const abrirEditar = useCallback(
        (registro, id) => {
            setDatos({ ...registro });
            setEditandoId(id);
            setMostrar(true);
        },
        []
    );

    /** Cierra el formulario y limpia el estado */
    const cerrar = useCallback(() => {
        setDatos(valoresVacios);
        setEditandoId(null);
        setMostrar(false);
    }, [valoresVacios]);

    /** Resetea solo los datos del formulario sin cerrarlo */
    const resetDatos = useCallback(() => {
        setDatos(valoresVacios);
    }, [valoresVacios]);

    return {
        datos,
        setDatos,
        editandoId,
        mostrar,
        handleInputChange,
        abrirNuevo,
        abrirEditar,
        cerrar,
        resetDatos,
    };
}
