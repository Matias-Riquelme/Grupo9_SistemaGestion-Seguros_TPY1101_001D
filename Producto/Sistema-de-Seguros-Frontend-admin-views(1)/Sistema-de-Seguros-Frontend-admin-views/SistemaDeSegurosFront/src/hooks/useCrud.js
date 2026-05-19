import { useState } from "react";

/**
 * Hook personalizado para manejar operaciones CRUD sobre una lista local.
 *
 * @param {Array} datosIniciales - Datos iniciales de la lista
 * @param {string} campoId - Nombre del campo ID en cada registro (ej: "id_cond", "id")
 * @returns {object} Estado y funciones CRUD
 *
 * Ejemplo de uso:
 *   const { items, agregar, actualizar, eliminar } = useCrud(conductoresInicial, "id_cond");
 */
export function useCrud(datosIniciales = [], campoId = "id") {
    const [items, setItems] = useState(datosIniciales);

    /** Agrega un nuevo item con ID auto-generado */
    const agregar = (nuevoItem) => {
        const nuevoId =
            items.length > 0
                ? Math.max(...items.map((item) => item[campoId])) + 1
                : 1;
        setItems([...items, { ...nuevoItem, [campoId]: nuevoId }]);
    };

    /** Actualiza un item existente por su ID */
    const actualizar = (id, datosActualizados) => {
        setItems(
            items.map((item) =>
                item[campoId] === id
                    ? { ...datosActualizados, [campoId]: id }
                    : item
            )
        );
    };

    /** Elimina un item por su ID (con confirmación) */
    const eliminar = (id, mensaje = "¿Estás seguro de que deseas eliminar este registro?") => {
        if (window.confirm(mensaje)) {
            setItems(items.filter((item) => item[campoId] !== id));
            return true;
        }
        return false;
    };

    /** Guarda: crea o actualiza según si existe editandoId */
    const guardar = (datos, editandoId) => {
        if (editandoId) {
            actualizar(editandoId, datos);
        } else {
            agregar(datos);
        }
    };

    return {
        items,
        setItems,
        agregar,
        actualizar,
        eliminar,
        guardar,
    };
}
