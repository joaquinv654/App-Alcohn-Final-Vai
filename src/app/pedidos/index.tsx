import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/pedidos/Sidebar/Sidebar';
import { OrdersHeader } from '@/components/pedidos/Header/OrdersHeader';
import { OrdersTable } from '@/components/pedidos/Table/OrdersTable';
import { FiltersDialog } from '@/components/pedidos/Filters/FiltersDialog';
import { SorterDialog } from '@/components/pedidos/Sorter/SorterDialog';
import { NewOrderDialog } from '@/components/pedidos/NewOrder/NewOrderDialog';
import { Toaster } from '@/components/ui/toaster';
import { FabricationState, Order, SaleState, ShippingState, StampType, ShippingCarrier } from '@/lib/types/index';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useSound } from '@/lib/hooks/useSound';

export default function PedidosPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [showSorter, setShowSorter] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [activeStates, setActiveStates] = useState<FabricationState[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const { playSound } = useSound();

  // --- LÓGICA DE CARGA DE DATOS ---

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('orders_with_totals') // Usamos nuestra VISTA
      .select(`
        *, 
        customer:customers(*),
        items:order_items(*),
        tasks:tasks(*)
      `)
      .order('order_date', { ascending: false }); 

    if (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
    } else if (data) {
      
      const fetchedOrders: Order[] = data.map((o: any) => {
        
        const mappedItems = (o.items || []).map((item: any) => ({
          ...item,
          // Mapear campos de BBDD (snake_case) a tipos de TS (camelCase)
          fabricationState: item.fabrication_state,
          saleState: item.sale_state,
          shippingState: item.shipping_state,
          stampType: item.stamp_type,
          itemValue: item.item_value,
          depositValueItem: item.deposit_value_item,
          requestedWidthMm: item.requested_width_mm,
          requestedHeightMm: item.requested_height_mm,
          isPriority: item.is_priority,
          
          contact: {
            channel: item.contact_channel,
            phoneE164: item.contact_phone_e164,
          },
          files: {
            baseUrl: item.file_base_url,
            vectorUrl: item.file_vector_url,
            photoUrl: item.file_photo_url,
          }
        }));

        const mappedShipping = {
          carrier: o.shipping_carrier,
          service: o.shipping_service,
          trackingNumber: o.tracking_number,
          origin: null, 
        };
        
        return {
          ...o,
          orderDate: o.order_date,
          deadlineAt: o.deadline_at,
          shipping: mappedShipping, 
          totalValue: o.total_value,
          paidAmountCached: o.total_deposit,
          balanceAmountCached: o.total_balance,
          customer: o.customer,
          tasks: o.tasks || [],
          items: mappedItems, 
        };
      });

      setOrders(fetchedOrders);
    }
    setLoading(false);
  }, []); 

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); 

  // --- LÓGICA DE ACTUALIZACIÓN DE DATOS ---

  const handleStateFilter = (state: FabricationState) => {
    setActiveStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  // Función para actualizar el estado de FABRICACIÓN en Supabase
  const handleFabricacionChange = async (itemId: string, newState: FabricationState) => {
    const { error } = await supabase
      .from('order_items')
      .update({ fabrication_state: newState })
      .eq('id', itemId);

    if (error) {
      toast({ title: "Error al actualizar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Fabricación actualizada", description: `Estado cambiado a ${newState}` });
      if (newState === 'HECHO') playSound('complete');
      
      setOrders(prevOrders => 
        prevOrders.map(o => ({
          ...o,
          items: o.items.map(i => i.id === itemId ? { ...i, fabricationState: newState } : i)
        }))
      );
    }
  };

  // Función para actualizar el estado de VENTA en Supabase
  const handleVentaChange = async (itemId: string, newState: SaleState) => {
    const { error } = await supabase
      .from('order_items')
      .update({ sale_state: newState })
      .eq('id', itemId);

    if (error) {
      toast({ title: "Error al actualizar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Venta actualizada", description: `Estado cambiado a ${newState}` });
      if (newState === 'TRANSFERIDO') playSound('success');
      setOrders(prevOrders => 
        prevOrders.map(o => ({
          ...o,
          items: o.items.map(i => i.id === itemId ? { ...i, saleState: newState } : i)
        }))
      );
    }
  };
  
  // Función para actualizar el estado de ENVÍO en Supabase
  const handleEnvioEstadoChange = async (itemId: string, newState: ShippingState) => {
    const { error } = await supabase
      .from('order_items')
      .update({ shipping_state: newState })
      .eq('id', itemId);

    if (error) {
      toast({ title: "Error al actualizar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Envío actualizado", description: `Estado cambiado a ${newState}` });
      if (newState === 'DESPACHADO') playSound('notification');
      setOrders(prevOrders => 
        prevOrders.map(o => ({
          ...o,
          items: o.items.map(i => i.id === itemId ? { ...i, shippingState: newState } : i)
        }))
      );
    }
  };
  
  // Función para actualizar el TIPO de sello en Supabase
  const handleTipoChange = async (itemId: string, newTipo: StampType) => {
     const { error } = await supabase
      .from('order_items')
      .update({ stamp_type: newTipo })
      .eq('id', itemId);
      
    if (error) {
      toast({ title: "Error al actualizar tipo", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tipo actualizado", description: `Cambiado a ${newTipo}` });
      setOrders(prevOrders => 
        prevOrders.map(o => ({
          ...o,
          items: o.items.map(i => i.id === itemId ? { ...i, stampType: newTipo } : i)
        }))
      );
    }
  };

  // Función para actualizar el TRANSPORTISTA en Supabase
  const handleEnvioChange = async (orderId: string, newCarrier: ShippingCarrier) => {
     const { error } = await supabase
      .from('orders')
      .update({ shipping_carrier: newCarrier })
      .eq('id', orderId);
      
    if (error) {
      toast({ title: "Error al actualizar envío", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Transportista actualizado", description: `Cambiado a ${newCarrier}` });
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? { ...o, shipping: { ...o.shipping, carrier: newCarrier } } : o)
      );
    }
  };

  // (Añadiremos estas funciones de Tareas y Edición más adelante)
  const handleTaskCreate = (itemId: string, title: string) => toast({ title: 'TBD: Tarea creada', description: `${title} para item ${itemId}`});
  const handleTaskUpdate = (taskId: string, updates: any) => toast({ title: 'TBD: Tarea actualizada', description: `${taskId}`});
  const handleTaskDelete = (taskId: string) => toast({ title: 'TBD: Tarea eliminada', description: `${taskId}`});
  const handleDateChange = (orderId: string, newDate: Date) => toast({ title: 'TBD: Fecha actualizada', description: `${newDate.toLocaleDateString()}`});
  const handleDeadlineChange = (orderId: string, deadline: Date | null) => toast({ title: 'TBD: Deadline actualizada' });
  const handleUpdate = (orderId: string, patch: any) => toast({ title: 'TBD: Pedido actualizado' });


  // --- RENDERIZADO DEL COMPONENTE ---

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-20">
        <div className="border-b bg-background p-6">
          <OrdersHeader
            onNewOrder={() => setShowNewOrder(true)}
            onFilters={() => setShowFilters(true)}
            onSort={() => setShowSorter(true)}
            onStateFilter={handleStateFilter}
            activeStates={activeStates}
          />
        </div>

        <div className="flex-1 p-6 overflow-hidden">
          {loading && <p className="text-center text-muted-foreground">Cargando pedidos...</p>}
          {error && <p className="text-center text-destructive">Error: {error}</p>}
          {!loading && !error && (
            <OrdersTable 
              orders={orders} 
              onFabricacionChange={handleFabricacionChange}
              onVentaChange={handleVentaChange}
              onEnvioEstadoChange={handleEnvioEstadoChange}
              onTipoChange={handleTipoChange}
              onEnvioChange={handleEnvioChange}
              onTaskCreate={handleTaskCreate}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onDateChange={handleDateChange}
              onDeadlineChange={handleDeadlineChange}
              onUpdate={handleUpdate}
            />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <FiltersDialog
        open={showFilters}
        onOpenChange={setShowFilters}
      />
      
      <SorterDialog
        open={showSorter}
        onOpenChange={setShowSorter}
      />
      
      <NewOrderDialog
        open={showNewOrder}
        onOpenChange={setShowNewOrder}
        onOrderCreated={fetchOrders} 
      />

      <Toaster />
    </div>
  );
}