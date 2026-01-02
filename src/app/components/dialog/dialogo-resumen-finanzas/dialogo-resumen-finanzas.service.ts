// src/app/services/finanzas-rest.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface TotalesMes {
    total_ingreso: number;
    total_gasto: number;
    total_deuda: number;
    total_prestamo: number;
    suma_total_deudas: number;
    suma_total_prestamos: number;
}
const API_URL = environment.apiUrl;


@Injectable({
    providedIn: 'root'
})
export class DialogoResumenFinanzasService {
    private readonly http = inject(HttpClient);


    getTotalesMesActual(): Observable<TotalesMes[]> {
        return this.http.post<TotalesMes[]>(`${API_URL}/rest/v1/rpc/totales_mes_actual`,
            {});
    }
}
