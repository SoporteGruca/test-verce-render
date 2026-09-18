import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap} from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from "../../environments/enviroment";

// Interfaces para tipado seguro
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
}

export interface LoginError {
  success: boolean;
  message: string;
  error?: string;
}

export interface User {
  nombre: string;
  usuario: string;
  nivel: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})

export class Auth {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userKey = 'user_data';

  
  // Estado de autenticación
  private authStatusSubject = new BehaviorSubject<boolean>(this.checkInitialAuth());
  authStatus$ = this.authStatusSubject.asObservable();

  //Estado del nivel
  private userLevelSubject = new BehaviorSubject<string>(this.getUserLevel());
  userLevel$ = this.userLevelSubject.asObservable();

  // Propiedad para verificar si estamos en el navegador
  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Usar JwtHelperService de manera segura para SSR
  private get jwtHelper(): JwtHelperService {
    if (this.isBrowser) {
      return new JwtHelperService();
    }

    // Retornar un objeto mock para SSR
    return {
      decodeToken: () => null,
      getTokenExpirationDate: () => null,
      isTokenExpired: () => false
    } as any;
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private router: Router
  ) {
    
    // Inicializar solo en el cliente
    if (this.isBrowser) {
      this.initializeAuthState();
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    console.log('🔍 Intentando login:', { username });
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
        usuario: username,
        password: password
    }).pipe(
        tap(response => {
            console.log('🔍 Respuesta del servidor:', response);
            if (response.success && response.token) {
                console.log('✅ Token recibido:', response.token);
                this.setToken(response.token);
                console.log('✅ Token guardado en localStorage');
                if (response.user) {
                    this.setUser(response.user);
                    console.log('✅ Usuario guardado:', response.user);
                }
                this.authStatusSubject.next(true);
                const nivel = this.getUserLevel();
                this.userLevelSubject.next(nivel);
                console.log('✅ Usuario autenticado con nivel:', nivel);
            } else {
                console.log('❌ Login falló:', response.message);
            }
        })
    );
  }

  private checkInitialAuth(): boolean {
    if (!this.isBrowser) return false;
    const token = this.getToken();
    if (!token) return false;
    
    // Usar el mismo método de validación
    return this.hasValidToken();
  }

  // Método para inicializar el estado de autenticación
  private initializeAuthState(): void {
    const hasToken = this.hasValidToken();
    // const user = this.getUser();
  }

  logout(): void {
    if (this.isBrowser) {
      this.removeToken();
      this.removeUser();

      this.authStatusSubject.next(false)
      this.userLevelSubject.next('')

      this.router.navigate(['/login']);
    }
    
  }

  getCurrentUserLevel(): string {
    return this.userLevelSubject.value;
  }

   // Método para obtener nombre de usuario
  getCurrentUserName(): string {
    const user = this.getUser();
    return user?.nombre || user?.name || user?.username || 'Usuario';
  }

  // Agrega este método para obtener el estado actual
  isAuthenticated(): boolean {
    return this.authStatusSubject.value;
  }

  setToken(token: string): void {
    if (!this.isBrowser) {
        console.log('🔍 SSR: setToken ignorado');
        return;
    }
    localStorage.setItem(this.tokenKey, token);
}

  getToken(): string | null {
    if (!this.isBrowser) {
        console.log('🔍 SSR: getToken retorna null');
        return null;
    }
    return localStorage.getItem(this.tokenKey);
}
  
  removeToken(): void {
    if (!this.isBrowser) {
        console.log('🔍 SSR: removeToken ignorado');
        return;
    }
    localStorage.removeItem(this.tokenKey);
}

  removeUser(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.userKey);
    }
  }

  setUser(user: any): void {
    if (!this.isBrowser) {
        console.log('🔍 SSR: setUser ignorado');
        return;
    }
    localStorage.setItem(this.userKey, JSON.stringify(user));
}

  getUser(): any {
    if (!this.isBrowser) {
        console.log('🔍 SSR: getUser retorna null');
        return null;
    }
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
}


  private isTokenValid(token: string | null): boolean {
    if (!token) return false;
    
    try {

      const tokenData = this.decodeToken(token);
      if (!tokenData) return false;

      const now = Date.now() / 1000;
      return tokenData.exp > now
    } catch {
      return false;
    }
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  hasValidToken(): boolean {
    if (!this.isBrowser) {
        console.log('🔍 SSR: hasValidToken retorna false');
        return false;
    }
    
    const token = this.getToken();
    console.log('🔍 Token en localStorage:', token ? '✅ Existe' : '❌ No existe');
    
    if (!token) return false;
    
    try {
        const tokenData = this.decodeToken(token);
        if (!tokenData) return false;
        
        const now = Date.now() / 1000;
        const isValid = tokenData.exp > now;
        console.log(`🔍 Token ${isValid ? '✅' : '❌'} válido. Expira: ${new Date(tokenData.exp * 1000)}`);
        
        if (!isValid) {
            this.removeToken();
            this.removeUser();
        }
        
        return isValid;
    } catch (error) {
        console.error('❌ Error verificando token:', error);
        this.removeToken();
        this.removeUser();
        return false;
    }
}

  // Obtener datos del token decodificado
  getTokenData(): any {
    const token = this.getToken();
    if (!token || !this.isBrowser) return null;
    
    try {
      return this.jwtHelper.decodeToken(token);
    } catch {
      return null;
    }
  }

  // Verificar roles
  hasRole(role: string): boolean {
    const tokenData = this.getTokenData();
    if (!tokenData || !tokenData.roles) return false;
    
    return Array.isArray(tokenData.roles) 
      ? tokenData.roles.includes(role)
      : tokenData.roles === role;
  }

  // Verificar permisos
  hasPermission(permission: string): boolean {
    const tokenData = this.getTokenData();
    if (!tokenData || !tokenData.permissions) return false;
    
    return Array.isArray(tokenData.permissions)
      ? tokenData.permissions.includes(permission)
      : tokenData.permissions === permission;
  }

  // Actualizar estado de autenticación
  checkAuthentication(): void {
    if (this.isBrowser) {
      const isAuthenticated = this.hasValidToken();
    }
  }

  // Obtener nivel de acceso del usuario
  getUserLevel(): string {
    const user = this.getUser();
    return user?.nivel || 'Visitante';
  }

  // Obtener nivel de acceso del usuario
  getUserName(): string | null {
    try {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

}
