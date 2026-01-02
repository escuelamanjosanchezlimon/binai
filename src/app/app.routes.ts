import { Routes } from '@angular/router';

import { Recordatorio } from './components/recordatorio/recordatorio';
import { Tarea } from './components/tarea/tarea';
import { Secreto } from './components/secreto/secreto';
import { Finanza } from './components/finanza/finanza';
import { Habito } from './components/habito/habito';
import { Login } from './components/login/login';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { UpdatePassword } from './components/update-password/update-password';
import { Informe } from './components/informe/informe';

export const routes: Routes = [

  { path: 'recordatorios', component: Recordatorio, canActivate: [authGuard] },
  { path: 'tareas', component: Tarea, canActivate: [authGuard] },
  {
    path: 'secretos', component: Secreto, canActivate: [authGuard],
  },
  { path: 'finanzas', component: Finanza, canActivate: [authGuard] },
  { path: 'actualizar', component: UpdatePassword, canActivate: [authGuard] },

  { path: 'habitos', component: Habito, canActivate: [authGuard] },
    { path: 'informe', component: Informe, canActivate: [authGuard] },

  { path: 'login', component: Login, canActivate: [guestGuard] },

  { path: '', redirectTo: 'recordatorios', pathMatch: 'full' }
];
