import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { FinanzaData, FinanzaPayload } from '../../shared/interfaces/finanza.interface';

const API_URL = environment.apiUrl;


@Injectable({ providedIn: 'root' })
export class FinanzaService {
    private readonly http = inject(HttpClient);

    // 1. Creamos el Subject que guardará la lista de tareas
    private finanzaSubject = new BehaviorSubject<FinanzaData[]>([]);

    finanza$ = this.finanzaSubject.asObservable();

    getFinanzas(): Observable<FinanzaData[]> {
        const params = new HttpParams()
            .set('order', 'created_at.desc')
            .set('limit', '20');

        return this.http
            .get<FinanzaData[]>(
                `${API_URL}/rest/v1/finanzas`,
                { params }
            )
            .pipe(
                tap(data => this.finanzaSubject.next(data))
            );
    }



    getFinanzasTipo(tipo: number): Observable<FinanzaData[]> {
        const params = new HttpParams()
            .set('order', 'created_at.desc')
            .set('tipo', `eq.${tipo}`); // <--- aquí va eq.

        return this.http
            .get<FinanzaData[]>(
                `${API_URL}/rest/v1/finanzas`,
                { params }
            )
            .pipe(
                tap(data => this.finanzaSubject.next(data))
            );
    }


    crearFinanza(nuevaFinanza: Omit<FinanzaPayload, 'id' | 'created_at'>): Observable<FinanzaData> {
        return this.http
            .post<FinanzaData[]>(
                `${API_URL}/rest/v1/finanzas`,
                nuevaFinanza,
                {
                    headers: { Prefer: 'return=representation' }
                }
            )
            .pipe(
                tap(([finanzaCreada]) => {
                    if (!finanzaCreada) return;

                    this.finanzaSubject.next([
                        finanzaCreada,
                        ...this.finanzaSubject.value,
                    ]);
                }),
                map(([finanza]) => finanza)
            );
    }


    actualizarFinanza(
        id: number,
        cambios: Partial<Omit<FinanzaPayload, 'id' | 'created_at'>>
    ): Observable<FinanzaData> {
        return this.http
            .patch<FinanzaData[]>(
                `${API_URL}/rest/v1/finanzas?id=eq.${id}`,
                cambios,
                {
                    headers: { Prefer: 'return=representation' }
                }
            )
            .pipe(
                tap(([finanzaActualizada]) => {
                    if (!finanzaActualizada) return;

                    const lista = this.finanzaSubject.value.map(f =>
                        f.id === finanzaActualizada.id ? finanzaActualizada : f
                    );

                    this.finanzaSubject.next(lista);
                }),
                map(([finanza]) => finanza)
            );
    }


    eliminarFinanza(id: number): Observable<void> {
        return this.http
            .delete<void>(
                `${API_URL}/rest/v1/finanzas?id=eq.${id}`
            )
            .pipe(
                tap(() => {
                    // Actualizamos el estado local
                    const filtradas = this.finanzaSubject.value.filter(
                        f => f.id !== id
                    );
                    this.finanzaSubject.next(filtradas);
                })
            );
    }


    getFinanzasMesActual(): Observable<FinanzaData[]> {
        const ahora = new Date();
        // Primer día del mes
        const inicioMes = new Date(
            ahora.getFullYear(),
            ahora.getMonth(),
            1
        ).toISOString();

        // Primer día del siguiente mes
        const inicioMesSiguiente = new Date(
            ahora.getFullYear(),
            ahora.getMonth() + 1,
            1
        ).toISOString();

        const params = new HttpParams()
            .set('created_at', `gte.${inicioMes}`)
            .append('created_at', `lt.${inicioMesSiguiente}`)
            .set('order', 'created_at.desc');

        return this.http
            .get<FinanzaData[]>(
                `${API_URL}/rest/v1/finanzas`,
                { params }
            )
            .pipe(
                tap(data => this.finanzaSubject.next(data))
            );
    }

    getTotalIngresos(): Observable<number> {
        return this.http
            .post<number>(
                `${API_URL}/rest/v1/rpc/total_ingresos`,
                {}
            );
    }




}