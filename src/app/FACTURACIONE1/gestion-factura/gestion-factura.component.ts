import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { FacturasService, FacturaDto, FacturaDetalleDto, FacturaCreateUpdateDto } from '../../Services/FacturaE1/facturas.service';
import { ClienteService } from '../../Services/FacturaE1/cliente.service';
import { AreaService } from '../../Services/FacturaE1/area.service';
import { ProductoService, ProductoDto } from '../../Services/FacturaE1/producto.service';

interface Cliente {
  id: number;
  nombre: string;
  ruc?: string;
}

interface Area {
  id: number;
  nombre: string;
}

interface Sucursal {
  id: number;
  nombre: string;
}

interface TipoComprobante {
  codigo: string;
  nombre: string;
}

@Component({
  selector: 'app-gestion-factura',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    ToastModule,
    DialogModule
  ],
  providers: [MessageService],
  templateUrl: './gestion-factura.component.html',
  styleUrl: './gestion-factura.component.css',
})
export class GestionFacturaComponent implements OnInit, OnChanges {
  @Input() modo: 'crear' | 'editar' | 'detalle' = 'crear';
  @Input() facturaId: number | null = null;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  facturaForm!: FormGroup;
  cargando: boolean = false;
  facturaActual: FacturaDto | null = null;

  // Modal de gestión de producto
  productoDialog: boolean = false;
  productoForm!: FormGroup;
  guardandoProducto: boolean = false;

  // Opciones para dropdowns
  clientes: Cliente[] = [];
  areas: Area[] = [];
  sucursales: Sucursal[] = [];
  productos: ProductoDto[] = [];
  tiposComprobante: TipoComprobante[] = [
    { codigo: 'FACTURA', nombre: 'Factura' },
    { codigo: 'BOLETA', nombre: 'Boleta' },
    { codigo: 'NOTA_CREDITO', nombre: 'Nota de Crédito' },
    { codigo: 'NOTA_DEBITO', nombre: 'Nota de Débito' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly facturasService: FacturasService,
    private readonly messageService: MessageService,
    private readonly clienteService: ClienteService,
    private readonly areaService: AreaService,
    private readonly productoService: ProductoService
  ) {
    this.inicializarFormulario();
    this.inicializarFormularioProducto();
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['facturaId'] && this.facturaId) {
      this.cargarFactura();
    } else if (changes['modo']) {
      this.ajustarFormularioPorModo();
    }
  }

  private inicializarFormulario(): void {
    this.facturaForm = this.fb.group({
      numeroFactura: ['', Validators.required],
      clienteId: [null, Validators.required],
      areaId: [null, Validators.required],
      sucursalId: [null, Validators.required],
      fechaEmision: [new Date(), Validators.required],
      fechaVencimiento: [null],
      subtotal: [{ value: 0, disabled: true }],
      iva: [{ value: 0, disabled: true }],
      totalConIva: [{ value: 0, disabled: true }],
      valorRetencion: [0],
      totalFinal: [{ value: 0, disabled: true }],
      observaciones: [''],
      estado: ['PENDIENTE'],
      responsableId: [null],
      detalles: this.fb.array([])
    });

    // Agregar una línea de detalle por defecto
    this.agregarDetalle();
  }

  private ajustarFormularioPorModo(): void {
    if (this.modo === 'detalle') {
      this.facturaForm.disable();
    } else {
      this.facturaForm.enable();
      // Mantener campos calculados deshabilitados
      this.facturaForm.get('subtotal')?.disable();
      this.facturaForm.get('iva')?.disable();
      this.facturaForm.get('totalConIva')?.disable();
      this.facturaForm.get('totalFinal')?.disable();
    }
  }

  private cargarDatosIniciales(): void {
    // Cargar proveedores (clientes)
    this.clienteService.getAllPaginado({
      pagina: 1,
      registrosPorPagina: 1000, // Cargar todos para el select
      estado: 'Activo'
    }).subscribe({
      next: (response) => {
        this.clientes = response.proveedores.map(p => ({
          id: p.id,
          nombre: p.nombreComercial || p.razonSocial,
          ruc: p.identificacion
        }));
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los clientes'
        });
      }
    });

    // Cargar áreas
    this.areaService.listarAreas({
      pagina: 1,
      registrosPorPagina: 1000,
      estado: true
    }).subscribe({
      next: (response) => {
        this.areas = response.areas.map(a => ({
          id: a.id!,
          nombre: a.nombre
        }));
      },
      error: (err) => {
        console.error('Error al cargar áreas:', err);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar las áreas'
        });
      }
    });

    // TODO: Cargar sucursales desde servicio cuando esté disponible
    // Por ahora mantenemos datos de ejemplo para sucursales
    this.sucursales = [
      { id: 1, nombre: 'Matriz' },
      { id: 2, nombre: 'Sucursal Norte' },
      { id: 3, nombre: 'Sucursal Sur' }
    ];

    // Cargar productos disponibles
    this.productoService.listarProductos({
      pagina: 1,
      registrosPorPagina: 1000,
      estado: 'Activo'
    }).subscribe({
      next: (response) => {
        this.productos = response.productos.map(p => ({
          ...p,
          precioUnitario: p.precio || p.precioUnitario || 0
        }));
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los productos. Puede escribir la descripción manualmente.'
        });
      }
    });
  }

  private cargarFactura(): void {
    if (!this.facturaId) return;

    this.cargando = true;
    this.facturasService.obtenerFacturaDetalle(this.facturaId).subscribe({
      next: (factura) => {
        this.facturaActual = factura;
        this.llenarFormulario(factura);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar factura:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la factura'
        });
        this.cargando = false;
      }
    });
  }

  private llenarFormulario(factura: FacturaDto): void {
    this.facturaForm.patchValue({
      numeroFactura: factura.numeroFactura,
      clienteId: factura.clienteId,
      areaId: factura.areaId,
      sucursalId: factura.sucursalId,
      fechaEmision: new Date(factura.fechaEmision),
      fechaVencimiento: factura.fechaVencimiento ? new Date(factura.fechaVencimiento) : null,
      subtotal: factura.subtotal,
      iva: factura.iva,
      totalConIva: factura.totalConIva,
      valorRetencion: factura.valorRetencion,
      totalFinal: factura.totalFinal,
      observaciones: factura.observaciones,
      estado: factura.estado,
      responsableId: factura.responsableId
    });

    // Limpiar detalles existentes y cargar los nuevos
    this.detalles.clear();
    if (factura.detalles && factura.detalles.length > 0) {
      for (const detalle of factura.detalles) {
        this.detalles.push(this.crearDetalleFormGroup(detalle));
      }
    } else {
      this.agregarDetalle();
    }

    this.ajustarFormularioPorModo();
  }

  get detalles(): FormArray {
    return this.facturaForm.get('detalles') as FormArray;
  }

  private crearDetalleFormGroup(detalle?: FacturaDetalleDto): FormGroup {
    const grupo = this.fb.group({
      id: [detalle?.id || 0],
      productoId: [0],
      descripcion: [detalle?.descripcion || '', Validators.required],
      cantidad: [detalle?.cantidad || 1, [Validators.required, Validators.min(1)]],
      precioUnitario: [detalle?.precioUnitario || 0, [Validators.required, Validators.min(0)]],
      subtotal: [{ value: detalle?.subtotal || 0, disabled: true }]
    });

    // Calcular subtotal cuando cambien cantidad o precio
    grupo.get('cantidad')?.valueChanges.subscribe(() => this.calcularSubtotalDetalle(grupo));
    grupo.get('precioUnitario')?.valueChanges.subscribe(() => this.calcularSubtotalDetalle(grupo));

    // Autocompletar datos cuando se selecciona un producto
    grupo.get('productoId')?.valueChanges.subscribe((productoId: number | null) => {
      if (productoId && productoId > 0) {
        const producto = this.productos.find(p => p.id === productoId);
        if (producto) {
          grupo.patchValue({
            descripcion: producto.nombre,
            precioUnitario: producto.precioUnitario
          }, { emitEvent: false });
          this.calcularSubtotalDetalle(grupo);
        }
      }
    });

    return grupo;
  }

  agregarDetalle(): void {
    this.detalles.push(this.crearDetalleFormGroup());
  }

  eliminarDetalle(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
      this.calcularTotales();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe haber al menos una línea de detalle'
      });
    }
  }

  private calcularSubtotalDetalle(detalleGroup: FormGroup): void {
    const cantidad = detalleGroup.get('cantidad')?.value || 0;
    const precioUnitario = detalleGroup.get('precioUnitario')?.value || 0;
    const subtotal = cantidad * precioUnitario;
    
    detalleGroup.patchValue({ subtotal }, { emitEvent: false });
    this.calcularTotales();
  }

  private calcularTotales(): void {
    let subtotal = 0;
    
    for (const detalle of this.detalles.controls) {
      const cantidad = detalle.get('cantidad')?.value || 0;
      const precioUnitario = detalle.get('precioUnitario')?.value || 0;
      subtotal += cantidad * precioUnitario;
    }

    const iva = subtotal * 0.15; // 15% de IVA
    const totalConIva = subtotal + iva;
    const valorRetencion = this.facturaForm.get('valorRetencion')?.value || 0;
    const totalFinal = totalConIva - valorRetencion;

    this.facturaForm.patchValue({
      subtotal,
      iva,
      totalConIva,
      totalFinal
    }, { emitEvent: false });
  }

  onRetencionChange(): void {
    this.calcularTotales();
  }

  guardarFactura(): void {
    if (this.facturaForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    const formValue = this.facturaForm.getRawValue();

    const facturaDto: FacturaCreateUpdateDto = {
      numeroFactura: formValue.numeroFactura,
      clienteId: formValue.clienteId,
      areaId: formValue.areaId,
      sucursalId: formValue.sucursalId,
      fechaEmision: formValue.fechaEmision.toISOString(),
      fechaVencimiento: formValue.fechaVencimiento ? formValue.fechaVencimiento.toISOString() : undefined,
      subtotal: formValue.subtotal,
      iva: formValue.iva,
      totalConIva: formValue.totalConIva,
      valorRetencion: formValue.valorRetencion,
      totalFinal: formValue.totalFinal,
      observaciones: formValue.observaciones,
      estado: formValue.estado,
      responsableId: formValue.responsableId,
      detalles: formValue.detalles.map((d: any) => ({
        productoId: d.productoId || undefined,
        descripcion: d.descripcion,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        subtotal: d.cantidad * d.precioUnitario
      }))
    };

    this.cargando = true;

    const operacion = this.modo === 'crear'
      ? this.facturasService.crearFactura(facturaDto)
      : this.facturasService.editarFactura(this.facturaId!, facturaDto);

    operacion.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Factura ${this.modo === 'crear' ? 'creada' : 'actualizada'} correctamente`
        });
        this.cargando = false;
        this.guardado.emit();
      },
      error: (error) => {
        console.error('Error al guardar factura:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo guardar la factura'
        });
        this.cargando = false;
      }
    });
  }

  cerrarFormulario(): void {
    this.cancelado.emit();
  }

  get esDetalle(): boolean {
    return this.modo === 'detalle';
  }

  get tituloBotonGuardar(): string {
    return this.modo === 'crear' ? 'Crear Factura' : 'Actualizar Factura';
  }

  // ========== MÉTODOS PARA GESTIÓN DE PRODUCTOS ==========

  private inicializarFormularioProducto(): void {
    this.productoForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      unidadMedida: [''],
      categoria: [''],
      stock: [0, Validators.min(0)],
      stockMinimo: [0, Validators.min(0)],
      estado: ['Activo']
    });
  }

  abrirCrearProducto(): void {
    this.productoForm.reset({
      codigo: '',
      nombre: '',
      descripcion: '',
      precioUnitario: 0,
      unidadMedida: 'UND',
      categoria: '',
      stock: 0,
      stockMinimo: 0,
      estado: 'Activo'
    });
    this.productoDialog = true;
  }

  guardarProducto(): void {
    if (this.productoForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail: 'Por favor complete los campos requeridos'
      });
      return;
    }

    this.guardandoProducto = true;
    const formValue = this.productoForm.value;
    const productoDto: ProductoDto = {
      ...formValue,
      precio: formValue.precioUnitario
    };

    this.productoService.crearProducto(productoDto).subscribe({
      next: (nuevoProducto) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Producto creado correctamente'
        });
        
        // Agregar el nuevo producto a la lista con el mapeo correcto
        this.productos.push({
          ...nuevoProducto,
          precioUnitario: nuevoProducto.precio || nuevoProducto.precioUnitario || 0
        });
        
        this.productoDialog = false;
        this.guardandoProducto = false;
      },
      error: (error) => {
        console.error('Error al crear producto:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.error || 'No se pudo crear el producto'
        });
        this.guardandoProducto = false;
      }
    });
  }

  cerrarProductoDialog(): void {
    this.productoDialog = false;
  }
}
