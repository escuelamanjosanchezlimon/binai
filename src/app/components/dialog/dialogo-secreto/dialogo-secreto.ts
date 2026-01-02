import { Component, inject } from '@angular/core';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DialogoRecordatorio } from '../dialogo-recordatorio/dialogo-recordatorio';
import { SecretoData, SecretoPayload } from '../../../shared/interfaces/secreto.interface';
import { clavesIgualesValidator } from '../../../shared/validators/password-validator';
import { deriveKey, encryptData, randomSaltHex } from '../../../shared/utils/password.util';


export interface DialogoSecretoData {
  secreto: SecretoData;
  modo: 'actualizar' | 'agregar';
}



@Component({
  selector: 'app-dialogo-secreto',
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
    MatChipsModule,
    MatIcon
  ],
  templateUrl: './dialogo-secreto.html',
  styleUrl: './dialogo-secreto.scss',
})
export class DialogoSecreto {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<DialogoRecordatorio>);
  data: DialogoSecretoData | null;
  hide = true;



  constructor() {
    this.data = inject(MAT_DIALOG_DATA) as DialogoSecretoData | null;
  }


  form = this.fb.group(
    {
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      contenido: ['', [Validators.required, Validators.maxLength(300)]],
      clave: ['', [Validators.required, Validators.maxLength(300)]],
      confirmarClave: ['', [Validators.required, Validators.maxLength(300)]],
    },
    { validators: clavesIgualesValidator }
  );


  ngOnInit() {
    if (this.data && this.data.secreto) {
      const secreto = this.data.secreto;
      this.form.patchValue({
        descripcion: secreto.descripcion
      });
    }
  }


  async guardar() {
    const data = this.form.value;

    const salt = randomSaltHex();
    const key = await deriveKey(String(data.clave), salt);

    const contenidoCifrado: string = await encryptData(
      String(data.contenido),
      key
    );

    const secreto: SecretoPayload = {
      salt: salt,
      contenido: contenidoCifrado,
      descripcion: String(data.descripcion)
    };

    this.dialogRef.close(secreto);
  }

}