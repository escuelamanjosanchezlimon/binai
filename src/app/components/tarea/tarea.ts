import { Component, inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogoTarea, tipos } from '../dialog/dialogo-tarea/dialogo-tarea';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { TareaService } from './tarea.service';
import { TareaLista } from '../../shared/interfaces/tarea.interface';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TareaPayload } from '../../shared/interfaces/post-tarea.interface';
import { formatearFechaHora } from '../../shared/utils/fecha.util';
import { convertitMarcaDeTiempoAUnidades, marcaTiempoAFecha } from '../../shared/utils/marca-temporal.util';
import { ConfirmDialog } from '../dialog/confirm-dialog/confirm-dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mostrarSnack } from '../../shared/utils/mostrar-snack.util';

@Component({
  selector: 'app-tarea',
  standalone: true, 
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './tarea.html',
  styleUrl: './tarea.scss',
})
export class Tarea implements OnInit {

  tareas: TareaLista[] = [];

  private readonly dialog = inject(MatDialog);
  private readonly tareaService = inject(TareaService);
  private snack = inject(MatSnackBar);


  tareas$ = this.tareaService.tareas$;

  ngOnInit(): void {
    this.tareaService.cargarTareas({ estado: 'PENDIENTE' });
  }


  filtrarPorEstado(estado: string, limite?: number) {
    this.tareaService.cargarTareas({ estado: estado, limite: limite });
  }

  filtrarPorPrioridad(prioridad: number) {
    this.tareaService.cargarTareas({ prioridad: prioridad, estado: 'PENDIENTE' });
  }

  filtrarTareasDeHoy() {
    this.tareaService.cargarTareas({ fechaHoy: true, estado: 'PENDIENTE' });

  }

  mostrarTarea(tarea: TareaLista | null, modo: string) {
    const dialogRef = this.dialog.open(DialogoTarea, {
      disableClose: true,
      width: '90%',
      data: { tarea: tarea, modo: modo }
    });

    dialogRef.afterClosed().subscribe((nuevaTarea: TareaPayload | undefined) => {
      if (nuevaTarea) {

        if (modo === 'agregar') {
          this.tareaService.crearTarea(nuevaTarea).subscribe(() => {
            mostrarSnack(this.snack, 'Tarea creada con éxito', 'Cerrar', 5000);
          });
        }

        if (modo === 'mostrar' && tarea) {
          this.tareaService.actualizarTarea(Number(tarea.id), nuevaTarea).subscribe(() => {
            mostrarSnack(this.snack, 'Tarea actualizada con éxito', 'Cerrar', 5000);
          });
        }
      }
    });
  }



  cambiarEstado(tarea: TareaLista) {
    if (tarea._loading) return;

    const nuevoEstado = tarea.estado === 'COMPLETADA' ? 'PENDIENTE' : 'COMPLETADA';

    this.tareaService.actualizarEstadoTarea(tarea.id, nuevoEstado)
      .subscribe({
        next: () => {
          mostrarSnack(this.snack, `Estado cambiado a ${nuevoEstado}`, 'Cerrar', 5000);

        },
        error: err => {
          console.error(err);
          mostrarSnack(this.snack, 'Error al cambiar estado', 'Cerrar', 5000);

        }
      });
  }


  eliminar(tarea: TareaLista) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        titulo: 'Eliminar tarea',
        mensaje: `Esta acción no se puede deshacer.`
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;
      if (!tarea?.id) return;

      this.tareaService.eliminarTarea(tarea.id).subscribe({
        next: () => {
          mostrarSnack(this.snack, 'Se ha eliminado la tarea.', 'Cerrar', 5000);

        },
        error: err => console.error('Error al eliminar tarea:', err)
      });
    });
  }



  getTipo(valor: number): string {
    const encontrado = tipos.find(t => t.valor === valor);
    return encontrado ? encontrado.tipo : '❓ Desconocido';
  }


  getFechaExpiracion(marcaDeTiempo: number) {
    return (formatearFechaHora(marcaTiempoAFecha(convertitMarcaDeTiempoAUnidades(marcaDeTiempo))));
  }


}
