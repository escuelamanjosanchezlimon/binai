import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { RecordatorioService } from './recordatorio.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mostrarSnack } from '../../shared/utils/mostrar-snack.util';
import { DialogoRecordatorio } from '../dialog/dialogo-recordatorio/dialogo-recordatorio';
import { aDatetimeLocal } from '../../shared/utils/fecha.util';

export interface RecordatorioTabla {
  id: number;
  titulo: string;
  descripcion: string;
  repetirCada: number;
  unidad: string;
  fechaLimite: Date;
  createAt: Date;
  tipo: string;
  estado: string;
  fechaCambio: Date | null | string;
  tiempoRestante: string;
}



@Component({
  selector: 'app-recordatorio',
  imports: [MatTableModule, MatPaginatorModule, MatIcon, MatButtonModule, MatChipsModule, FormsModule, NgClass],
  templateUrl: './recordatorio.html',
  styleUrl: './recordatorio.scss',
})
export class Recordatorio implements AfterViewInit {


  private readonly recordatorioService = inject(RecordatorioService);
  private snack = inject(MatSnackBar);
  displayedColumns: string[] = ['tiempoRestante', 'titulo', 'descripcion', 'tipo'];
  dataSource = new MatTableDataSource<RecordatorioTabla>([]);
  private readonly dialog = inject(MatDialog);


  @ViewChild(MatPaginator) paginator!: MatPaginator;



  ngOnInit() {
    this.cargarTabla();
  }


  private mapearRecordatorios(data: any[]) {
    return data.map(r => ({
      id: r.id,
      titulo: r.titulo,
      descripcion: r.descripcion,
      repetirCada: r.repetir_cada,
      unidad: r.unidad,
      fechaLimite: new Date(r.fecha_limite),
      createAt: new Date(r.create_at),
      tipo: r.tipo,
      estado: r.estado,
      fechaCambio: aDatetimeLocal(r.fecha_cambio),
      tiempoRestante: this.calcularTiempoRestante(
        new Date(r.fecha_limite)
      )
    }));
  }
  cargarTabla() {
    this.recordatorioService.getRecordatorios().subscribe({
      next: data => {
        this.dataSource.data = this.mapearRecordatorios(data);
      },
      error: err => console.error(err)
    });
  }


  filtrarTablaPorRecordatoriosEstaSemana() {
    this.recordatorioService.getRecordatoriosSemana().subscribe({
      next: data => {
        this.dataSource.data = this.mapearRecordatorios(data);
      },
      error: err => console.error(err)
    });
  }

  filtrarTablaPorRecordatoriosHoyEn15() {
    this.recordatorioService.getRecordatoriosProximos15Dias().subscribe({
      next: data => {
        this.dataSource.data = this.mapearRecordatorios(data);
      },
      error: err => console.error(err)
    });
  }

  filtrarTablaPorRecordatoriosHoyEn30() {
    this.recordatorioService.getRecordatoriosProximos30Dias().subscribe({
      next: data => {
        this.dataSource.data = this.mapearRecordatorios(data);
      },
      error: err => console.error(err)
    });
  }

  filtrarTablaRecordatoriosArchivados() {
    this.recordatorioService.getRecordatoriosArchivados().subscribe({
      next: data => {
        this.dataSource.data = this.mapearRecordatorios(data);
      },
      error: err => console.error(err)
    });
  }


  filtrarTablaPorRecordatoriosTipo(tipo: string) {
    this.recordatorioService.getRecordatoriosPorTipo(tipo).subscribe({
      next: data => {
        this.dataSource.data = this.mapearRecordatorios(data);
      },
      error: err => console.error(err)
    });
  }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  private calcularTiempoRestante(fechaLimite: Date): string {
    const ahoraCR = new Date(
      new Date().toLocaleString('en-US', {
        timeZone: 'America/Costa_Rica'
      })
    );

    const diff = fechaLimite.getTime() - ahoraCR.getTime();
    if (diff <= 0) return 'Vencido';

    const totalSegundos = Math.floor(diff / 1000);
    const dias = Math.floor(totalSegundos / 86400);
    const horas = Math.floor((totalSegundos % 86400) / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    if (dias > 0) return `${dias}d ${horas}h ${minutos}m`;
    if (horas > 0) return `${horas}h ${minutos}m`;
    if (minutos > 0) return `${minutos}m ${segundos}s`;
    return `${segundos}s`;
  }

  mostrarRecordatorio(row: RecordatorioTabla | null, modo: string) {

    const dialogRef = this.dialog.open(DialogoRecordatorio, {
      disableClose: true,
      width: '90%',
      data: { recordatorio: row, modo: modo }

    });

    if (modo === 'agregar') {
      dialogRef.afterClosed().subscribe((actualizo: boolean) => {
        if (actualizo) {
          this.cargarTabla();
          mostrarSnack(this.snack, 'Recordatorio guardado correctamente', 'Cerrar', 5000);
        }
      });
    }

    if (modo === 'mostrar') {
      dialogRef.afterClosed().subscribe((resultado) => {
        if (!resultado) return;

        if (resultado.eliminado) {
          this.dataSource.data = this.dataSource.data.filter(r => r.id !== resultado.id);
          mostrarSnack(this.snack, 'Recordatorio eliminado', 'Cerrar', 5000);
        }
        else if (resultado.actualizado) {
          const index = this.dataSource.data.findIndex(r => r.id === resultado.id);
          if (index > -1) {
            const dataActualizada = [...this.dataSource.data];

            const fechaLimiteDate = resultado.data.fecha_limite ? new Date(resultado.data.fecha_limite) : dataActualizada[index].fechaLimite;

            dataActualizada[index] = {
              ...dataActualizada[index],
              ...resultado.data,
              fechaLimite: fechaLimiteDate,

              fechaCambio: new Date(),
              tiempoRestante: this.calcularTiempoRestante(fechaLimiteDate),
              repetirCada: resultado.data.repetir_cada
            };

            this.dataSource.data = dataActualizada;
            mostrarSnack(this.snack, 'Recordatorio actualizado', 'Cerrar', 5000);
          }
        }
      });
    }
  }

}
