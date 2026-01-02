import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { MatDialogRef, MatDialogContent, MatDialogActions, MatDialogTitle } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DialogoResumenFinanzasService } from './dialogo-resumen-finanzas.service';
import { MatAnchor } from "@angular/material/button";

@Component({
  selector: 'app-dialogo-resumen-finanzas',
  standalone: true,
  imports: [CommonModule, MatDialogContent, MatDialogActions, MatAnchor, MatDialogTitle],
  templateUrl: './dialogo-resumen-finanzas.html',
  styleUrl: './dialogo-resumen-finanzas.scss',
})
export class DialogoResumenFinanzas implements OnInit {

  private readonly finanzasService = inject(DialogoResumenFinanzasService);

  constructor(
    public dialogRef: MatDialogRef<DialogoResumenFinanzas>
  ) {}

  // Signals base
  totalIngresosMes = signal(0);
  totalGastosMes   = signal(0);
  totalDeudasMes   = signal(0);
  totalPrestamosMes = signal(0);

  gastoTotal = computed(() =>
    this.totalGastosMes() +
    this.totalDeudasMes() +
    this.totalPrestamosMes()
  );

  saldoRestante = computed(() =>
    this.totalIngresosMes() - this.gastoTotal()
  );

  ngOnInit() {
    this.finanzasService.getTotalesMesActual().subscribe({
      next: (data) => {
        const totales = data[0];

        this.totalIngresosMes.set(totales.total_ingreso);
        this.totalGastosMes.set(totales.total_gasto);
        this.totalDeudasMes.set(totales.total_deuda);
        this.totalPrestamosMes.set(totales.total_prestamo);
      },
      error: err => console.error('Error al obtener totales', err)
    });
  }

  cancelar() {
    this.dialogRef.close(false);
  }

  confirmar() {
    this.dialogRef.close(true);
  }

  calcularPorcentaje(parte: number, total: number): number {
    if (total === 0) return 0;
    return +((parte / total) * 100).toFixed(1);
  }
}
