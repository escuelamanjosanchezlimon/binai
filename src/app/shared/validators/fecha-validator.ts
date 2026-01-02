import { AbstractControl, ValidationErrors } from '@angular/forms';

export function validarFechaDDMMYYYY(
    control: AbstractControl
): ValidationErrors | null {
    const valor = control.value;
    if (!valor) return null;

    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (!regex.test(valor)) {
        return { formatoFecha: true };
    }

    const [d, m, y] = valor.split('/').map(Number);
    const fecha = new Date(y, m - 1, d);

    if (
        fecha.getFullYear() !== y ||
        fecha.getMonth() !== m - 1 ||
        fecha.getDate() !== d
    ) {
        return { fechaInvalida: true };
    }

    return null;
}
