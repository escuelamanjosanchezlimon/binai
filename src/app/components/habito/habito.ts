import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormField, MatLabel, MatSelect, MatOption } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { HabitoData } from '../../shared/interfaces/habito.interface';
import { HabitoService } from './habito.service';
import { mostrarSnack } from '../../shared/utils/mostrar-snack.util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIcon } from "@angular/material/icon";
import { MatAnchor, MatIconButton } from "@angular/material/button";
import { MatPaginator } from '@angular/material/paginator';
import { MatChipListbox, MatChipOption } from "@angular/material/chips";
import { ConfirmDialog } from '../dialog/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogDos } from '../dialog/confirm-dialog-dos/confirm-dialog-dos';



export interface Opcion {
  id: number;
  label: string;
}

@Component({
  selector: 'app-habito',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    MatTableModule,
    MatIcon,
    MatAnchor,
    MatIconButton,
    MatChipListbox,
    MatChipOption,
    MatPaginator
  ],
  templateUrl: './habito.html',
  styleUrl: './habito.scss',
})
export class Habito implements OnInit {

  private fb = inject(FormBuilder);
  registroSeleccionado?: HabitoData;
  modo: string = 'AGREGAR';
  private snack = inject(MatSnackBar);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private readonly dialog = inject(MatDialog);

  private readonly habitoService = inject(HabitoService);
  form = this.fb.group({
    descripcion: ['', [Validators.required, Validators.maxLength(500)]],
    categoria: [1, Validators.required],
    tipo: [null as any, Validators.required],
    estado: [1, Validators.required]
  });


  displayedColumns: string[] = ['categoria', 'tipo', 'descripcion', 'estado'];
  private habitosPreview: HabitoData[] = [];

  dataSource = new MatTableDataSource<HabitoData>([]);
  datosOriginales: HabitoData[] = [];
  habitosActivos: number[] = [];
  private readonly TIPOS_MAP: Record<number, string> = {
    1: 'Desayuno',
    2: 'Almuerzo',
    3: 'Cena',
    4: 'Salida',
    5: 'Pasatiempo',
    6: 'Ejercicio'
  };



  categorias: Opcion[] = [
    { id: 1, label: 'Alimentación' },
    { id: 2, label: 'Entretenimiento' },
  ];

  tiposAlimentacion: Opcion[] = [
    { id: 1, label: 'Desayuno' },
    { id: 2, label: 'Almuerzo' },
    { id: 3, label: 'Cena' },
  ];

  tiposEntretenimiento: Opcion[] = [
    { id: 4, label: 'Salida' },
    { id: 5, label: 'Pasatiempo' },
    { id: 6, label: 'Ejercicio' },
  ];

  estados = [
    { id: 1, label: 'ACTIVO' },
    { id: 2, label: 'INACTIVO' }
  ];

  tipos: Opcion[] = [];
  ngOnInit() {
    this.habitoService.finanza$.subscribe(data => {
      //  this.dataSource.data = data;
      this.datosOriginales = data;
      this.dataSource.data = this.ordenarHabitos(data);
      this.filtrarPorEstado(1);
      this.seleccionarActivosPorDefecto(data);
      this.paginator?.firstPage();
      console.log(this.habitosActivos)
    });

    this.habitoService.getHabitos().subscribe();

    this.actualizarTipos(this.form.value.categoria!);

    this.form.get('categoria')?.valueChanges.subscribe(categoria => {
      this.actualizarTipos(categoria!);
      this.form.get('tipo')?.reset();
    });
  }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

  }


  cargarHabitos(): void {
    this.habitoService.getHabitos().subscribe({
      next: data => {
        this.dataSource.data = data;
      },
      error: err => console.error(err)
    });
  }



  mostrar(row: HabitoData) {
    this.registroSeleccionado = row;
    this.modo = 'ACTUALIZAR';

    this.actualizarTipos(row.categoria);

    const tipoSeleccionado = this.tipos.find(t => Number(t.id) === Number(row.tipo));
    if (!tipoSeleccionado) {
      return;
    }
    this.form.patchValue({
      categoria: row.categoria,
      tipo: tipoSeleccionado.id,
      descripcion: row.descripcion,
      estado: row.estado
    });

    mostrarSnack(this.snack, 'Registro seleccionado', 'Cerrar', 5000);
  }

  cancelar() {
    this.form.patchValue({
      tipo: 0,
      descripcion: '',
      estado: 0,
      categoria: 0
    });
    this.modo = 'AGREGAR';
  }

  actualizar() {
    if (!this.registroSeleccionado) return;


    const original = { ...this.registroSeleccionado }; // copia segura

    const payload = {
      descripcion: String(this.form.value.descripcion),
      categoria: Number(this.form.value.categoria),
      tipo: Number(this.form.value.tipo),
      estado: Number(this.form.value.estado),
    };

    this.habitoService.actualizarHabito(original.id, payload)
      .subscribe(() => {
        this.cancelar();
        mostrarSnack(this.snack, 'Hábito actualizado correctamente', 'Cerrar', 5000);
      });
  }


  eliminar() {
    if (!this.registroSeleccionado) return;

    const habito: HabitoData = this.registroSeleccionado;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        titulo: '¿Eliminar hábito?',
        mensaje: 'Esta acción no se puede deshacer.'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;
      if (!habito?.id) return;

      this.habitoService.eliminarHabito(habito.id).subscribe({
        next: () => {
          mostrarSnack(this.snack, 'Hábito eliminado correctamente.', 'Cerrar', 5000);
          this.cancelar(); // limpiar formulario / modo
        },
        error: err => console.error('Error al eliminar el hábito:', err)
      });
    });
  }


  generarNuevaRutina() {
    this.habitosPreview = this.generarHabitosAleatorios(this.datosOriginales);

    if (!this.habitosPreview.length) {
      mostrarSnack(this.snack, 'No hay hábitos suficientes', 'Cerrar', 3000);
      return;
    }

    const mensajeHTML = this.generarTextoHabitosHTML(this.habitosPreview);

    const dialogRef = this.dialog.open(ConfirmDialogDos, {
      width: '420px',
      data: {
        titulo: 'Vista previa de la rutina',
        mensaje: mensajeHTML
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.aplicarRutinaAleatoria();
      }
    });
  }



  private aplicarRutinaAleatoria(): void {
    const idsRutina = this.habitosPreview.map(h => h.id);

    const cambios = this.datosOriginales
      .map(h => {
        const debeEstarActivo = idsRutina.includes(h.id);
        const nuevoEstado = debeEstarActivo ? 1 : 2;

        // solo mandar los que cambian
        if (h.estado !== nuevoEstado) {
          return { id: h.id, estado: nuevoEstado };
        }

        return null;
      })
      .filter(Boolean) as { id: number; estado: number }[];

    if (!cambios.length) {
      mostrarSnack(this.snack, 'No hay cambios que aplicar', 'Cerrar', 3000);
      return;
    }

    this.habitoService.actualizarEstadoBatch(cambios).subscribe({
      next: () => {
        mostrarSnack(this.snack, 'Rutina aplicada correctamente', 'Cerrar', 4000);
      },
      error: () => {
        mostrarSnack(this.snack, 'Error al aplicar la rutina', 'Cerrar', 4000);
      }
    });
  }





  registrarHabito() {
    const valores = this.form.value;
    if (!valores) {
      return;
    }
    this.habitoService.crearHabito({
      descripcion: String(valores.descripcion),
      tipo: Number(valores.tipo),
      categoria: Number(valores.categoria),
      estado: Number(valores.estado)
    }).subscribe(() => {
      mostrarSnack(this.snack, 'Registro exitoso', 'Cerrar', 5000);
      this.form.reset();
      this.form.patchValue({
        categoria: 1,
        estado: 1
      });

    });
  }

  private generarTextoHabitosHTML(habitos: HabitoData[]): string {
    const tiposLabels: Record<number, string> = {
      1: 'Desayuno',
      2: 'Almuerzo',
      3: 'Cena',
      4: 'Salida',
      5: 'Pasatiempo',
      6: 'Ejercicio'
    };

    return `
    <ul>
      ${habitos.map(h => `<li><strong>${tiposLabels[h.tipo] ?? 'Desconocido'}:</strong> ${h.descripcion}</li>`).join('')}
    </ul>
  `;
  }



  private generarHabitosAleatorios(data: HabitoData[]): HabitoData[] {
    const resultado: HabitoData[] = [];

    const elegirAleatorio = (lista: HabitoData[]) =>
      lista[Math.floor(Math.random() * lista.length)];

    // 🍳 Desayuno
    const desayunos = data.filter(
      h => h.categoria === 1 && h.tipo === 1
    );
    if (desayunos.length) {
      resultado.push(elegirAleatorio(desayunos));
    }

    // 🍛 Almuerzo
    const almuerzos = data.filter(
      h => h.categoria === 1 && h.tipo === 2
    );
    if (almuerzos.length) {
      resultado.push(elegirAleatorio(almuerzos));
    }

    // 🍽 Cena
    const cenas = data.filter(
      h => h.categoria === 1 && h.tipo === 3
    );
    if (cenas.length) {
      resultado.push(elegirAleatorio(cenas));
    }

    // 🎮 Entretenimiento (solo uno)
    const entretenimiento = data.filter(
      h => h.categoria === 2
    );
    if (entretenimiento.length) {
      resultado.push(elegirAleatorio(entretenimiento));
    }

    return resultado;
  }




  private seleccionarActivosPorDefecto(data: HabitoData[]): void {
    this.habitosActivos = data
      .filter(h => h.estado === 1)
      .map(h => h.id);
  }


  private ordenarHabitos(data: HabitoData[]): HabitoData[] {
    console.log(this.datosOriginales)
    const categoriaOrden: Record<number, number> = {
      1: 0, // Alimentación
      2: 1  // Entretenimiento
    };

    const tipoOrdenAlimentacion: Record<number, number> = {
      1: 0, // Desayuno
      2: 1, // Almuerzo
      3: 2  // Cena
    };

    return [...data].sort((a, b) => {
      const catA = categoriaOrden[a.categoria] ?? 99;
      const catB = categoriaOrden[b.categoria] ?? 99;

      if (catA !== catB) {
        return catA - catB;
      }

      if (a.categoria === 1 && b.categoria === 1) {
        const tipoA = tipoOrdenAlimentacion[a.tipo] ?? 99;
        const tipoB = tipoOrdenAlimentacion[b.tipo] ?? 99;

        if (tipoA !== tipoB) {
          return tipoA - tipoB;
        }
      }

      return 0;
    });
  }

  ordenarPersonalizado(): void {
    this.dataSource.data = this.ordenarHabitos(this.dataSource.data);
    this.paginator?.firstPage();
  }


  filtrarPorEstado(estado?: number) {
    this.dataSource.filterPredicate = (data: HabitoData) => {
      if (estado === undefined) return true;      // mostrar todos
      return data.estado === estado;              // filtrar por estado
    };

    this.dataSource.filter = estado === undefined ? '' : estado.toString();
  }

  filtrarPorCategoria(categoria?: number): void {
    this.dataSource.filterPredicate = (data: HabitoData) => {
      if (categoria === undefined) return true; // mostrar todas
      return data.categoria === categoria;
    };

    // Dispara el filtrado
    this.dataSource.filter = categoria === undefined ? '' : categoria.toString();

    // Volver a la primera página si hay paginador
    this.dataSource.paginator?.firstPage();
  }






  private actualizarTipos(categoria: number) {
    if (categoria === 1) {
      this.tipos = this.tiposAlimentacion;
    } else {
      this.tipos = this.tiposEntretenimiento;
    }
  }


  getTipoLabel(id: number): string {
    return this.TIPOS_MAP[id] ?? 'Desconocido';
  }



  getCategoriaLabel(id: number): string {
    return this.categorias.find(t => t.id === id)?.label ?? 'Desconocido';
  }
}






