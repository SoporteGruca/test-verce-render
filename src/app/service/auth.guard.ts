import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
CanActivate,
Router,
ActivatedRouteSnapshot,
RouterStateSnapshot,
UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { Auth } from './auth';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
providedIn: 'root'
})

export class AuthGuard implements CanActivate {
constructor(
    private auth: Auth,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
) {}

canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): Observable<boolean | UrlTree> | boolean | UrlTree {

    if (!isPlatformBrowser(this.platformId)) {
    return true;
    }

    const isAuthenticated = this.auth.hasValidToken();
    // console.log('Usuario autenticado?', isAuthenticated);

    if (isAuthenticated) {
    // console.log('Acceso permitido a', state.url);
    return true;
    }

    console.log('Acceso denegado, redirigiendo a login');
    
    // Guardar la URL a la que intentaba acceder
    const returnUrl = state.url;
    console.log('Return URL guardada:', returnUrl);
    
    // Redirigir al login
    return this.router.createUrlTree(['/login'], {
    queryParams: { returnUrl: returnUrl }
    });
}
}