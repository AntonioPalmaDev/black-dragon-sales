import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";

const formSchema = z.object({
  client_id: z.string().min(1, "Cliente é obrigatório"),
  payment_method: z.string(),
  status: z.string(),
  discount: z.coerce.number().min(0),
  items: z.array(z.object({
    product_id: z.string().min(1, "Produto é obrigatório"),
    quantity: z.coerce.number().min(1, "Mínimo 1"),
    unit_price: z.coerce.number().min(0),
  })).min(1, "Adicione pelo menos um item"),
});

type SaleFormValues = z.infer<typeof formSchema>;

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSale?: any;
}

export function SaleModal({ isOpen, onClose, editingSale }: SaleModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: clients } = useQuery({
    queryKey: ["clients-active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("id, name").eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products-active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name, sale_price, stock_current").eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: "",
      payment_method: "dinheiro",
      status: "concluido",
      discount: 0,
      items: [{ product_id: "", quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (editingSale) {
      form.reset({
        client_id: editingSale.client_id || "",
        payment_method: editingSale.payment_method || "dinheiro",
        status: editingSale.status || "concluido",
        discount: Number(editingSale.discount) || 0,
      });

      // Load items
      const fetchItems = async () => {
        const { data, error } = await supabase
          .from("sale_items")
          .select("product_id, quantity, unit_price")
          .eq("sale_id", editingSale.id);
        
        if (!error && data) {
          replace(data.map(item => ({
            product_id: item.product_id,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price)
          })));
        }
      };
      fetchItems();
    } else {
      form.reset({
        client_id: "",
        payment_method: "dinheiro",
        status: "concluido",
        discount: 0,
        items: [{ product_id: "", quantity: 1, unit_price: 0 }],
      });
    }
  }, [editingSale, isOpen, form, replace]);

  const watchedItems = form.watch("items");
  const watchedDiscount = form.watch("discount");

  const subtotal = watchedItems?.reduce((acc, item) => acc + (Number(item?.quantity || 0) * Number(item?.unit_price || 0)), 0) || 0;
  const total = Math.max(0, subtotal - Number(watchedDiscount));

  const handleProductChange = (index: number, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.unit_price`, Number(product.sale_price) || 0);
    }
  };

  const onSubmit = async (values: SaleFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let saleId = editingSale?.id;

      if (editingSale) {
        const { error: saleError } = await supabase
          .from("sales")
          .update({
            client_id: values.client_id,
            payment_method: values.payment_method as any,
            status: values.status as any,
            subtotal,
            discount: values.discount,
            total_amount: total,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingSale.id);

        if (saleError) throw saleError;

        // Delete existing items to re-insert
        const { error: deleteError } = await supabase
          .from("sale_items")
          .delete()
          .eq("sale_id", editingSale.id);
        
        if (deleteError) throw deleteError;
      } else {
        const { data: sale, error: saleError } = await supabase
          .from("sales")
          .insert([{
            client_id: values.client_id,
            seller_id: user.id,
            payment_method: values.payment_method as any,
            status: values.status as any,
            subtotal,
            discount: values.discount,
            total_amount: total,
          }])
          .select()
          .single();

        if (saleError) throw saleError;
        saleId = sale.id;
      }

      const saleItems = values.items.map(item => ({
        sale_id: saleId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_item: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItems);
      if (itemsError) throw itemsError;

      toast.success(editingSale ? "Operação atualizada!" : "Operação registrada!");
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Erro ao processar operação.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] text-white sm:max-w-[800px] max-h-[90vh] p-0 overflow-hidden rounded-2xl flex flex-col">
        <div className="bg-[#111111] p-6 border-b border-[#1F1F1F]">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold tracking-tight">NOVA OPERAÇÃO DE VENDA</DialogTitle>
          </DialogHeader>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="client_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#0A0A0A] border-[#1F1F1F]">
                        <SelectValue placeholder="Selecione o cliente..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#111111] border-[#1F1F1F] text-white">
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="payment_method" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#0A0A0A] border-[#1F1F1F]">
                          <SelectValue placeholder="Meio..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#111111] border-[#1F1F1F] text-white uppercase">
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="credito">Crédito</SelectItem>
                        <SelectItem value="debito">Débito</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="transferencia">Transf.</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#0A0A0A] border-[#1F1F1F]">
                          <SelectValue placeholder="Status..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#111111] border-[#1F1F1F] text-white uppercase">
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#475569]">Itens da Venda</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ product_id: "", quantity: 1, unit_price: 0 })} className="border-[#1F1F1F] hover:bg-white/5 text-xs">
                  <Plus className="mr-1 h-3 w-3" /> ADICIONAR ITEM
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-3 items-end bg-[#0A0A0A] p-3 rounded-lg border border-[#1F1F1F]">
                  <div className="col-span-12 md:col-span-5">
                    <FormField control={form.control} name={`items.${index}.product_id`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase">Produto</FormLabel>
                        <Select onValueChange={(val) => { field.onChange(val); handleProductChange(index, val); }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-transparent border-[#1F1F1F]">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#111111] border-[#1F1F1F] text-white">
                            {products?.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name} ({p.stock_current} un)</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase">Qtd</FormLabel>
                        <FormControl><Input type="number" {...field} className="bg-transparent border-[#1F1F1F]" /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <div className="col-span-5 md:col-span-3">
                    <FormField control={form.control} name={`items.${index}.unit_price`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase">Preço Unit.</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} className="bg-transparent border-[#1F1F1F]" /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <div className="col-span-3 md:col-span-2 flex justify-end">
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10 h-10 w-10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0A0A0A] p-6 rounded-xl border border-[#1F1F1F] space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#475569]">SUBTOTAL</span>
                <span className="text-white font-mono">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#475569]">DESCONTO (R$)</span>
                <div className="w-24">
                  <FormField control={form.control} name="discount" render={({ field }) => (
                    <FormControl><Input type="number" step="0.01" {...field} className="bg-transparent border-[#1F1F1F] text-right font-mono h-8" /></FormControl>
                  )} />
                </div>
              </div>
              <div className="pt-3 border-t border-[#1F1F1F] flex justify-between items-center">
                <span className="text-white font-black uppercase">TOTAL GERAL</span>
                <span className="text-2xl font-black text-[#FF1F3D] font-mono">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-black w-full h-12 uppercase">
                {isSubmitting ? "PROCESSANDO..." : "FINALIZAR OPERAÇÃO"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
