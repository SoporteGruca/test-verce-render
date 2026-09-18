import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/enviroment';
import { firstValueFrom } from 'rxjs';

interface Usuario {
  id: number;
  nomina: string;
  nombre: string;
  departamento: string;
  puesto: string;
  nivel: string;
  correo: string;
  contrasena: string;
  usuario: string;
  estatus: string;
}

interface UsuarioResponse {
  idUsuarioSCVehicular?: number;
  nomNomina?: string | number;
  nomUsuario?: string;
  usuario?: string;
  correo?: string;
  puestoUsuario?: string;
  deptoUsuario?: string;
  contrasena?: string;
  nivel?: string;
  estatus?: string;
  nombre?: string;
  nomina?: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class Usuarios implements OnInit {
  usuario: any = {
    nomina: '',
    nombre: '',
    departamento: '',
    puesto: '',
    nivel: '',
    correo: '',
    contrasena: '',
    usuario: '',
    estatus: 'Activo'
  };

  private apiUrl = environment.apiUrl;

  usuarios: Usuario[] = [];

  filtroBusqueda: string = '';
  filtroNomina: string = '';
  filtroNombre: string = '';
  filtroDepartamento: string = '';
  filtroPuesto: string = '';
  filtroNivel: string = '';
  filtroEstatus: string = '';

  usuariosFiltrados: Usuario[] = [];

  editIndex: number | null = null;
  mostrarContrasena: boolean = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  private mapUsuarioResponse(item: UsuarioResponse): Usuario {
    return {
      id: item.idUsuarioSCVehicular ?? (item as any).id ?? 0,
      nomina: item.nomNomina && item.nomNomina !== 0 ? String(item.nomNomina) : String(item.nomina ?? ''),
      nombre: item.nomUsuario?.trim() ?? item.nombre?.trim() ?? '',
      departamento: String(item.deptoUsuario ?? (item as any).departamento ?? '').trim(),
      puesto: String(item.puestoUsuario ?? (item as any).puesto ?? '').trim(),
      nivel: item.nivel?.trim() ?? '',
      correo: item.correo?.trim() ?? '',
      contrasena: item.contrasena ?? '',
      usuario: item.usuario?.trim() ?? '',
      estatus: item.estatus?.trim() || 'Activo'
    };
  }

  cargarUsuarios(): void {
    this.http.get<UsuarioResponse[]>(`${this.apiUrl}/usuarios`).subscribe({
      next: (response: UsuarioResponse[]) => {
        this.usuarios = response.map((item: UsuarioResponse) => this.mapUsuarioResponse(item));
        this.aplicarFiltros();
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.usuarios = [];
        this.aplicarFiltros();
        alert('No se pudieron cargar los usuarios desde el servidor.');
      }
    });
  }

  aplicarFiltros(): void {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const busqueda = this.filtroBusqueda.toLowerCase();
      const matchBusqueda = !this.filtroBusqueda ||
        usuario.nombre?.toLowerCase().includes(busqueda) ||
        usuario.usuario?.toLowerCase().includes(busqueda) ||
        usuario.correo?.toLowerCase().includes(busqueda) ||
        usuario.departamento?.toLowerCase().includes(busqueda);

      const matchNomina = !this.filtroNomina || usuario.nomina?.toLowerCase().includes(this.filtroNomina.toLowerCase());
      const matchNombre = !this.filtroNombre || usuario.nombre?.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const matchDepartamento = !this.filtroDepartamento || usuario.departamento?.toLowerCase().includes(this.filtroDepartamento.toLowerCase());
      const matchPuesto = !this.filtroPuesto || usuario.puesto?.toLowerCase().includes(this.filtroPuesto.toLowerCase());
      const matchNivel = !this.filtroNivel || usuario.nivel === this.filtroNivel;
      const matchEstatus = !this.filtroEstatus || usuario.estatus === this.filtroEstatus;

      return matchBusqueda && matchNomina && matchNombre && matchDepartamento && matchPuesto && matchNivel && matchEstatus;
    });
  }

  buscar(): void {
    this.aplicarFiltros();
  }

  private prepararBackend(usuarioData: any, esNuevo: boolean = false): any {

    const id = esNuevo ? Date.now() : this.usuarios[this.editIndex!]?.id || Date.now();

    const usuarioActualizado: Usuario = {
      id: this.editIndex !== null ? this.usuarios[this.editIndex].id : Date.now(),
      nomina: String(this.usuario.nomina ?? '').trim(),
      nombre: String(this.usuario.nombre ?? '').trim(),
      departamento: String(this.usuario.departamento ?? '').trim(),
      puesto: String(this.usuario.puesto ?? '').trim(),
      nivel: String(this.usuario.nivel ?? '').trim(),
      correo: String(this.usuario.correo ?? '').trim(),
      contrasena: String(this.usuario.contrasena ?? '').trim(),
      usuario: String(this.usuario.usuario ?? '').trim(),
      estatus: String(this.usuario.estatus ?? 'Activo').trim() || 'Activo'
    };

    return {
      idUsuarioSCVehicular: usuarioActualizado.id,
      nomNomina: usuarioActualizado.nomina ? Number.parseInt(usuarioActualizado.nomina, 10) || null : null,
      nomUsuario: usuarioActualizado.nombre,
      usuario: usuarioActualizado.usuario,
      correo: usuarioActualizado.correo,
      puestoUsuario: usuarioActualizado.puesto || null,
      deptoUsuario: usuarioActualizado.departamento || null,
      contrasena: usuarioActualizado.contrasena || null,
      nivel: usuarioActualizado.nivel || null,
      estatus: usuarioActualizado.estatus
    }

  }

  private mapearUsuario(data: any): Usuario {
    return {
      id: data.idUsuarioSCVehicular,
      nomina: data.nomNomina !== null ? String(data.nomNomina) : '',
      nombre: data.nomUsuario?.trim() ?? '',
      departamento: data.deptoUsuario?.trim() ?? '',
      puesto: data.puestoUsuario?.trim() ?? '',
      nivel: data.nivel?.trim() ?? '',
      correo: data.correo?.trim() ?? '',
      contrasena: data.contrasena?.trim() ?? '',
      usuario: data.usuario?.trim() ?? '',
      estatus: data.estatus?.trim() ?? 'Activo'
    };

  }

  async guardarCambio(): Promise<void> {
    const camposRequeridos = ['nombre', 'nivel', 'usuario', 'correo'];
    const camposVacios = camposRequeridos.filter(campo => !String(this.usuario[campo] ?? '').trim());

    if (camposVacios.length > 0) {
      alert('⚠️ Por favor, complete los campos obligatorios: nombre, nivel, usuario y correo.');
      return;
    }

    try {
      const datosUsuario = this.prepararBackend(this.usuario, false);

      const response: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/gusuarios`, datosUsuario)
      );

      if (response?.success) {
        const usuarioGuardado = response.data;

        if (usuarioGuardado) {
          const usuarioMapeado = this.mapearUsuario(usuarioGuardado);

          if (this.editIndex !== null) {
            this.usuarios[this.editIndex] = { ...usuarioMapeado };
            this.usuarios = [...this.usuarios];
            this.aplicarFiltros();
            this.limpiar();
            this.editIndex = null;
            this.cdr.detectChanges();
            console.log('Usuario actualizado:', response);
          }

        }
      } else {
        // alert(`❌ Error: ${response?.message || 'Error al guardar el usuario'}`);
      }

    } catch (error: any) {
      console.error('❌ Error al guardar usuario:', error);
      // alert(`❌ Error al guardar el usuario: ${error.error?.message || error.message}`);
    }
  }

  private validarDuplicadoLocal(usuario: any): boolean {

    const otrosUsuarios = this.usuarios.filter((_, index) =>
      index !== this.editIndex
    );

    if (usuario.nomina) {
      const existeNomina = otrosUsuarios.some(u =>
        u.nomina === usuario.nomina
      );
      if (existeNomina) return true;
    }

    if (usuario.nombre) {
      const existeUsername = otrosUsuarios.some(u =>
        u.nombre?.toLowerCase() === usuario.nombre?.toLowerCase()
      );
      if (existeUsername) return true;
    }

    return false;
  }

  async agregarUsuario(): Promise<void> {

    try {

      const existeLocal = this.validarDuplicadoLocal(this.usuario)

      if (existeLocal) {
        alert('El usuario ya existe en la base de datos.');
        return;
      }

      const datosUsuario = this.prepararBackend(this.usuario, true);

      const response: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/ausuarios`, datosUsuario)
      );

      if (response?.success) {
        const usuarioGuardado = response.data;

        if (usuarioGuardado) {
          const usuarioMapeado = this.mapearUsuario(usuarioGuardado);

          if (this.editIndex !== null) {
            this.usuarios[this.editIndex] = { ...usuarioMapeado };
            this.usuarios = [...this.usuarios];
            this.aplicarFiltros();
            this.limpiar();
            this.editIndex = null;
            this.cdr.detectChanges();
            console.log('Usuario Insertado:', response);
          }

        }
      } else {
        // alert(`❌ Error: ${response?.message || 'Error al guardar el usuario'}`);
      }

    } catch (error: any) {
      console.error('❌ Error al agregar usuario:', error);
      // alert(`❌ Error al guardar el usuario: ${error.error?.message || error.message}`);
    }

  }

  modificarUsuario(): void {
    if (this.editIndex === null) {
      alert('⚠️ Seleccione un usuario para modificar');
      return;
    }
    this.guardarCambio();
  }

  editarUsuario(index: number): void {
    const registro = this.usuariosFiltrados[index];
    const indexReal = this.usuarios.findIndex(u => u.id === registro.id);
    if (indexReal === -1) return;

    this.editIndex = indexReal;
    this.usuario = { ...registro };
    this.mostrarContrasena = false;
    document.querySelector('.usuarios-grid')?.scrollIntoView({ behavior: 'smooth' });
  }

  toggleMostrarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  limpiar(): void {
    this.usuario = {
      nomina: '',
      nombre: '',
      departamento: '',
      puesto: '',
      nivel: '',
      correo: '',
      contrasena: '',
      usuario: '',
      estatus: 'Activo'
    };

    this.editIndex = null;
    this.mostrarContrasena = false;
  }
}