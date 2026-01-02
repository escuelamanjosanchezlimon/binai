import { AfterViewInit, Component, ViewChild, inject, signal } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { FinanzaData } from '../../shared/interfaces/finanza.interface';
import { FinanzaService } from './finanza.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {   MatSelectModule } from "@angular/material/select";
import {  MatInputModule } from "@angular/material/input";
import { MatDialog } from "@angular/material/dialog";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mostrarSnack } from '../../shared/utils/mostrar-snack.util';
import { ConfirmDialog } from '../dialog/confirm-dialog/confirm-dialog';
import { MatChipOption, MatChipListbox } from "@angular/material/chips";
import { DialogoResumenFinanzas } from '../dialog/dialogo-resumen-finanzas/dialogo-resumen-finanzas';

@Component({
  selector: 'app-finanza',
  templateUrl: 'finanza.html',
  styleUrl: 'finanza.scss',
  imports: [ReactiveFormsModule,
    // Material
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    MatPaginator,
    MatIcon,
    MatAnchor,
    // Pipes
    CurrencyPipe,
    DatePipe, MatIconButton, MatChipOption, MatChipListbox],
})
export class Finanza implements AfterViewInit {

  private finanzaService = inject(FinanzaService);

  displayedColumns: string[] = ['tipo', 'descripcion', 'monto', 'fecha'];

  dataSource = new MatTableDataSource<FinanzaData>([]);
  private snack = inject(MatSnackBar);
  modo: string = 'AGREGAR';
  registroSeleccionado?: FinanzaData;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  form = this.fb.group({
    descripcion: ['', [Validators.required, Validators.maxLength(500)]],
    tipo: [2, [Validators.required]],
    monto: [0, [Validators.required, Validators.min(1)]],

  });

  totalIngresos = signal(0);

  ngOnInit() {

    this.finanzaService.finanza$.subscribe(data => {
      this.dataSource.data = data;
    });

    // 2️⃣ Cargar finanzas
    this.finanzaService.getFinanzas().subscribe();
    this.finanzaService.getTotalIngresos().subscribe(total => {
      // Usamos setTimeout para que Angular termine de chequear la vista antes de cambiar el valor
      setTimeout(() => this.totalIngresos.set(total), 0);
    });
  }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }



  mostrar(row: any) {
    this.registroSeleccionado = row;
    this.modo = 'ACTUALIZAR';
    this.form.patchValue({
      tipo: Number(row.tipo),
      descripcion: row.descripcion,
      monto: row.monto
    });

    mostrarSnack(this.snack, 'Registro seleccionado', 'Cerrar', 5000);
  }

  cancelar() {
    this.form.patchValue({
      tipo: 2,
      descripcion: '',
      monto: 0
    });
    this.modo = 'AGREGAR';
  }



  registrarFinanza() {
    const valores = this.form.value;
    if (!valores) {
      return;
    }
    this.finanzaService.crearFinanza({
      descripcion: String(valores.descripcion),
      tipo: Number(valores.tipo),
      monto: Number(valores.monto),
    }).subscribe(() => {
      mostrarSnack(this.snack, 'Registro exitoso', 'Cerrar', 5000);
      this.form.reset();
      this.form.patchValue({
        tipo: 2,
      });
      this.actualizarIngresoTotal(Number(valores.monto), Number(valores.tipo))

    });
  }


  actualizarFinanza() {
    if (this.registroSeleccionado) {
      const original = { ...this.registroSeleccionado }; // Guardamos copia del viejo
      const nuevoMonto = Number(this.form.value.monto);
      const nuevoTipo = Number(this.form.value.tipo);

      this.finanzaService.actualizarFinanza(Number(original.id), {
        descripcion: this.form.value.descripcion!,
        tipo: nuevoTipo,
        monto: nuevoMonto,
      }).subscribe(() => {
        // 1. Revertir el valor viejo
        if (Number(original.tipo) === 1) this.totalIngresos.update(a => a - Number(original.monto));
        if (Number(original.tipo) === 2) this.totalIngresos.update(a => a + Number(original.monto));
        if (Number(original.tipo) === 3) this.totalIngresos.update(a => a + Number(original.monto));
        if (Number(original.tipo) === 4) this.totalIngresos.update(a => a + Number(original.monto));

        // 2. Aplicar el valor nuevo
        if (nuevoTipo === 1) this.totalIngresos.update(a => a + nuevoMonto);
        if (nuevoTipo === 2) this.totalIngresos.update(a => a - nuevoMonto);
        if (nuevoTipo === 3) this.totalIngresos.update(a => a - nuevoMonto);
        if (nuevoTipo === 4) this.totalIngresos.update(a => a - nuevoMonto);


        this.cancelar();
        mostrarSnack(this.snack, 'Cambio exitoso', 'Cerrar', 5000);
      });
    }
  }


  eliminar() {
    if (this.registroSeleccionado) {
      const finanza: FinanzaData = this.registroSeleccionado;
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '350px',
        data: {
          titulo: '¿Eliminar registro financiero?',
          mensaje: `Esta acción no se puede deshacer.`
        }
      });

      dialogRef.afterClosed().subscribe(confirmado => {
        if (!confirmado) return;
        if (!finanza?.id) return;


        this.finanzaService.eliminarFinanza(finanza.id).subscribe({
          next: () => {
            mostrarSnack(this.snack, 'Se ha eliminado el registro.', 'Cerrar', 5000);
            this.actualizarIngresoTotal(Number(finanza.monto), Number(finanza.tipo), 'ELIMINAR');


          },
          error: err => console.error('Error al eliminar la finanza:', err)
        });
      });
    }
  }

  filtrarFinanzasEsteMes() {
    this.finanzaService.getFinanzasMesActual().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  filtrarFinanzas() {
    this.finanzaService.getFinanzas().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  filtrarFinanzasPorTipo(tipo: number) {
    this.finanzaService.getFinanzasTipo(tipo).subscribe(data => {
      this.dataSource.data = data;
    });
  }


  actualizarIngresoTotal(monto: number, tipo: number, accion?: string) {
    if (tipo === 1) {
      if (accion !== 'ELIMINAR') {
        this.totalIngresos.update(actual => actual + monto);
      } else {
        this.totalIngresos.update(actual => actual - monto);
      }
    }

    if (tipo === 2 || tipo === 3 || tipo === 4) {
      if (accion !== 'ELIMINAR') {
        this.totalIngresos.update(actual => actual - monto);
      } else {
        this.totalIngresos.update(actual => actual + monto);
      }
    }

  }

  mostrarResumenFinanzas() {
    const dialogRef = this.dialog.open(DialogoResumenFinanzas, {
      width: '100%',
      maxWidth: '60vw',
      height: '450px',      // opcional, si quieres que se ajuste al contenido
      data: {
        titulo: '¿Eliminar registro financiero?',
        mensaje: `Esta acción no se puede deshacer.`
      },
      disableClose: true
    });

  }


  tipos = [
    { id: 1, label: 'Ingreso' },
    { id: 2, label: 'Gasto' },
    { id: 3, label: 'Deuda' },
    { id: 4, label: 'Préstamo' },
    { id: 5, label: 'Proyecto' },


  ];

  getTipoLabel(id: number): string {
    return this.tipos.find(t => t.id === id)?.label ?? 'Desconocido';
  }

  getMontoSign(tipo: number): string {
    if (tipo === 1) return '+';
    if (tipo === 2 || tipo === 3 || tipo === 4) return '-';
    return '';
  }

  getMontoClass(tipo: number): string {
    if (tipo === 1) return 'monto-ingreso';
    if (tipo === 2) return 'monto-gasto';
    return '';
  }

}
