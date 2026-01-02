import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
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
import {  formatearFechaHora } from '../../../shared/utils/fecha.util';
import { MatChipsModule } from '@angular/material/chips';
import { DialogoRecordatorio } from '../dialogo-recordatorio/dialogo-recordatorio';
import { calcularTiempoRestante, convertitMarcaDeTiempoAUnidades, generarMarcaDeTiempo, marcaTiempoAFecha } from '../../../shared/utils/marca-temporal.util';
import { TareaPayload } from '../../../shared/interfaces/post-tarea.interface';
import { TareaLista } from '../../../shared/interfaces/tarea.interface';


interface Prioridad {
  valor: number;
  prioridad: string;
}


interface Tipo {
  valor: number;
  tipo: string;
}



interface Unidad {
  valor: number;
  unidad: string;
}

interface Estado {
  valor: string;
  estado: string;
}

export const tipos: Tipo[] = [
  { valor: 1, tipo: '💼 Trabajo' },
  { valor: 2, tipo: ' 🏡 Hogar' },
  { valor: 3, tipo: '✏️ Aprendizaje' },
  { valor: 4, tipo: '💡 Proyecto' },
  { valor: 5, tipo: '😴 Otros' }
];

export interface DialogoTareaData {
  tarea: TareaLista | null;
  modo: 'mostrar' | 'agregar';
}


@Component({
  selector: 'app-dialogo-tarea',
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
    ReactiveFormsModule,
    MatFormFieldModule,
    MatChipsModule
  ],
  providers: [
    provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'es-CR' }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialogo-tarea.html',
  styleUrl: './dialogo-tarea.scss',
})

export class DialogoTarea {


  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<DialogoRecordatorio>);
  fechaLimite: string | null = null;
  tipos: Tipo[] = tipos;
  data: DialogoTareaData | null;




  constructor() {
    this.data = inject(MAT_DIALOG_DATA) as DialogoTareaData | null;

    // Nos suscribimos a los cambios del formulario
    this.form.valueChanges.subscribe((valores) => {
      const cant = Number(valores.cantidad);
      const unid = Number(valores.unidad);

      if (cant > 0 && unid > 0) {
        // 1. Generamos la marca de tiempo basada en los inputs actuales
        const nuevaMarca = generarMarcaDeTiempo(cant, unid);

        // 2. Convertimos esa marca a una fecha real y formateamos
        // Nota: Asegúrate de que las funciones de utilidad reciban los tipos correctos
        const fechaCalculada = marcaTiempoAFecha(convertitMarcaDeTiempoAUnidades(nuevaMarca));

        this.fechaLimite = formatearFechaHora(fechaCalculada);
      } else {
        this.fechaLimite = null;
      }
    });
  }


  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(300)]],
    descripcion: ['', [Validators.required, Validators.maxLength(500)]],
    unidad: [0, [ Validators.required, Validators.min(1)]],
    cantidad: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(9999),
      ]
    ],
    prioridad: [1, Validators.required],
    estado: ['PENDIENTE'],
    tipo: [5, Validators.required],
  });


  ngOnInit() {
    if (this.data && this.data.tarea) {
      const r = this.data.tarea;

      const tiempo = calcularTiempoRestante(
        Number(r.expiracion),      // timestamp en segundos
        r.unidad as 1 | 2 | 3 | 4 | 5 | 6,
      );

      // rellenar el formulario
      this.form.patchValue({
        titulo: r.titulo,
        descripcion: r.descripcion,
        unidad: Number(r.unidad),
        tipo: r.tipo,
        cantidad: tiempo,
        estado: r.estado,
        prioridad: r.prioridad
      });
    }
  }


  guardar() {
    const data = this.form.value;

    let cantidad = this.form.get('cantidad')?.value;
    let unidad = data.unidad;
    let marcaDeTiempo = generarMarcaDeTiempo(Number(cantidad), Number(unidad));
    const tarea: TareaPayload = {
      titulo: String(data.titulo),
      descripcion: String(data.descripcion),
      tipo: Number(data.tipo),
      prioridad: Number(data.prioridad),
      unidad: Number(data.unidad),
      expiracion: Number(marcaDeTiempo),
      estado: String(data.estado)
    }
    this.dialogRef.close(tarea);
  }



  prioridades: Prioridad[] = [
    { valor: 1, prioridad: 'Alta' },
    { valor: 2, prioridad: 'Media' },
    { valor: 3, prioridad: 'Baja' },

  ];




  unidades: Unidad[] = [
    { valor: 2, unidad: 'Minutos' },
    { valor: 3, unidad: 'Horas' },
    { valor: 4, unidad: 'Días' },
    { valor: 5, unidad: 'Meses' },
  ];

  estados: Estado[] = [
    { valor: 'PENDIENTE', estado: '💬 pendiente' },
    { valor: 'COMPLETADA', estado: '✔️ completado' },
    { valor: 'VENCIDO', estado: '❌ vencido' },
    { valor: 'ARCHIVADO', estado: '📁 archivado' },
  ];

}