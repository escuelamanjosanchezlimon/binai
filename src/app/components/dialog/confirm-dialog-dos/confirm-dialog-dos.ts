import {  Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

export interface ConfirmDialogData {
  titulo: string;
  mensaje?: string;
}

@Component({
  selector: 'app-confirm-dialog-dos',
  imports: [MatButtonModule, MatDialogActions, MatDialogTitle, MatDialogContent],
  templateUrl: './confirm-dialog-dos.html',
    styleUrl: './confirm-dialog-dos.scss',

})
export class ConfirmDialogDos {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogDos>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) { }

  cancelar() {
    this.dialogRef.close(false);
  }

  confirmar() {
    this.dialogRef.close(true);
  }
}
