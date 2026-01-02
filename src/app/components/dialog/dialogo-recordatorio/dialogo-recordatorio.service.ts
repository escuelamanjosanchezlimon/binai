import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { CreateRecordatorio, UpdateRecordatorio } from '../../../shared/interfaces/post-rocordatorio.interface';


const API_URL = environment.apiUrl;


@Injectable({
    providedIn: 'root',
})
export class DialogoRecordatorioService {
    private readonly http = inject(HttpClient);

    constructor() { }

    crearRecordatorio(recordatorio: CreateRecordatorio): Observable<CreateRecordatorio> {
        return this.http.post<CreateRecordatorio>(`${API_URL}/rest/v1/recordatorios`, recordatorio);
    }

    actualizarRecordatorio(id: number | string, recordatorio: Partial<UpdateRecordatorio>): Observable<void> {
        return this.http.patch<void>(
            `${API_URL}/rest/v1/recordatorios?id=eq.${id}`,
            recordatorio);
    }

    eliminarRecordatorio(id: number | string): Observable<void> {
        const url = `${API_URL}/rest/v1/recordatorios?id=eq.${id}`;
        return this.http.delete<void>(url);
    }
}
