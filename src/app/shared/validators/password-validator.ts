import { AbstractControl, ValidationErrors } from '@angular/forms';

export function clavesIgualesValidator(
    control: AbstractControl
): ValidationErrors | null {
    const clave = control.get('clave')?.value;
    const confirmar = control.get('confirmarClave')?.value;

    if (!clave || !confirmar) return null;

    return clave === confirmar
        ? null
        : { clavesNoCoinciden: true };
}
