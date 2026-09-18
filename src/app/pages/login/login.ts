import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
//import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, FormBuilder } from '@angular/forms';
//import { Toasts } from '../../service/toasts';
//import { Auth } from '../../service/auth';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        // MatSnackBarModule
    ],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})

export class Login implements OnInit {
    username: string = '';
    password: string = '';
    showPassword = false;

    isLoading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    lastResponse: any = null;
    loading = false;
    error = '';
    returnUrl: string = '/dashboard';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        //private auth: Auth,
        //private toasts: Toasts,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngAfterViewInit(): void {
    // Solo ejecutar en el navegador
    if (!isPlatformBrowser(this.platformId)) {
        return;
    }
    
    // if (this.auth.hasValidToken()) {
    //     this.cdr.detectChanges();
    //     this.router.navigate(['/dashboard']);
    // }
}

    ngOnInit(): void {
    console.log('🔍 Login component iniciado');
    
    // Solo ejecutar en el navegador
    if (!isPlatformBrowser(this.platformId)) {
        console.log('🔍 SSR: Login component renderizado en servidor');
        return;
    }
    
    // Verificar si hay token válido
    // const hasValidToken = this.auth.hasValidToken();
    // console.log('🔍 Token válido en ngOnInit:', hasValidToken);
    
    // if (hasValidToken) {
    //     console.log('✅ Token válido, redirigiendo a dashboard');
    //     this.router.navigate(['/dashboard']);
    // } else {
    //     console.log('❌ No hay token válido, mostrando login');
    //     // Limpiar cualquier token corrupto
    //     this.auth.removeToken();
    //     this.auth.removeUser();
    // }
}

    onSubmit(): void {
    console.log('🔍 Enviando formulario de login');
    this.isLoading = true;
    this.clearMessages();

        // this.auth.login(this.username, this.password).subscribe({
        //     next: (response) => {
        //         console.log('✅ Login response:', response);
        //         this.isLoading = false;
        //         if (response?.success) {
        //             console.log('✅ Login exitoso, redirigiendo...');
        //             this.handleSuccess(response);
        //         } else {
        //             console.log('❌ Login falló:', response?.message);
        //             this.handleError(response);
        //         }
        //     },
        //     error: (error) => {
        //         console.error('❌ Login error:', error);
        //         this.isLoading = false;
        //         this.handleError(error);
        //     }
        // });
    }

    private handleSuccess(response: any): void {
        const message = response.message || '¡Login exitoso!';
        this.successMessage = message;
        // this.toasts.showSuccess(message);

        // Redirigir después de 1 segundo
        setTimeout(() => {
            console.log('🔍 Redirigiendo a:', this.returnUrl);
            this.router.navigate([this.returnUrl]).then(success => {
                console.log('✅ Navegación exitosa:', success);
            }).catch(error => {
                console.error('❌ Error en navegación:', error);
            });
        }, 1000);
    }

    private handleError(response: any): void {
        const message = response?.message || 'Credenciales incorrectas';
        this.errorMessage = message;
        // this.toasts.showError(message);
    }

    private clearMessages(): void {
        this.errorMessage = '';
        this.successMessage = '';
    }

    togglePasswordVisibility(event: Event): void {
        const checkbox = event.target as HTMLInputElement;
        this.showPassword = checkbox.checked;

        const passwordInput = document.getElementById('password') as HTMLInputElement;
        if (passwordInput) {
            passwordInput.type = this.showPassword ? 'text' : 'password';
        }
    }

    clearError(): void {
        this.errorMessage = '';
    }

}