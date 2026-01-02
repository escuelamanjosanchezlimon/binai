import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from './core/services/auth.service';
import { ConfirmDialog } from './components/dialog/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mostrarSnack } from './shared/utils/mostrar-snack.util';
import { MatMenuModule } from '@angular/material/menu';



@Component({
  selector: 'app-root',

  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule, RouterLink, MatMenuModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  public readonly auth = inject(AuthService);
  showFiller = false;
  private readonly dialog = inject(MatDialog);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  navegacionInferior = false;




  logout(drawer: any) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        titulo: 'Cerrar sesión',
        mensaje: 'Debe iniciar sesión para acceder otra vez.'
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (!confirmado) return;

      this.auth.logout()?.subscribe({
        next: () => {
          // redirigir al login
          this.router.navigate(['/login']);

          mostrarSnack(this.snack, '¡Se ha cerrado la sesión!', 'OK', 5000);
          drawer.close();
        },
        error: () => {
          // aunque falle el backend, cerrar sesión local
          this.router.navigate(['/login']);
          mostrarSnack(this.snack, '¡Ha ocurrido un error!', 'OK', 5000);
        }
      });
    });
  }


  resetear() {
    this.auth.borrarEmail();
    mostrarSnack(this.snack, '¡Se ha reseteado el usuario!', 'OK', 5000);
  }

  mostrarNavegacionInferior() {
    localStorage.setItem('navegacion_inferior', 'YES');
    this.navegacionInferior = true;
  }


  ocultarNavegacionInferior() {
    localStorage.removeItem('navegacion_inferior');
    this.navegacionInferior = false;
  }

  isNavegacionInferiorActiva(): boolean {
    const valor = localStorage.getItem('navegacion_inferior');
    return valor === 'YES'; // true si es YES, false si es null o distinto
  }
}



