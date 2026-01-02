import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

const API_URL = environment.apiUrl;

export interface IngresosEgresosMes {
  mes: string;
  total_ingresos: number;
  total_egresos: number;
}

@Injectable({ providedIn: 'root' })
export class InformeService {
  private http = inject(HttpClient);

  obtenerIngresosEgresosUltimos3Meses(): Observable<IngresosEgresosMes[]> {
    return this.http.post<IngresosEgresosMes[]>(
      `${API_URL}/rest/v1/rpc/ingresos_egresos_ultimos_3_meses`,
      {}
    );
  }
}
