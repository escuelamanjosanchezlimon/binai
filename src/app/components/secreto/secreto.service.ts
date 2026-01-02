import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, tap } from 'rxjs';
import { SecretoData, SecretoPayload } from '../../shared/interfaces/secreto.interface';

const API_URL = environment.apiUrl;


@Injectable({ providedIn: 'root' })
export class SecretoService {
    private readonly http = inject(HttpClient);

    // 1. Creamos el Subject que guardará la lista de tareas
    private secretoSubject = new BehaviorSubject<SecretoData[]>([]);

    secreto$ = this.secretoSubject.asObservable();

    getSecretos(): Observable<SecretoData[]> {
        const params = new HttpParams().set(
            'select',
            'id,descripcion,contenido,salt'
        );

        return this.http.get<SecretoData[]>(
            `${API_URL}/rest/v1/secretos`,
            { params }
        ).pipe(
            tap(data => this.secretoSubject.next(data))
        );
    }

    crearSecreto(nuevoSecreto: SecretoPayload): Observable<SecretoData> {
        return this.http
            .post<SecretoData[]>(
                `${API_URL}/rest/v1/secretos`,
                nuevoSecreto,
                { headers: { Prefer: 'return=representation' } }
            )
            .pipe(
                tap(([secretoCreado]) => {
                    if (!secretoCreado) return;

                    this.secretoSubject.next([
                        secretoCreado,
                        ...this.secretoSubject.value,
                    ]);
                }),
                // opcional: devolver solo el objeto creado
                map(([secreto]) => secreto)
            );
    }


    getSecretoById(id: number): Observable<SecretoData> {
        const params = new HttpParams().set(
            'select',
            'descripcion,contenido,salt'
        );

        return this.http.get<SecretoData>(
            `${API_URL}/rest/v1/secretos?id=eq.${id}`, // Filtrando por id
            { params }
        ).pipe(
            tap(data => {
                this.secretoSubject.next([data]);
            })
        );
    }


    modificarSecreto(id: number, cambios: Partial<SecretoPayload>): Observable<SecretoData> {
        return this.http.patch<SecretoData[]>(
            `${API_URL}/rest/v1/secretos?id=eq.${id}`, // Filtra el secreto por id
            cambios,
            { headers: { Prefer: 'return=representation' } } // Para que devuelva el registro modificado
        ).pipe(
            tap(([secretoActualizado]) => {
                if (!secretoActualizado) return;

                // Actualizar el BehaviorSubject
                const secretos = this.secretoSubject.value.map(s =>
                    s.id === id ? secretoActualizado : s
                );
                this.secretoSubject.next(secretos);
            }),
            map(([secreto]) => secreto) // Devolver solo el objeto actualizado
        );
    }


    eliminarSecreto(id: number): Observable<void> {
        return this.http.delete<void>(
            `${API_URL}/rest/v1/secretos?id=eq.${id}`
        ).pipe(
            tap(() => {
                // Actualiza el BehaviorSubject quitando el secreto eliminado
                const secretosActuales = this.secretoSubject.value.filter(s => s.id !== id);
                this.secretoSubject.next(secretosActuales);
            }),
            catchError(err => {
                console.error('Error eliminando el secreto', err);
                throw err; // o manejar el error como quieras
            })
        );
    }
}