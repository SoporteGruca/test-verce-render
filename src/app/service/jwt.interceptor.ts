// jwt.interceptor.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
HttpRequest,
HttpHandler,
HttpEvent,
HttpInterceptor,
HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Auth } from './auth';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
constructor(
    private auth: Auth,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
) {}

intercept(
    request: HttpRequest<any>,
    next: HttpHandler
): Observable<HttpEvent<any>> {
    if (isPlatformBrowser(this.platformId)) {
        const token = this.auth.getToken();
        const isAuthRequest = request.url.includes('/login') || request.url.includes('/auth');

        if (token && !isAuthRequest) {
        request = request.clone({
            setHeaders: {
            Authorization: `Bearer ${token}`
            }
        });
    }
    }

    return next.handle(request).pipe(
    catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
        this.auth.logout();
        this.router.navigate(['/login'], {
            queryParams: { sessionExpired: true }
        });
        }
        return throwError(() => error);
    })
    );
}
}