import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatLabel, MatSuffix } from "@angular/material/select";
import { MatCardModule } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { clavesIgualesValidator } from '../../shared/validators/password-validator';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mostrarSnack } from '../../shared/utils/mostrar-snack.util';


@Component({
  selector: 'app-update-password',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormField, MatLabel, MatInput, MatAnchor, MatError, MatIcon, MatIconButton, MatSuffix],
  templateUrl: './update-password.html',
  styleUrl: './update-password.scss',
})
export class UpdatePassword {
  hide = true;
  hide2 = true;
  hide3 = true;
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  loading = signal(false);
  form = this.fb.group({
    clave: ['', Validators.required],
    confirmarClave: ['', [Validators.required, Validators.maxLength(300)]],
  },
    {
      validators: clavesIgualesValidator
    });



  actualizar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { clave } = this.form.value;
    console.log('Nueva contraseña:', clave); // debug

    this.auth.changePassword(String(clave)).subscribe({
      next: (res) => {
        this.loading.set(false);

        if (res) {
          this.form.reset();
          this.hide = true;  // opcional: ocultar passwords si los tienes show/hide
          this.hide2 = true;
          this.hide3 = true; mostrarSnack(this.snack, 'Contraseña cambiada con éxito', 'OK', 5000);
        } else {
          mostrarSnack(this.snack, 'No se pudo cambiar la contraseña', 'OK', 5000);
        }
      },
      error: (err) => {
        this.loading.set(false);
        mostrarSnack(this.snack, 'Error al cambiar contraseña', 'OK', 5000);
      }
    });
  }

}
