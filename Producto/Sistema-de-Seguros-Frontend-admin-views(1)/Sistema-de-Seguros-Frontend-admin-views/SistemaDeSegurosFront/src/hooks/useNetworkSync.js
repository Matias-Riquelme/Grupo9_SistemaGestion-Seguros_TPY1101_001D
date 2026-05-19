import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { sincronizarFormulariosOffline, obtenerFormulariosPendientesOffline } from '../services/formularioIncidenteService';

export const useNetworkSync = () => {
    const [estaOnline, setEstaOnline] = useState(navigator.onLine);
    const [pendientes, setPendientes] = useState(0);

    // Cargar inicialmente la cantidad de pendientes
    const actualizarPendientes = async () => {
        const cantidad = await obtenerFormulariosPendientesOffline();
        setPendientes(cantidad);
    };

    useEffect(() => {
        actualizarPendientes();
        // Un timer para verificar regularmente, por si se guarda algo offline y este componente no se re-renderiza
        const interval = setInterval(actualizarPendientes, 5000);
        return () => clearInterval(interval);
    }, []);

    const sincronizar = async () => {
        try {
            const sincs = await sincronizarFormulariosOffline();
            actualizarPendientes();
            
            if (sincs > 0) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Sincronización exitosa!',
                    text: `Se han enviado automáticamente ${sincs} formularios pendientes al volver la conexión.`,
                    timer: 5000,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false
                });
            } else if (navigator.onLine && (await obtenerFormulariosPendientesOffline()) > 0) {
                Swal.fire('Error', 'Hubo un problema sincronizando. Revisa tu sesión o la consola.', 'error');
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const handleOnline = async () => {
            setEstaOnline(true);
            sincronizar();
        };

        const handleOffline = () => {
            setEstaOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Si arranca online y hay offline forms, que los envíe
        if (navigator.onLine) {
            handleOnline();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { estaOnline, pendientes, sincronizar };
};
