import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Interfaz para el vehículo
export interface Vehiculo {
  noEconomico: string;
  estado: string;
  marca: string;
  tipo: string;
  tipoCorto: string;
  propietario: string;
  montoLimite: string;
  modelo: string;
  color: string;
  noSerie: string;
  noMotor: string;
  empresa: string;
  usuario: string;
  facturacion: string;
  placa: string;
  diasPara: string;
  kilometraje: string;
  placaAnterior: string;
  controlGas: string;
  comentario: string;
}

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss',
})
export class Catalogo {
  // Datos del formulario
  vehiculo: Vehiculo = {
    noEconomico: '',
    estado: '',
    marca: '',
    tipo: '',
    tipoCorto: '',
    propietario: '',
    montoLimite: '',
    modelo: '',
    color: '',
    noSerie: '',
    noMotor: '',
    empresa: '',
    usuario: '',
    facturacion: '',
    placa: '',
    diasPara: '',
    kilometraje: '',
    placaAnterior: '',
    controlGas: '',
    comentario: ''
  };

  // Lista de vehículos (simula datos de la base de datos)
  vehiculos: Vehiculo[] = [
    {
      noEconomico: '101',
      estado: 'Activo',
      marca: 'Toyota',
      tipo: 'Camioneta',
      tipoCorto: 'CAM',
      propietario: 'Logística SA',
      montoLimite: '2500',
      modelo: '2022',
      color: 'Blanco',
      noSerie: 'JT123',
      noMotor: 'MTR-22',
      empresa: 'Grupo XYZ',
      usuario: 'Carlos R.',
      facturacion: 'FAC-001',
      placa: 'ABC-123',
      diasPara: '45',
      kilometraje: '15400',
      placaAnterior: 'XYZ-789',
      controlGas: 'SI',
      comentario: 'Servicio reciente'
    },
    {
      noEconomico: '205',
      estado: 'Inactivo',
      marca: 'Ford',
      tipo: 'Sedán',
      tipoCorto: 'SED',
      propietario: 'RentaCar',
      montoLimite: '1800',
      modelo: '2021',
      color: 'Gris',
      noSerie: 'FD789',
      noMotor: 'MTR-45',
      empresa: 'RentaCar',
      usuario: 'Laura M.',
      facturacion: 'FAC-002',
      placa: 'DEF-456',
      diasPara: '12',
      kilometraje: '32100',
      placaAnterior: 'ABC-456',
      controlGas: 'NO',
      comentario: 'Próximo mantenimiento'
    }
  ];

  // Filtros
  filtroMarca: string = '';
  filtroModelo: string = '';
  filtroPropietario: string = '';
  filtroPlaca: string = '';

  // Vehículos filtrados (vista)
  vehiculosFiltrados: Vehiculo[] = [];

  constructor() {
    this.aplicarFiltros();
  }

  /**
   * Aplica los filtros a la lista de vehículos
   */
  aplicarFiltros(): void {
    this.vehiculosFiltrados = this.vehiculos.filter(v => {
      const matchMarca = v.marca?.toLowerCase().includes(this.filtroMarca.toLowerCase()) || !this.filtroMarca;
      const matchModelo = v.modelo?.toLowerCase().includes(this.filtroModelo.toLowerCase()) || !this.filtroModelo;
      const matchProp = v.propietario?.toLowerCase().includes(this.filtroPropietario.toLowerCase()) || !this.filtroPropietario;
      const matchPlaca = v.placa?.toLowerCase().includes(this.filtroPlaca.toLowerCase()) || !this.filtroPlaca;
      return matchMarca && matchModelo && matchProp && matchPlaca;
    });
  }

  /**
   * Guarda un nuevo vehículo (simula inserción en DB)
   */
  onSubmit(): void {
    // Aquí iría la llamada a tu servicio/API
    // Ejemplo: this.vehiculoService.guardar(this.vehiculo).subscribe(...)
    
    // Simulación: agregar a la lista
    const nuevoVehiculo = { ...this.vehiculo };
    this.vehiculos.push(nuevoVehiculo);
    this.aplicarFiltros();
    
    // Limpiar formulario después de guardar
    this.limpiarForm();
    
    console.log('Vehículo guardado:', nuevoVehiculo);
    // Podrías mostrar un mensaje de éxito con Toast o similar
  }

  /**
   * Carga datos de ejemplo en el formulario
   */
  cargarEjemplo(): void {
    if (this.vehiculos.length > 0) {
      // Cargar el primer vehículo como ejemplo
      const ejemplo = this.vehiculos[0];
      this.vehiculo = { ...ejemplo };
    }
  }

  /**
   * Limpia todos los campos del formulario
   */
  limpiarForm(): void {
    this.vehiculo = {
      noEconomico: '',
      estado: '',
      marca: '',
      tipo: '',
      tipoCorto: '',
      propietario: '',
      montoLimite: '',
      modelo: '',
      color: '',
      noSerie: '',
      noMotor: '',
      empresa: '',
      usuario: '',
      facturacion: '',
      placa: '',
      diasPara: '',
      kilometraje: '',
      placaAnterior: '',
      controlGas: '',
      comentario: ''
    };
  }

  /**
   * Recarga los datos desde la "base de datos"
   */
  recargarVista(): void {
    // Simula una recarga desde la DB
    // En un caso real: this.vehiculoService.obtenerTodos().subscribe(data => { ... })
    this.aplicarFiltros();
    console.log('Vista recargada');
  }

  /**
   * Acción de salir
   */
  salir(): void {
    // Aquí iría la lógica de cierre de sesión o navegación
    console.log('Saliendo...');
    // Ejemplo: this.router.navigate(['/login']);
    alert('Función Salir · cerrar sesión o redirigir');
  }
}