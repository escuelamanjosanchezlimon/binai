import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment.development';

const API_URL = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {

    private readonly http = inject(HttpClient);

    private _isAuthenticated = signal<boolean>(this.hasToken());

    isAuthenticated = this._isAuthenticated.asReadonly();

    login(email: string, password: string) {
        const url = `${API_URL}/auth/v1/token?grant_type=password`;

        return this.http.post<any>(url, { email, password }).pipe(
            tap(res => {
                localStorage.setItem('access_token', res.access_token);
                localStorage.setItem('user', JSON.stringify(res.user));
                this._isAuthenticated.set(true); 
            })
        );
    }

    logout() {
        const token = localStorage.getItem('access_token');

        const url = `${API_URL}/auth/v1/logout`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        return this.http.post(url, {}, { headers }).pipe(
            tap(() => this.clearSession()),
            catchError(err => {
                console.error('Logout error:', err);
                this.clearSession()
                return of(null);
            })
        );
    }


    changePassword(newPassword: string) {

        const url = `${API_URL}/auth/v1/user`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this.http.put<any>(url, { password: newPassword }, { headers }).pipe(
            tap(res => {
                console.log('Contraseña actualizada correctamente', res);
            }),
            catchError(err => {
                console.error('Error al cambiar la contraseña:', err);
                return of(null);
            })
        );
    }



    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    guardarEmail(email: string): void {
        if (!email) return;
        localStorage.setItem('email', email);
    }
    obtenerEmail(): string | null {
        return localStorage.getItem('email');
    }

    borrarEmail(): void {
        localStorage.removeItem('email');
    }


    private hasToken(): boolean {
        return !!localStorage.getItem('access_token');
    }

     clearSession() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        this._isAuthenticated.set(false); 
    }
}
