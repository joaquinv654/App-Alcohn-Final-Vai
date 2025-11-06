import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatDate, isDeadlineNear, getDaysUntilDeadline } from '@/lib/utils/format';
import { Order } from '@/lib/types/index';
import { DatePicker } from '@/components/ui/date-picker';

interface CellFechaProps {
  order: Order;
  onDateChange?: (orderId: string, newDate: Date) => void;
  editingRowId?: string | null;
}

export function CellFecha({ order, onDateChange }: CellFechaProps) {
  // 'order.orderDate' es un 'string' ISO.
  // Lo convertimos a un objeto 'Date' para el DatePicker.
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(order.orderDate) // <-- CORRECCIÓN: Convertir string a Date
  );

  // Sincronizamos el estado si la prop de la orden cambia
  // (ej. si la tabla se refresca)
  useEffect(() => {
    setSelectedDate(new Date(order.orderDate));
  }, [order.orderDate]);

  const isNearDeadline = isDeadlineNear(order.deadlineAt);
  const daysUntilDeadline = getDaysUntilDeadline(order.deadlineAt);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Usamos el ID de la orden principal para el cambio de fecha
      onDateChange?.(order.id, date);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DatePicker
        date={selectedDate} // <-- 'selectedDate' ahora SÍ es un objeto Date
        onDateChange={handleDateChange}
        placeholder={formatDate(order.orderDate)} // <-- 'formatDate' SÍ recibe el string original
        className="h-6 text-xs text-gray-400 border-none bg-transparent hover:bg-gray-200/10 rounded px-2 py-1"
      />
      {isNearDeadline && (
        <div className="flex items-center gap-1 text-amber-600" title={`Vence en ${daysUntilDeadline} días`}>
          <AlertTriangle className="h-3 w-3" />
          <span className="text-xs font-medium">
            {daysUntilDeadline}d
          </span>
        </div>
      )}
    </div>
  );
}
