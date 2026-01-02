import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TareaLista } from '../../shared/interfaces/tarea.interface';
import { BehaviorSubject, catchError, Observable, tap } from 'rxjs';
import { TareaPayload } from '../../shared/interfaces/post-tarea.interface';

const API_URL = environment.apiUrl;


@Injectable({ providedIn: 'root' })
export class TareaService {
    private readonly http = inject(HttpClient);

    private tareasSubject = new BehaviorSubject<TareaLista[]>([]);

    tareas$ = this.tareasSubject.asObservable();

    cargarTareas(filtro?: {
        estado?: string; tipo?: number; prioridad?:
            number; fechaHoy?: boolean; limite?: number
    }): void {
        let params = new HttpParams().set('select', '*');

        if (filtro?.estado) {
            params = params.set('estado', `eq.${filtro.estado}`);
        }
        if (filtro?.tipo != null) {
            params = params.set('tipo', `eq.${filtro.tipo}`);
        }
        if (filtro?.prioridad != null) {
            params = params.set('prioridad', `eq.${filtro.prioridad}`);
            params = params.set('estado', `eq.PENDIENTE`);
        }

        if (filtro?.fechaHoy) {
            const inicio = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000); // en segundos
            const fin = Math.floor(new Date().setHours(23, 59, 59, 999) / 1000); // en segundos

            params = params.set('expiracion', `gte.${inicio}`);
            params = params.append('expiracion', `lte.${fin}`);

        }
        // Orden por prioridad asc
        params = params.set('order', 'prioridad.asc');

        // Aplicar límite si se pasa
        if (filtro?.limite != null) {
            params = params.set('limit', filtro.limite.toString());
        }

        this.http.get<TareaLista[]>(`${API_URL}/rest/v1/tareas`, { params })
            .subscribe(tareas => this.tareasSubject.next(tareas));
    }



    // 4. Al crear, actualizamos el Subject localmente o recargamos
    crearTarea(nuevaTarea: TareaPayload): Observable<any> {
        return this.http.post<TareaLista>(`${API_URL}/rest/v1/tareas`, nuevaTarea).pipe(
            tap(() => this.cargarTareas()) // Recarga la lista tras el éxito
        );
    }


    eliminarTarea(id: number) {
        const url = `${API_URL}/rest/v1/tareas?id=eq.${id}`;

        return this.http.delete(`${url}`).pipe(
            tap(() => {
                const tareas = this.tareasSubject.value;
                this.tareasSubject.next(
                    tareas.filter(t => t.id !== id)
                );
            })
        );
    }

    actualizarTarea(
        id: number,
        cambios: Partial<TareaPayload>
    ): Observable<void> {

        return this.http.patch<void>(
            `${API_URL}/rest/v1/tareas?id=eq.${id}`,
            cambios
        ).pipe(
            tap(() => {
                const tareas = this.tareasSubject.getValue();

                const actualizadas = tareas.map(t =>
                    t.id === id ? { ...t, ...cambios } : t
                );

                this.tareasSubject.next(actualizadas);
            })
        );
    }

    actualizarEstadoTarea(id: number, estado: string): Observable<void> {
        this.updateEstadoLocal(id, estado, true);

        return this.http.patch<void>(
            `${API_URL}/rest/v1/tareas?id=eq.${id}`,
            { estado }
        ).pipe(
            tap(() => {
                this.updateEstadoLocal(id, estado, false);
            }),
            catchError(err => {
                this.rollbackEstado(id);
                throw err;
            })
        );
    }

    private updateEstadoLocal(id: number, estado: string, loading: boolean) {
        const tareas = this.tareasSubject.value.map(t =>
            t.id === id
                ? { ...t, estado, _loading: loading }
                : t
        );
        this.tareasSubject.next(tareas);
    }

    private rollbackEstado(id: number) {
        const tareas = this.tareasSubject.value.map(t =>
            t.id === id
                ? { ...t, _loading: false }
                : t
        );
        this.tareasSubject.next(tareas);
    }
}