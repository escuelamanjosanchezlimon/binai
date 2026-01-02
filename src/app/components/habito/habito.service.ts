import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HabitoData, HabitoPayload } from '../../shared/interfaces/habito.interface';

const API_URL = environment.apiUrl;


@Injectable({ providedIn: 'root' })
export class HabitoService {
    private readonly http = inject(HttpClient);

    // 1. Creamos el Subject que guardará la lista de tareas
    private habitoSubject = new BehaviorSubject<HabitoData[]>([]);

    finanza$ = this.habitoSubject.asObservable();

    getHabitos(): Observable<HabitoData[]> {
        const params = new HttpParams()
            .set('select', 'id,categoria,descripcion,tipo,estado');

        return this.http
            .get<HabitoData[]>(`${API_URL}/rest/v1/habitos`, { params })
            .pipe(
                tap(data => this.habitoSubject.next(data))
            );
    }


    crearHabito(payload: HabitoPayload) {
        return this.http
            .post<HabitoData[]>(
                `${API_URL}/rest/v1/habitos`,
                payload,
                { headers: { Prefer: 'return=representation' } }
            )
            .pipe(
                tap(res => {
                    const habitoCreado = res[0]; // 👈 CLAVE
                    const actual = this.habitoSubject.value;
                    this.habitoSubject.next([habitoCreado, ...actual]);
                })
            );
    }

    actualizarHabito(id: number, payload: HabitoPayload) {
        return this.http
            .patch<HabitoData[]>(
                `${API_URL}/rest/v1/habitos`,
                payload,
                {
                    params: new HttpParams().set('id', `eq.${id}`),
                    headers: { Prefer: 'return=representation' }
                }
            )
            .pipe(
                tap(res => {
                    const actualizado = res[0];
                    const actual = this.habitoSubject.value;

                    const nuevaLista = actual.map(h =>
                        h.id === id ? actualizado : h
                    );

                    this.habitoSubject.next(nuevaLista);
                })
            );
    }


    eliminarHabito(id: number): Observable<void> {
        return this.http
            .delete<void>(
                `${API_URL}/rest/v1/habitos`,
                { params: new HttpParams().set('id', `eq.${id}`) }
            )
            .pipe(
                tap(() => {
                    const actual = this.habitoSubject.value;
                    const filtrado = actual.filter(h => h.id !== id);
                    this.habitoSubject.next(filtrado);
                })
            );
    }


    actualizarEstadoMultiple(ids: number[], nuevoEstado: number) {
        return this.http
            .patch<HabitoData[]>(
                `${API_URL}/rest/v1/habitos?id=in.(${ids.join(',')})`,
                { estado: nuevoEstado },
                { headers: { Prefer: 'return=representation' } }
            )
            .pipe(
                tap(actualizados => {
                    const actuales = this.habitoSubject.value.map(h =>
                        ids.includes(h.id)
                            ? { ...h, estado: nuevoEstado }
                            : h
                    );

                    this.habitoSubject.next(actuales);
                })
            );
    }


    actualizarEstadoBatch(
        cambios: { id: number; estado: number }[]
    ) {
        return this.http.post(
            `${API_URL}/rest/v1/rpc/actualizar_estado_habitos`,
            { cambios } 
        ).pipe(
            tap(() => {
                const actuales = this.habitoSubject.value.map(h => {
                    const cambio = cambios.find(c => c.id === h.id);
                    return cambio ? { ...h, estado: cambio.estado } : h;
                });

                this.habitoSubject.next(actuales);
            })
        );
    }


}