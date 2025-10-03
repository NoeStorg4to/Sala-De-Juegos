import Swal from "sweetalert2";

export class AlertService {

    success(message: string, title: string = '¡Éxito!') {
        return Swal.fire({
            title,
            text: message,
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });
    }

    error(message: string, title: string = 'Error') {
        return Swal.fire({
            title,
            text: message,
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }

    confirm(message: string, title: string = '¿Estás segura?') {
        return Swal.fire({
        title,
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar'
        });
    }
}