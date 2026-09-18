import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { AuthGuard } from './service/auth.guard';
import { Catalogo } from './pages/catalogo/catalogo';

import { Usuarios } from './pages/usuarios/usuarios';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [AuthGuard]
    },
    {
        path: 'catalogo',
        component: Catalogo,
        canActivate: [AuthGuard]
    },
    {
        path: 'usuarios',
        component: Usuarios,
        canActivate: [AuthGuard]
    },
    { path: '**', redirectTo: '/login' }
];
