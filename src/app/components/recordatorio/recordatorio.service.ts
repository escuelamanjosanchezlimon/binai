import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Recordatorio } from '../../shared/interfaces/recordatorio.interface';
import { Observable } from 'rxjs';
import { obtenerHoyYMas15Dias, obtenerHoyYMas30Dias, obtenerInicioYFinSemanaLocal } from '../../shared/utils/fecha.util';


const API_URL = environment.apiUrl;


@Injectable({
  providedIn: 'root',
})
export class RecordatorioService {
  private readonly http = inject(HttpClient);


  constructor() { }


  getRecordatoriosArchivados(): Observable<Recordatorio[]> {
    const params = new HttpParams()
      .set('select', '*')
      .set('estado', 'eq.ARCHIVADO');

    return this.http.get<Recordatorio[]>(
      `${API_URL}/rest/v1/recordatorios`,
      { params }
    );
  }


  getRecordatorios(): Observable<Recordatorio[]> {
    let params = new HttpParams()
      .set('select', '*')
      .append('estado', 'neq.ARCHIVADO')
      .set('order', 'fecha_limite.asc'); // opcional: ordena por fecha límite
    return this.http.get<Recordatorio[]>(`${API_URL}/rest/v1/recordatorios`, {
      params
    });
  }


  getRecordatoriosSemana(): Observable<Recordatorio[]> {
    const { inicio, fin } = obtenerInicioYFinSemanaLocal();

    const params = new HttpParams()
      .set('select', '*')
      .set('fecha_limite', `gte.${inicio.toISOString()}`)
      .append('fecha_limite', `lt.${fin.toISOString()}`)
      .append('estado', 'neq.ARCHIVADO')

      .set('order', 'fecha_limite.desc');

    return this.http.get<any[]>(`${API_URL}/rest/v1/recordatorios`, {
      params
    });
  }


  getRecordatoriosProximos15Dias(): Observable<Recordatorio[]> {
    const { inicio, fin } = obtenerHoyYMas15Dias();

    const params = new HttpParams()
      .set('select', '*')
      .set('fecha_limite', `gte.${inicio.toISOString()}`)
      .append('fecha_limite', `lt.${fin.toISOString()}`)
      .append('estado', 'neq.ARCHIVADO')

      .set('order', 'fecha_limite.asc');

    return this.http.get<Recordatorio[]>(
      `${API_URL}/rest/v1/recordatorios`,
      { params }
    );
  }


  getRecordatoriosProximos30Dias(): Observable<Recordatorio[]> {
    const { inicio, fin } = obtenerHoyYMas30Dias();

    const params = new HttpParams()
      .set('select', '*')
      .set('fecha_limite', `gte.${inicio.toISOString()}`)
      .append('fecha_limite', `lt.${fin.toISOString()}`)
      .append('estado', 'neq.ARCHIVADO')
      .set('order', 'fecha_limite.desc'); // 🔥 más próximo primero

    return this.http.get<Recordatorio[]>(
      `${API_URL}/rest/v1/recordatorios`,
      { params }
    );
  }


  getRecordatoriosPorTipo(tipo: string): Observable<Recordatorio[]> {
    const params = new HttpParams()
      .set('select', '*')
      .set('tipo', `eq.${tipo}`)
      .set('order', 'fecha_limite.asc');
    return this.http
      .get<Recordatorio[]>(`${API_URL}/rest/v1/recordatorios`, { params })
  }

}
