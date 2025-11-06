import { Search, Filter, ArrowUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { StateChips } from './StateChips'; // StateChips no se usa aquí
import { useOrdersStore } from '@/lib/state/orders.store';
// import { mockOrders, getFabricationCounts } from '@/lib/mocks/orders.mock'; // <-- Eliminado
import { FabricationState, Order } from '@/lib/types/index'; // <-- Importar Order
import { useMemo } from 'react'; // <-- Importar useMemo

interface OrdersHeaderProps {
  orders: Order[]; // <-- 1. Aceptar pedidos reales como prop
  onNewOrder: () => void;
  onFilters: () => void;
  onSort: () => void;
  onStateFilter: (state: FabricationState) => void;
  activeStates: FabricationState[];
}

// 2. Mover la lógica de conteo aquí, usando las props
const getFabricationCounts = (orders: Order[]) => {
  const counts: Record<FabricationState, number> = {
    'SIN_HACER': 0,
    'HACIENDO': 0,
    'VERIFICAR': 0,
    'HECHO': 0,
    'REHACER': 0,
    'RETOCAR': 0
  };

  orders.forEach(order => {
    order.items.forEach(item => {
      // Asegurarse de que el estado es válido antes de incrementar
      if (item.fabricationState in counts) {
        counts[item.fabricationState]++;
      }
    });
  });

  return counts;
};


export function OrdersHeader({ 
  orders, // <-- 3. Usar la prop
  onNewOrder, 
  onFilters, 
  onSort, 
  onStateFilter,
  activeStates 
}: OrdersHeaderProps) {
  const { searchQuery, setSearchQuery } = useOrdersStore();
  
  // 4. Calcular contadores usando los pedidos reales
  const activeOrdersCount = orders.length;
  const fabricationCounts = useMemo(() => getFabricationCounts(orders), [orders]);

  return (
    <div className="space-y-4">
      {/* Título y búsqueda */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">
            Pedidos
          </h1>
          <p className="text-xs text-gray-400">
            {/* 5. Usar los contadores reales */}
            Total: {activeOrdersCount} • Sin hacer: {fabricationCounts['SIN_HACER']} • Hecho: {fabricationCounts['HECHO']}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedidos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Ordenar */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSort}
            className="gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            Ordenar
          </Button>

          {/* Filtros */}
          <Button
            variant="outline"
            size="sm"
            onClick={onFilters}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>

          {/* Nuevo Pedido */}
          <Button
            onClick={onNewOrder}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        </div>
      </div>

    </div>
  );
}