import { useMemo, useState, useEffect } from 'react';
import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
  CellContext, // Importar CellContext
} from '@tanstack/react-table';
import { Order, FabricationState, SaleState, ShippingState, StampType, ShippingCarrier } from '@/lib/types/index';
import { createUnifiedColumns } from './UnifiedColumns';
import { useOrdersStore } from '@/lib/state/orders.store';
import { useToast } from '@/components/ui/use-toast';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';
import { DndTableContainer } from './DndTableContainer';
import { ResizableHeader } from './ResizableHeader';
import { useExpandableRows } from './useExpandableRows';
import './expand-animations.css';

// Definir las props que aceptamos
interface OrdersTableProps {
  orders: Order[];
  onFabricacionChange?: (itemId: string, newState: FabricationState) => void;
  onVentaChange?: (itemId: string, newState: SaleState) => void;
  onEnvioEstadoChange?: (itemId: string, newState: ShippingState) => void;
  onTipoChange?: (itemId: string, newTipo: StampType) => void;
  onEnvioChange?: (orderId: string, newCarrier: ShippingCarrier) => void;
  onDateChange?: (orderId: string, newDate: Date) => void;
  onDeadlineChange?: (orderId: string, deadline: Date | null) => void;
  onTaskCreate?: (orderId: string, title: string, description?: string, dueDate?: Date) => void;
  onTaskUpdate?: (taskId: string, updates: any) => void;
  onTaskDelete?: (taskId: string) => void;
  onUpdate?: (orderId: string, patch: any) => void;
}

export function OrdersTable({
  orders,
  // Recibir las props
  onFabricacionChange,
  onVentaChange,
  onEnvioEstadoChange,
  onTipoChange,
  onEnvioChange,
  onDateChange,
  onDeadlineChange,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onUpdate
}: OrdersTableProps) {

  const {
    searchQuery,
    setEditingRow,
    editingRowId,
    columns,
    setColumnSize,
    reorderColumns
  } = useOrdersStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState[]>([] as any);
  const { toast } = useToast();
  const { toggleRow, isExpanded, isCollapsing, isExpanding } = useExpandableRows();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditingRow(null);
    };
    const onDblClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('tr[data-row]')) setEditingRow(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('dblclick', onDblClickOutside);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('dblclick', onDblClickOutside);
    };
  }, [setEditingRow]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const searchLower = searchQuery.toLowerCase();
    return orders.filter(order =>
      order.customer.firstName.toLowerCase().includes(searchLower) ||
      order.customer.lastName.toLowerCase().includes(searchLower) ||
      order.customer.email?.toLowerCase().includes(searchLower) ||
      order.items.some(item => item.designName.toLowerCase().includes(searchLower))
    );
  }, [orders, searchQuery]);

  const handleDelete = (orderId: string) => {
    toast({ title: 'TBD: Eliminar pedido', description: `Se eliminaría el pedido ${orderId}` });
  };

  // --- INICIO DE CORRECCIÓN: Pasar las props a las columnas ---
  const tableColumns = useMemo(() => {
    return createUnifiedColumns({
      onTipoChange: onTipoChange,
      onFabricacionChange: onFabricacionChange,
      onVentaChange: onVentaChange,
      onEnvioEstadoChange: onEnvioEstadoChange,
      onEnvioChange: onEnvioChange,
      onDateChange: onDateChange,
      onDeadlineChange: onDeadlineChange,
      onTaskCreate: onTaskCreate,
      onTaskUpdate: onTaskUpdate,
      onTaskDelete: onTaskDelete,
      onUpdate: onUpdate,
      editingRowId,
      onExpand: toggleRow,
      isSubitem: false
    });
  }, [
    editingRowId, toggleRow, onTipoChange, onFabricacionChange, onVentaChange,
    onEnvioEstadoChange, onEnvioChange, onDateChange, onDeadlineChange,
    onTaskCreate, onTaskUpdate, onTaskDelete, onUpdate
  ]);

  const subitemColumns = useMemo(() => {
    return createUnifiedColumns({
      onTipoChange: onTipoChange,
      onFabricacionChange: onFabricacionChange,
      onVentaChange: onVentaChange,
      onEnvioEstadoChange: onEnvioEstadoChange,
      onEnvioChange: onEnvioChange,
      onDateChange: onDateChange,
      onDeadlineChange: onDeadlineChange,
      onTaskCreate: onTaskCreate,
      onTaskUpdate: onTaskUpdate,
      onTaskDelete: onTaskDelete,
      onUpdate: onUpdate,
      editingRowId,
      onExpand: toggleRow,
      isSubitem: true
    });
  }, [
    editingRowId, toggleRow, onTipoChange, onFabricacionChange, onVentaChange,
    onEnvioEstadoChange, onEnvioChange, onDateChange, onDeadlineChange,
    onTaskCreate, onTaskUpdate, onTaskDelete, onUpdate
  ]);
  // --- FIN DE CORRECCIÓN ---

  const sortedColumns = useMemo(() => {
    return columns
      .sort((a, b) => a.order - b.order)
      .map(col => {
        const tableCol = tableColumns.find(tc => tc.id === col.id);
        return tableCol ? { ...tableCol, size: col.size } : null;
      })
      .filter((col): col is NonNullable<typeof col> => col !== null);
  }, [columns, tableColumns]);

  const sortedSubitemColumns = useMemo(() => {
    return columns
      .sort((a, b) => a.order - b.order)
      .map(col => {
        const tableCol = subitemColumns.find(tc => tc.id === col.id);
        return tableCol ? { ...tableCol, size: col.size } : null;
      })
      .filter((col): col is NonNullable<typeof col> => col !== null);
  }, [columns, subitemColumns]);

  const columnIds = columns.map(col => col.id);

  const table = useReactTable({
    data: filteredOrders, // Usamos los datos filtrados
    columns: sortedColumns, // Usamos las columnas de nivel superior
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters as any,
    state: {
      sorting,
      columnFilters: columnFilters as any,
    },
    enableColumnResizing: false,
    enableHiding: false,
  });

  const handleRowDoubleClick = (orderId: string) => setEditingRow(orderId);

  // --- INICIO DE CORRECCIÓN: Renderizar usando table.getRowModel() ---
  return (
    <div className="rounded-md border bg-card">
      <DndTableContainer
        columnIds={columnIds}
        onReorder={reorderColumns}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-card">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const columnState = columns.find(col => col.id === header.column.id);
                    const align = (header.column.columnDef.meta as any)?.align || 'left';
                    const isContacto = header.id === 'contacto';
                    const isRestante = header.id === 'restante';
                    const isStateColumn = ['fabricacion', 'venta', 'envioEstado'].includes(header.id);
                    const paddingClass = isStateColumn ? 'px-0' : 'px-2';

                    return (
                      <ResizableHeader
                        key={header.id}
                        id={header.column.id}
                        header=""
                        size={columnState?.size || 100}
                        onResize={setColumnSize}
                        className={`${paddingClass} py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider relative ${isContacto ? 'border-r border-border/30' : ''} ${isRestante ? 'border-r border-border/30' : ''} ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </ResizableHeader>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const order = row.original;
                  const hasMultipleItems = order.items.length > 1;
                  const isExpandedState = isExpanded(order.id);

                  if (!hasMultipleItems) {
                    // --- FILA DE ITEM ÚNICO (Renderizado correcto) ---
                    return (
                      <ContextMenu key={row.id}>
                        <ContextMenuTrigger asChild>
                          <tr
                            data-row
                            onDoubleClick={() => handleRowDoubleClick(order.id)}
                            className={`hover:bg-muted/50 transition-colors ${editingRowId === order.id ? 'ring-1 ring-primary/40' : ''}`}
                          >
                            {row.getVisibleCells().map((cell) => {
                              const columnState = columns.find(col => col.id === cell.column.id);
                              const align = (cell.column.columnDef.meta as any)?.align || 'left';
                              const isContacto = cell.column.id === 'contacto';
                              const isRestante = cell.column.id === 'restante';
                              const isStateColumn = ['fabricacion', 'venta', 'envioEstado'].includes(cell.column.id);
                              const isTextColumn = ['cliente', 'contacto'].includes(cell.column.id);
                              const isDisenioColumn = cell.column.id === 'disenio';
                              const paddingClass = isStateColumn ? 'px-0' : 'px-2';
                              const textOverflowClass = isTextColumn ? 'overflow-hidden' : isDisenioColumn ? 'overflow-hidden' : 'overflow-hidden text-ellipsis whitespace-nowrap';

                              return (
                                <td
                                  key={cell.id}
                                  className={`${paddingClass} py-2 h-14 align-middle ${textOverflowClass} text-sm relative ${isContacto ? 'border-r border-border/30' : ''} ${isRestante ? 'border-r border-border/30' : ''} ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}
                                  style={{ width: `${columnState?.size || 100}px` }}
                                >
                                  {/* Usar flexRender con el contexto real de la celda */}
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              );
                            })}
                          </tr>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onSelect={() => setEditingRow(order.id)}>Editar pedido</ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem className="text-red-500" onSelect={() => handleDelete(order.id)}>Eliminar pedido</ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    );
                  }

                  // --- FILA DE MÚLTIPLES ITEMS (Renderizado correcto) ---
                  return (
                    <React.Fragment key={row.id}>
                      {/* Fila resumen */}
                      <tr
                        onClick={() => toggleRow(order.id)}
                        className={`border-b hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-200 ease-out cursor-pointer group ${isExpandedState ? 'summary-row-expanded' : ''} ${isCollapsing(order.id) ? 'summary-row-collapsing' : ''} ${isExpanding(order.id) ? 'summary-row-expanding' : ''}`}>
                        {row.getVisibleCells().map((cell) => {
                          const columnState = columns.find(col => col.id === cell.column.id);
                          const align = (cell.column.columnDef.meta as any)?.align || 'left';
                          const isContacto = cell.column.id === 'contacto';
                          const isRestante = cell.column.id === 'restante';
                          const isStateColumn = ['fabricacion', 'venta', 'envioEstado'].includes(cell.column.id);
                          const isTextColumn = ['cliente', 'contacto'].includes(cell.column.id);
                          const isDisenioColumn = cell.column.id === 'disenio';
                          const paddingClass = isStateColumn ? 'px-0' : 'px-2';
                          const textOverflowClass = isTextColumn ? 'overflow-hidden' : isDisenioColumn ? 'overflow-hidden' : 'overflow-hidden text-ellipsis whitespace-nowrap';

                          return (
                            <td
                              key={cell.id}
                              className={`${paddingClass} py-3 h-12 align-middle ${textOverflowClass} text-sm relative ${isContacto ? 'border-r border-border/30' : ''} ${isRestante ? 'border-r border-border/30' : ''} ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}
                              style={{ width: `${columnState?.size || 100}px` }}
                            >
                              {/* Usar flexRender con el contexto real de la celda */}
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Filas expandidas (items individuales) */}
                      {isExpandedState && order.items.map((item, index) => (
                        <ContextMenu key={`${order.id}-${item.id}`}>
                          <ContextMenuTrigger asChild>
                            <tr
                              data-row
                              onDoubleClick={() => handleRowDoubleClick(order.id)}
                              className={`hover:bg-muted/30 transition-all duration-300 ease-in-out bg-gradient-to-r from-muted/10 to-muted/5 shadow-sm animate-in slide-in-from-top-2 fade-in relative ${editingRowId === order.id ? 'ring-1 ring-primary/40' : ''} ${isCollapsing(order.id) ? 'expandable-item-exit' : 'expandable-item-enter'}`}
                              style={{
                                animationDelay: `${index * 100}ms`,
                                marginBottom: index < order.items.length - 1 ? '2px' : '0px',
                                borderLeft: '2px solid #d1d5db',
                              }}
                            >
                              {/* Iterar sobre las columnas de SUBITEM */}
                              {sortedSubitemColumns.map((column) => {
                                if (!column.id) return null;

                                const columnsToHideInExpandedView = ['fecha', 'cliente', 'contacto', 'envio', 'envioEstado', 'seguimiento'];
                                const shouldHideColumn = columnsToHideInExpandedView.includes(column.id);
                                const columnState = columns.find(col => col.id === column.id);
                                const align = (column.meta as any)?.align || 'left';
                                const isContacto = column.id === 'contacto';
                                const isRestante = column.id === 'restante';
                                const isStateColumn = ['fabricacion', 'venta', 'envioEstado'].includes(column.id);
                                const isTextColumn = ['cliente', 'contacto'].includes(column.id);
                                const isDisenioColumn = column.id === 'disenio';
                                const paddingClass = isStateColumn ? 'px-0' : 'px-2';
                                const textOverflowClass = isTextColumn ? 'overflow-hidden' : isDisenioColumn ? 'overflow-hidden' : 'overflow-hidden text-ellipsis whitespace-nowrap';

                                // Crear un CONTEXTO FALSO (pero más completo) para las celdas de sub-item
                                const mockContext: CellContext<Order, any> = { // <--- CAMBIO AQUÍ
                                  row: {
                                    original: { ...order, items: [item] }, // El "Order" falso solo tiene este item
                                    id: `${order.id}-${item.id}`,
                                  } as any,
                                  // Añadir las funciones que faltaban (aunque sean 'any')
                                  column: column as any,
                                  getValue: () => item as any, // <--- CAMBIO AQUÍ
                                  renderValue: () => item as any, // <--- CAMBIO AQUÍ
                                  table: table as any,
                                  cell: { id: `${order.id}-${item.id}-${column.id}` } as any
                                };

                                return (
                                  <td
                                    key={`${order.id}-${item.id}-${column.id}`}
                                    className={`${paddingClass} py-2 h-14 align-middle ${textOverflowClass} text-sm relative ${isContacto ? 'border-r border-border/30' : ''} ${isRestante ? 'border-r border-border/30' : ''} ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}
                                    style={{ width: `${columnState?.size || 100}px` }}
                                  >
                                    {shouldHideColumn ? (
                                      <span className="text-muted-foreground/60 text-xs">—</span>
                                    ) : (
                                      // Usar flexRender con el contexto FALSO (pero más completo)
                                      flexRender(column.cell as any, mockContext) // <--- CAMBIO AQUÍ
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem onSelect={() => setEditingRow(order.id)}>Editar item (WIP)</ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem className="text-red-500" onSelect={() => handleDelete(order.id)}>Eliminar item (WIP)</ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">No se encontraron pedidos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DndTableContainer>
    </div>
  );
}
// --- FIN DE CORRECCIÓN ---
