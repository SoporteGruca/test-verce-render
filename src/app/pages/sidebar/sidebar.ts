import { ChangeDetectorRef, Component, EventEmitter, input, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../../service/auth';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ]
})

export class Sidebar implements OnInit , OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() isVisible: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  username: string = 'Cargando...';
  userLevel: string = '';

  private authSubscription?: Subscription;
  private initialized: boolean = false;
  
// Menú items
  menuItems = [
    { icon: '🏠', label: 'Inicio', route: '/dashboard'},
    { icon: '�', label: 'Catálogo', route: '/catalogo'},
    { icon: '🧭', label: 'Agenda de viaje', route: '/viaje'},
    { icon: '⛽', label: 'Consumo de gasolina', route: '/gasolina'},
    { icon: '✅', label: 'Normativo', route: '/normativo'},
    { icon: '🚨', label: 'Reportar falla', route: '/fallas'},
    { icon: '💸', label: 'Gastos', route: '/gastos'},
    { icon: '🛠️', label: 'Servicio', route: '/servicio'},
    { icon: '🧾', label: 'Orden de servicio', route: '/ordenes'},
    { icon: '🔩', label: 'Mecánica general', route: '/mecanica'},
    { icon: '🏷️', label: 'Precios', route: '/precios'},
    { icon: '👥', label: 'Usuarios', route: '/usuarios'},
    // { icon: '📊', label: 'Formulario', route: '/formulario'},
    // { icon: '📑', label: 'Reportes', route: '/reportes'},
  ];

  private isBrowser: boolean;

  constructor (
    @Inject(PLATFORM_ID) private platformId: Object,
    private auth: Auth,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit (): void {

     // 🔥 Recuperar estado guardado (solo en navegador)
    if (this.isBrowser) {
      this.loadSidebarState();
    } else {
      // Valor por defecto si no es navegador
      this.isOpen = false;
    }

      // 🔥 Recuperar estado guardado
    this.loadSidebarState();

    this.loadUserData();
    
    this.authSubscription = this.auth.authStatus$.subscribe(
      isAuth => {
        if (isAuth && !this.initialized) {
          this.loadUserData();
          this.initialized = true;
        } else if (!isAuth) {
          this.clearUserData();
        }
        this.cdr.detectChanges();
      }
    )

  }

  private loadUserData(): void {
    try {
      const usuario = this.auth.getUser();
      
      if (usuario) {
        this.username = usuario.nombre || 'Usuario';
        this.userLevel = usuario.nivel || 'Desconocido';
      }
    } catch (error) {
      console.error('❌ Error al cargar datos del usuario:', error);
    } finally {
    }
  }

  private clearUserData(): void {
    this.username = 'Cargando...';
    this.userLevel = '';
    this.initialized = false;
    this.cdr.detectChanges();
  }
  
  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  // 🔥 Guardar estado del sidebar
  private saveSidebarState(): void {
    try {
      localStorage.setItem('sidebarOpen', JSON.stringify(this.isOpen));
    } catch (error) {
      console.error('Error al guardar estado del sidebar:', error);
    }
  }

  // 🔥 Cargar estado del sidebar
  private loadSidebarState(): void {
    if (!this.isBrowser) {
      // Valor por defecto en entorno no-browser
      this.isOpen = false;
      return;
    }

    try {
      const saved = localStorage.getItem('sidebarOpen');
      if (saved !== null) {
        this.isOpen = JSON.parse(saved);
      } else {
        // Valor por defecto: cerrado en móvil, abierto en desktop
        this.isOpen = window.innerWidth > 768;
      }
    } catch (error) {
      this.isOpen = window.innerWidth > 768;
    }
  }

  onToggle(){
    if (!this.isBrowser) return;

    this.isOpen = !this.isOpen;
    this.saveSidebarState(); // 🔥 Guardar estado
    this.toggleSidebar.emit();

    // Si se cierra, asegurar que el overlay se oculte
    if (!this.isOpen) {
      this.cdr.detectChanges();
    }
  }

  setActive(index: number) {
    if (this.menuItems[index]) {
        this.router.navigate([this.menuItems[index].route]);

        if (this.isBrowser &&window.innerWidth <= 768) {
            this.toggleSidebar.emit();
        }
    }
}

  logout(): void {
    this.auth.logout();
  }

}
