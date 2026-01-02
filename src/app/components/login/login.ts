import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatSuffix } from "@angular/material/select";
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatInput } from "@angular/material/input";
import { MatAnchor, MatIconButton } from "@angular/material/button";
import { mostrarSnack } from '../../shared/utils/mostrar-snack.util';
import { MatIcon } from "@angular/material/icon";
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormField, MatLabel, MatInput, MatAnchor, MatError, MatIcon, MatIconButton, MatSuffix],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  hide = true;


  loading = signal(false);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  ngOnInit() {

    this.form.patchValue({
      email: this.auth.obtenerEmail()
    });

  }


  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { email, password } = this.form.value;

    this.auth.login(email!, password!)
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/tareas']);

          mostrarSnack(this.snack, '¡Login exitoso!', 'OK', 3000);
        },
        error: (err) => {
          console.error(err);
          mostrarSnack(
            this.snack,
            'Credenciales incorrectas',
            'Cerrar',
            4000
          );
        }
      });
  }

  establecerUsuario() {
    const email = this.form.get('email')?.value;

    if (!email) {
      mostrarSnack(this.snack, 'El email está vacío', 'OK', 3000);
      return;
    }

    if (!this.form.get('email')?.valid) {
      mostrarSnack(this.snack, 'Email no válido', 'OK', 3000);
      return;
    }

    this.auth.guardarEmail(email);
    mostrarSnack(this.snack, '¡Se ha guardado el usuario!', 'OK', 5000);
  }

}