import { ColumnDef } from '@tanstack/react-table';
import { Order, FabricationState, SaleState, ShippingState, StampType, ShippingCarrier } from '@/lib/types/index';
import { getColumnsForViewMode, createColumnDef } from '@/lib/utils/columnConfig';
import { CellFecha } from './cells/CellFecha';
import { CellCliente } from './cells/CellCliente';
import { CellContacto } from './cells/CellContacto';
import { CellDisenio } from './cells/CellDisenio';
import { CellEnvio } from './cells/CellEnvio';
import { CellSena } from './cells/CellSena';
import { CellValor } from './cells/CellValor';
import { CellRestante } from './cells/CellRestante';
import { CellSeguimiento } from './cells/CellSeguimiento';
import { CellFoto } from './cells/CellFoto';
import { CellFabricacion } from './cells/CellFabricacion';
import { CellVenta } from './cells/CellVenta';
import { CellEnvioEstado } from './cells/CellEnvioEstado';
import { CellTipo } from './cells/CellTipo';
import { CellBase } from './cells/CellBase';
import { CellVector } from './cells/CellVector';
import { CellTasks } from './cells/CellTasks';
import { CellDeadline } from './cells/CellDeadline';
import { CellPrioridad } from './cells/CellPrioridad';
import { CompactProgressIndicator } from './cells/CellProgressIndicator';

// --- INICIO DE CORRECCIÓN 1: Definir las props que aceptamos ---
interface UnifiedColumnsProps {
  onTipoChange?: (itemId: string, newTipo: StampType) => void;
  onFabricacionChange?: (itemId: string, newState: FabricationState) => void;
  onVentaChange?: (itemId: string, newState: SaleState) => void;
  onEnvioEstadoChange?: (itemId: string, newState: ShippingState) => void;
  onEnvioChange?: (orderId: string, newCarrier: ShippingCarrier) => void;
  onDateChange?: (orderId: string, newDate: Date) => void;
  onDeadlineChange?: (orderId: string, newDeadline: Date | null) => void;
  onTaskCreate?: (orderId: string, title: string, description?: string, dueDate?: Date) => void;
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onTaskDelete?: (taskId: string) => void;
  isSubitem?: boolean;
  onProgressChange?: (orderId: string, newStep: any) => void;
  editingRowId?: string | null;
  onUpdate?: (orderId: string, updates: any) => void;
  onExpand?: (orderId: string) => void;
}
// --- FIN DE CORRECCIÓN 1 ---

export function createUnifiedColumns({
  // --- INICIO DE CORRECCIÓN 2: Destructurar las props ---
  onTipoChange,
  onFabricacionChange,
  onVentaChange,
  onEnvioEstadoChange,
  onEnvioChange,
  onDateChange,
  onDeadlineChange,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onProgressChange,
  // --- FIN DE CORRECCIÓN 2 ---
  editingRowId,
  onUpdate,
  onExpand,
  isSubitem = false
}: UnifiedColumnsProps): ColumnDef<Order>[] {
  const columnConfigs = getColumnsForViewMode('items');
  
  const cellRenderers: Record<string, (props: any) => React.ReactNode> = {
    // Indicadores
    indicadores: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        <CellTasks
          order={row.original}
          onTaskCreate={onTaskCreate}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
        />
        <CellDeadline
          order={row.original}
          onDeadlineChange={onDeadlineChange}
        />
      </div>
    ),
    
    // Fecha
    fecha: ({ row }) => (
      <CellFecha
        order={row.original}
        onDateChange={onDateChange}
      />
    ),
    
    // Cliente
    cliente: ({ row }) => (
      <CellCliente
        order={row.original}
        onUpdate={onUpdate}
        editingRowId={editingRowId}
      />
    ),
    
    // Contacto
    contacto: ({ row }) => (
      <CellContacto
        order={row.original}
        onUpdate={onUpdate}
        editingRowId={editingRowId}
      />
    ),
    
    // Tipo
    tipo: ({ row }) => (
      <CellTipo
        order={row.original}
        onTipoChange={onTipoChange} // <--- Pasar la prop
      />
    ),
    
    // Diseño
    disenio: ({ row }) => (
      <CellDisenio
        order={row.original}
        showNotes={true}
        onExpand={() => onExpand?.(row.original.id)}
        editingRowId={editingRowId}
        onUpdate={onUpdate}
      />
    ),
    
    // Empresa/Envío
    envio: ({ row }) => (
      <CellEnvio
        order={row.original}
        onEnvioChange={onEnvioChange} // <--- Pasar la prop
      />
    ),
    
    // Seña
    sena: ({ row }) => (
      <CellSena
        order={row.original}
        onUpdate={onUpdate}
        editingRowId={editingRowId}
      />
    ),
    
    // Valor
    valor: ({ row }) => (
      <CellValor
        order={row.original}
        onUpdate={onUpdate}
        editingRowId={editingRowId}
      />
    ),
    
    // Restante
    restante: ({ row }) => (
      <CellRestante
        order={row.original}
      />
    ),
    
    // Prioridad
    prioridad: ({ row }) => (
      <CellPrioridad order={row.original} />
    ),
    
    // Fabricación
    fabricacion: ({ row }) => (
      <CellFabricacion
        order={row.original}
        onFabricacionChange={onFabricacionChange} // <--- Pasar la prop
      />
    ),
    
    // Venta
    venta: ({ row }) => (
      <CellVenta
        order={row.original}
        onVentaChange={onVentaChange} // <--- Pasar la prop
        isSubitem={isSubitem}
      />
    ),
    
    // Envío Estado
    envioEstado: ({ row }) => (
      <CellEnvioEstado
        order={row.original}
        onEnvioEstadoChange={onEnvioEstadoChange} // <--- Pasar la prop
      />
    ),
    
    // Seguimiento
    seguimiento: ({ row }) => (
      <CellSeguimiento
        order={row.original}
        onUpdate={onUpdate}
        editingRowId={editingRowId}
      />
    ),
    
    // Base
    base: ({ row }) => (
      <CellBase
        order={row.original}
      />
    ),
    
    // Vector
    vector: ({ row }) => (
      <CellVector
        order={row.original}
      />
    ),
    
    // Foto
    foto: ({ row }) => (
      <CellFoto
        order={row.original}
      />
    ),
  };

  return columnConfigs.map(config => 
    createColumnDef<Order>(config, cellRenderers[config.id])
  );
}
