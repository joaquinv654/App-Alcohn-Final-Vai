import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NewOrderStepForm } from './NewOrderStepForm';
import { NewOrderFormData } from '@/lib/types/index';
import { useToast } from '@/components/ui/use-toast';
import { useSound } from '@/lib/hooks/useSound';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { useAuth } from '@/lib/auth/AuthContext';
import { v4 as uuidv4 } from 'uuid'; // 1. Importar UUID

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

// 2. Definir el nombre de tu bucket de Supabase Storage
const STORAGE_BUCKET = 'order_files';

export function NewOrderDialog({ open, onOpenChange, onOrderCreated }: NewOrderDialogProps) {
  const { toast } = useToast();
  const { playSound } = useSound();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<NewOrderFormData>>({});
  const { user } = useAuth();

  // 3. Función helper para subir archivos
  const uploadFileToStorage = async (file: File, userId: string) => {
    try {
      // Generamos un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `public/${userId}/${fileName}`; // Carpeta pública, sub-carpeta por usuario

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 4. Obtener la URL pública del archivo
      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      return null;
    }
  };

  const handleStepSubmit = (stepData: any, step: number) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    
    if (step === 1) {
      setCurrentStep(2);
    } else if (step === 2 || step === 3) {
      handleFinalSubmit({ ...formData, ...stepData });
    }
  };

  const handleFinalSubmit = async (data: NewOrderFormData) => {
    if (!user) {
      toast({ title: "Error", description: "No estás autenticado.", variant: "destructive" });
      return;
    }
    
    try {
      // --- 5. INICIO DE SUBIDA DE ARCHIVOS ---
      let file_base_url: string | null = null;
      let file_vector_url: string | null = null;

      // El formulario solo parece subir 'base' y 'vector' en la creación
      if (data.files?.base) {
        toast({ title: "Subiendo archivo base...", description: data.files.base.name });
        file_base_url = await uploadFileToStorage(data.files.base, user.id);
        if (!file_base_url) throw new Error("No se pudo subir el archivo base.");
      }

      if (data.files?.vector) {
        toast({ title: "Subiendo archivo vector...", description: data.files.vector.name });
        file_vector_url = await uploadFileToStorage(data.files.vector, user.id);
        if (!file_vector_url) throw new Error("No se pudo subir el archivo vector.");
      }
      // --- FIN DE SUBIDA DE ARCHIVOS ---


      // --- INICIO DE LA TRANSACCIÓN DE BASE DE DATOS ---

      // Paso A: Buscar o crear el Cliente
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .upsert({
          phone_e164: data.customer.phoneE164, 
          first_name: data.customer.firstName,
          last_name: data.customer.lastName,
          email: data.customer.email,
        })
        .select('id') 
        .single();

      if (customerError) throw customerError;
      const customerId = customerData.id;

      // Paso B: Crear la Orden
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          deadline_at: data.states.deadline ? data.states.deadline.toISOString() : null,
          shipping_carrier: data.shipping.carrier,
          shipping_service: data.shipping.service,
          taken_by_user_id: user.id,
        })
        .select('id') 
        .single();

      if (orderError) throw orderError;
      const orderId = orderData.id;

      // Paso C: Crear el Item de Orden (El Sello)
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderId,
          design_name: data.order.designName,
          requested_width_mm: data.order.requestedWidthMm,
          requested_height_mm: data.order.requestedHeightMm,
          stamp_type: data.order.stampType,
          notes: data.order.notes,
          is_priority: data.states.isPriority,
          
          item_value: data.values.totalValue,
          deposit_value_item: data.values.depositValue,
          
          fabrication_state: data.states.fabrication,
          sale_state: data.states.sale,
          shipping_state: data.states.shipping,
          
          contact_channel: data.customer.channel,
          contact_phone_e164: data.customer.phoneE164,
          
          // 6. Guardar las URLs de los archivos
          file_base_url: file_base_url,
          file_vector_url: file_vector_url,
        });

      if (itemError) throw itemError;

      // --- FIN DE LA TRANSACCIÓN ---

      playSound('success');
      toast({
        title: "¡Pedido creado!",
        description: `Se ha creado el pedido para ${data.customer?.firstName} ${data.customer?.lastName}`,
      });
      
      onOrderCreated(); 
      
      setCurrentStep(1);
      setFormData({});
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error al crear el pedido:', error);
      toast({
        title: "Error al crear el pedido",
        description: error.message || "No se pudo guardar en la base de datos.",
        variant: "destructive",
      });
    }
  };


  const handleCancel = () => {
    setCurrentStep(1);
    setFormData({});
    onOpenChange(false);
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  };

  const handleAddDesign = () => {
    setCurrentStep(3);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-8">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl">
            Nuevo Pedido - Paso {currentStep} de 3
          </DialogTitle>
        </DialogHeader>
        <NewOrderStepForm 
          currentStep={currentStep}
          onStepSubmit={handleStepSubmit}
          onCancel={handleCancel}
          onBack={handleBack}
          onAddDesign={handleAddDesign}
          initialData={formData}
        />
      </DialogContent>
    </Dialog>
  );
}