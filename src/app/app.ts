import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Sidebar } from './pages/sidebar/sidebar';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Auth } from './service/auth';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Sidebar,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  isAuthenticated = false;
  sidebarOpen = false;
  isLoginRoute = false;

  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;

  private router = inject(Router);

  constructor(
    private auth: Auth,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.auth.checkAuthentication();

    // 1) Escuchar cambios de autenticación
    this.authSubscription = this.auth.authStatus$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      this.cdr.detectChanges();
    });

    // 2) Escuchar cambios de ruta para saber si estamos en /login
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isLoginRoute = event.urlAfterRedirects.startsWith('/login');
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  // 👇 El sidebar solo se muestra si está autenticado Y NO está en login
  get showSidebar(): boolean {
    return this.isAuthenticated && !this.isLoginRoute;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarMobile() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (window.innerWidth < 768) {
      this.sidebarOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth >= 768) {
      this.sidebarOpen = true;
    } else {
      this.sidebarOpen = false;
    }
  }
}