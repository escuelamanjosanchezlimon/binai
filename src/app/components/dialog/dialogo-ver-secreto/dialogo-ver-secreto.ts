import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DialogoRecordatorio } from '../dialogo-recordatorio/dialogo-recordatorio';
import { SecretoData } from '../../../shared/interfaces/secreto.interface';
import { clavesIgualesValidator } from '../../../shared/validators/password-validator';
import { decryptData, deriveKey } from '../../../shared/utils/password.util';

import { MatStepperModule } from '@angular/material/stepper';
import { SecretoService } from '../../secreto/secreto.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mostrarSnack } from '../../../shared/utils/mostrar-snack.util';

export interface DialogoSecretoData {
  secreto: SecretoData;
  modo: 'mostrar' | 'agregar';
}



@Component({
  selector: 'app-dialogo-ver-secreto',
  imports: [
    MatStepperModule,
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
    MatChipsModule,
    MatIcon
  ],
  templateUrl: './dialogo-ver-secreto.html',
  styleUrl: './dialogo-ver-secreto.scss',
})
export class DialogoVerSecreto {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<DialogoRecordatorio>);
  data: DialogoSecretoData | null;
  hide = true;
  firstFormGroup = this.fb.group({
    firstCtrl: ['', Validators.required]
  });

  secondFormGroup = this.fb.group({
    secondCtrl: ['', Validators.required]
  });


  enviar: boolean = false;
  secreto!: SecretoData;
  contenidoDescifrado: string = '';
  private snack = inject(MatSnackBar);




  constructor() {
    this.data = inject(MAT_DIALOG_DATA) as DialogoSecretoData | null;
  }


  form = this.fb.group(
    {
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      clave: ['', [Validators.required, Validators.maxLength(300)]],
    },
    { validators: clavesIgualesValidator }
  );


  formContenido = new FormGroup({
    contenido: new FormControl('')
  });


  ngOnInit() {
    if (this.data && this.data.secreto) {
      const secreto = this.data.secreto;
      this.form.patchValue({
        descripcion: secreto.descripcion
      });

    }
  }

  cdRef = inject(ChangeDetectorRef);

  async mostrarContenido(data: DialogoSecretoData, clave: string) {
    try {
      const secreto = data.secreto;
      const key = await deriveKey(clave, secreto.salt);
      const plaintext = await decryptData(secreto.contenido, key);

      this.formContenido.get('contenido')?.setValue(plaintext);
      this.contenidoDescifrado = plaintext;
      this.enviar = true;
      this.cdRef.detectChanges();

    } catch (error) {
      mostrarSnack(
        this.snack,
        '¡Clave incorrecta!',
        'Cerrar',
        2500
      );
              alert(error)

      console.error('Error al descifrar:', error);
    }
  }

  async mostrarClave() {
    if (this.data && this.data.secreto) {
      const formData = this.form.value;
      this.mostrarContenido(this.data, String(formData.clave));
    }
  }



  copiarContenido() {
    if (!this.contenidoDescifrado) return;

    navigator.clipboard.writeText(this.contenidoDescifrado)
      .then(() => {
        mostrarSnack(
          this.snack,
          'Contenido copiado en portapapeles',
          'Cerrar',
          2500
        );
        this.dialogRef.close(); // Cierra el diálogo

      })
      .catch(err => console.error('Error copiando al portapapeles:', err));
  }

}