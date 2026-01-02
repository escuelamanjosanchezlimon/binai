import { AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { SecretoService } from './secreto.service';
import { SecretoData, SecretoPayload } from '../../shared/interfaces/secreto.interface';
import { MatDialog } from '@angular/material/dialog';
import { DialogoSecreto } from '../dialog/dialogo-secreto/dialogo-secreto';
import { mostrarSnack } from '../../shared/utils/mostrar-snack.util';
import { MatSnackBar } from '@angular/material/snack-bar';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, filter, of, switchMap, tap } from 'rxjs';
import { DialogoVerSecreto } from '../dialog/dialogo-ver-secreto/dialogo-ver-secreto';
import { ConfirmDialog } from '../dialog/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-secreto',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './secreto.html',
  styleUrl: './secreto.scss',
})
export class Secreto implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['descripcion', 'accion'];
  dataSource = new MatTableDataSource<SecretoData>();
  private readonly dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  private destroyRef = inject(DestroyRef);


  private readonly secretoService = inject(SecretoService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.secretoService.getSecretos().subscribe();

    this.secretoService.secreto$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.dataSource.data = data;
      });
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }


  mostrarSecreto(row: SecretoData | null, modo: 'registrar' | 'actualizar') {
    if (!row && modo === 'actualizar') return; // previene errores

    this.dialog
      .open(DialogoSecreto, {
        disableClose: true,
        width: '90%',
        data: { secreto: row, modo: modo }
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap((nuevoSecreto: SecretoPayload) => {
          if (modo === 'registrar') {
            return this.secretoService.crearSecreto(nuevoSecreto).pipe(
              tap(() => mostrarSnack(this.snack, 'Secreto registrado con éxito', 'Cerrar', 5000)),
              catchError(err => {
                console.error(err);
                mostrarSnack(this.snack, 'Error al registrar secreto', 'Cerrar', 5000);
                return of(null);
              })
            );
          }

          if (modo === 'actualizar' && row?.id != null) {
            const cambios = {
              descripcion: nuevoSecreto.descripcion,
              contenido: nuevoSecreto.contenido,
              salt: nuevoSecreto.salt
            };
            return this.secretoService.modificarSecreto(Number(row.id), cambios).pipe(
              tap(() => mostrarSnack(this.snack, 'Secreto actualizado con éxito', 'Cerrar', 5000)),
              catchError(err => {
                console.error(err);
                mostrarSnack(this.snack, 'Error al actualizar secreto', 'Cerrar', 5000);
                return of(null);
              })
            );
          }

          return of(null);
        })
      )
      .subscribe();
  }



  mostrarDialogVerSecreto(row: SecretoData) {
    console.log(row)
    this.dialog
      .open(DialogoVerSecreto, {
        disableClose: true,
        width: '90%',
        data: { secreto: row, modo: 'mostrar' }
      })
  }



  eliminar(secreto: SecretoData) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        titulo: '¿Eliminar secreto?',
        mensaje: `Esta acción no se puede deshacer.`
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;
      if (!secreto?.id) return;

      this.secretoService.eliminarSecreto(secreto.id).subscribe({
        next: () => {
          mostrarSnack(this.snack, 'Se ha eliminado el secreto.', 'Cerrar', 5000);

        },
        error: err => console.error('Error al eliminar el secreto:', err)
      });
    });
  }



}
