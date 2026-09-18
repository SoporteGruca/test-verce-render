import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { Usuarios } from './usuarios';

describe('Usuarios', () => {
  let component: Usuarios;
  let fixture: ComponentFixture<Usuarios>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Usuarios],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(Usuarios);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    component.usuarios = [
      {
        id: 1,
        nomina: 'NOM-001',
        nombre: 'Luis García',
        departamento: 'Compras',
        puesto: 'Analista',
        nivel: 'user',
        correo: 'luis@empresa.com',
        contrasena: '1234',
        usuario: 'lgarcia',
        estatus: 'Activo'
      }
    ];
    component.usuariosFiltrados = [...component.usuarios];
    component.editIndex = 0;
    component.usuario = {
      ...component.usuarios[0],
      nombre: 'Luis García Modificado',
      nivel: 'admin',
      usuario: 'lgarcia2',
      correo: 'luis.modificado@empresa.com',
      estatus: 'Activo'
    };
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should update the table immediately after saving a user change', () => {
    component.guardarCambio();

    const postRequest = httpMock.expectOne((request) => request.url.includes('/gusuarios') && request.method === 'POST');
    postRequest.flush({});

    const getRequest = httpMock.expectOne((request) => request.url.includes('/usuarios') && request.method === 'GET');
    getRequest.flush([
      {
        idUsuarioSCVehicular: 1,
        nomNomina: 'NOM-001',
        nomUsuario: 'Luis García Modificado',
        usuario: 'lgarcia2',
        correo: 'luis.modificado@empresa.com',
        puestoUsuario: 'Analista',
        deptoUsuario: 'Compras',
        contrasena: '1234',
        nivel: 'admin',
        estatus: 'Activo'
      }
    ]);

    expect(component.usuarios[0].nombre).toBe('Luis García Modificado');
    expect(component.usuarios[0].nivel).toBe('admin');
    expect(component.usuarios[0].usuario).toBe('lgarcia2');
  });
});
