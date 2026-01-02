import { MatSnackBar } from '@angular/material/snack-bar';

export function mostrarSnack(
    snack: MatSnackBar,
    mensaje: string,
    accion: string = 'OK',
    duracion: number = 3000
) {
    snack.open(mensaje, accion, {
        duration: duracion,
        horizontalPosition: 'center',
        verticalPosition: 'top'
    });
}
