import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { aDatetimeLocal, ahoraUTC, formatearFecha, formatearFecha2, formatearHora, sumarDias } from '../../../shared/utils/fecha.util';
import { CreateRecordatorio, UpdateRecordatorio } from '../../../shared/interfaces/post-rocordatorio.interface';
import { DialogoRecordatorioService } from './dialogo-recordatorio.service';

import { MatChipsModule } from '@angular/material/chips';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { RecordatorioTabla } from '../../recordatorio/recordatorio';


interface Unidad {
  valor: string;
  unidad: string;
}

interface Estado {
  valor: string;
  estado: string;
}


interface Tipo {
  valor: string;
  tipo: string;

}

export interface DialogoRecordatorioData {
  recordatorio: RecordatorioTabla | null;
  modo: 'mostrar' | 'agregar';
}


@Component({
  selector: 'app-dialogo-recordatorio',
  imports: [
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatIcon,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatChipsModule
  ],
  providers: [
    provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'es-CR' }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialogo-recordatorio.html',
  styleUrl: './dialogo-recordatorio.scss',
})
export class DialogoRecordatorio {


  private fb = inject(FormBuilder);
  private readonly crearRecordatorioService = inject(DialogoRecordatorioService);
  private dialog = inject(MatDialog);
  dialogRef = inject(MatDialogRef<DialogoRecordatorio>);
  nuevaFechaLimite: string | null = null;





  constructor() {
    this.data = inject(MAT_DIALOG_DATA) as DialogoRecordatorioData | null;
    this.form.get('fechaLimite')?.valueChanges.subscribe(fecha => {
      const fechaBase = this.form.get('fechaLimite')?.value;
      const dias = this.form.get('repetirCada')?.value;
      this.nuevaFechaLimite = formatearFecha2(sumarDias(fechaBase, Number(dias)), 'DD/MM/YYYY');

    });
    this.form.get('fechaLimite')?.disable();


    this.form.get('tipo')?.valueChanges.subscribe(tipo => {
      if (tipo === 'CUMPLEAÑOS') {
        this.form.get('unidad')?.setValue('INDEFINIDO');
        this.form.get('repetirCada')?.setValue(365);
        this.form.get('repetirCada')?.disable();
      } else {
        this.form.get('repetirCada')?.enable();
      }

      if (tipo === 'EVENTOS') {
        this.form.get('unidad')?.setValue('INDEFINIDO');
        this.form.get('repetirCada')?.setValue(365);
      }

      this.form.get('fechaLimite')?.enable();

    });
    this.ajustarFormularios(this.data)


  }
  data: DialogoRecordatorioData | null;


  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(300)]],
    descripcion: ['', [Validators.required, Validators.maxLength(500)]],
    fechaLimite: [null as any],
    horaLimite: [null as any],
    unidad: ['', Validators.required],
    repetirCada: [0, [
      Validators.required,
      Validators.min(0),
      Validators.pattern('^[0-9]+$')
    ]],
    estado: ['PENDIENTE', Validators.required],
    tipo: ['', Validators.required],
    fechaCambio: [{ value: null, disabled: true } as any],
  });





  ngOnInit() {

    if (this.data && this.data.recordatorio) {
      const r = this.data.recordatorio;

      const fecha = r.fechaLimite ? new Date(r.fechaLimite) : null;
      const hora = fecha ? new Date(fecha) : null;
      this.form.patchValue({
        titulo: r.titulo,
        descripcion: r.descripcion,
        fechaLimite: fecha,
        horaLimite: hora,
        unidad: r.unidad,
        repetirCada: Number(r.repetirCada),
        estado: r.estado,
        tipo: r.tipo,
        fechaCambio: aDatetimeLocal(r.fechaCambio)
      });

    }
  }


  ajustarFormularios(recordatorio: any) {

    if (recordatorio.tipo === 'CUMPLEAÑOS') {
      this.form.get('repetirCada')?.setValue(365);
      this.form.get('unidad')?.setValue('INDEFINIDO');
      this.form.get('repetirCada')?.disable(); // opcional
    }

    if (recordatorio.tipo === 'EVENTOS') {
      this.form.get('repetirCada')?.setValue(365);
      this.form.get('unidad')?.setValue('INDEFINIDO');
    }


    this.form.valueChanges.subscribe(() => {
      const fechaBase = this.form.get('fechaLimite')?.value;
      const dias = this.form.get('repetirCada')?.value;
      this.nuevaFechaLimite = formatearFecha2(sumarDias(fechaBase, Number(dias)), 'DD/MM/YYYY');


    });
  }

  guardar() {
    const data = this.form.getRawValue();

    // Construir objeto para creación
    const recordatorio: CreateRecordatorio = {
      titulo: String(data.titulo),
      descripcion: String(data.descripcion),
      repetir_cada: Number(data.repetirCada),
      unidad: String(data.unidad),
      fecha_limite: `${formatearFecha(data.fechaLimite)} ${formatearHora(data.horaLimite)}`,
      tipo: String(data.tipo),
      estado: String(data.estado),
    };

    const update: UpdateRecordatorio = {
      ...recordatorio,
      fecha_cambio: new Date(ahoraUTC()) // ahora es Date en UTC
    };

    if (this.data?.recordatorio?.id) {
      const id = this.data.recordatorio.id;
      this.crearRecordatorioService.actualizarRecordatorio(id, update)
        .subscribe({
          next: () => {
            this.dialogRef.close({
              actualizado: true,
              id,
              data: { ...recordatorio }
            });
          },
          error: err => console.error('Error al actualizar:', err)
        });
    } else {
      this.crearRecordatorioService.crearRecordatorio(recordatorio)
        .subscribe({
          next: (nuevo) => {
            this.dialogRef.close({
              creado: true,
              data: nuevo // datos para agregar visualmente
            });
          },
          error: err => console.error('Error al crear:', err)
        });
    }
  }



  eliminar() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        titulo: 'Eliminar recordatorio',
        mensaje: 'Esta acción no se puede deshacer'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;

      if (!this.data?.recordatorio?.id) return;

      const id = Number(this.data.recordatorio.id);

      this.crearRecordatorioService.eliminarRecordatorio(id).subscribe({
        next: () => {
          this.dialogRef.close({ eliminado: true, id });
        },
        error: err => console.error('Error al eliminar:', err)
      });
    });
  }

establecerReinicio() {
  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '350px',
    data: {
      titulo: 'Reiniciar recordatorio',
      mensaje: `La próxima fecha sería el: ${this.nuevaFechaLimite}`
    }
  });

  dialogRef.afterClosed().subscribe(confirmado => {
    if (!confirmado) return;

    const repetirCada = Number(this.form.get('repetirCada')?.value);
    const fechaLimite = this.form.get('fechaLimite')?.value as Date | null;

    if (!fechaLimite || repetirCada <= 0) return;

    const nuevaFecha = sumarDias(fechaLimite, repetirCada);

    this.form.get('fechaLimite')?.setValue(nuevaFecha, {
      emitEvent: false 
    });
  });
}

  unidadades: Unidad[] = [
    { valor: 'TEMPORAL', unidad: 'temporal' },
    { valor: 'INDEFINIDO', unidad: 'indefinido' }
  ];


  estados: Estado[] = [
    { valor: 'PENDIENTE', estado: '💬 pendiente' },
    { valor: 'REALIZADO', estado: '✔️ realizado' },
    { valor: 'CANCELADO', estado: '🚫 cancelado' },
    { valor: 'VENCIDO', estado: '❌ vencido' },
    { valor: 'ARCHIVADO', estado: '📁 archivado' },

  ];


  tipos: Tipo[] = [
    { valor: 'TRABAJO', tipo: '💼 Trabajo' },
    { valor: 'HOGAR', tipo: ' 🏡 Hogar' },
    { valor: 'ENTRETENIMIENTO', tipo: '👾 Entretemiento' },
    { valor: 'CUMPLEAÑOS', tipo: '🎂Cumpleaños' },
    { valor: 'EVENTOS', tipo: '🎄 Eventos' }
  ];
}