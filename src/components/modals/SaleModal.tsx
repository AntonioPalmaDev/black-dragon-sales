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
            product_id: item.product_id || "",
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
  const total = Math.max(0, subtotal - Number(watchedDiscount || 0));

  const handleProductChange = (index: number, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.unit_price`, Number(product.sale_price) || 0);
    }
  };

  const onSubmit = async (values: SaleFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting sale with values:", values);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Use user ID if available, otherwise it will be null (which is allowed by DB schema)
      const sellerId = user?.id;

      let saleId = editingSale?.id;

      const saleData = {
        client_id: values.client_id,
        seller_id: sellerId,
        payment_method: values.payment_method as any,
        status: values.status as any,
        subtotal,
        discount: values.discount,
        total_amount: total,
        updated_at: new Date().toISOString(),
      };

      if (editingSale) {
        console.log("Updating existing sale:", editingSale.id);
        const { error: saleError } = await supabase
          .from("sales")
          .update(saleData)
          .eq("id", editingSale.id);

        if (saleError) throw saleError;

        // Delete existing items to re-insert
        const { error: deleteError } = await supabase
          .from("sale_items")
          .delete()
          .eq("sale_id", editingSale.id);
        
        if (deleteError) throw deleteError;
      } else {
        console.log("Inserting new sale");
        const { data: sale, error: saleError } = await supabase
          .from("sales")
          .insert([saleData])
          .select()
          .single();

        if (saleError) throw saleError;
        if (!sale) throw new Error("Falha ao criar registro de venda");
        saleId = sale.id;
      }

      console.log("Inserting sale items for saleId:", saleId);
      const saleItems = values.items.map(item => ({
        sale_id: saleId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_item: Number(item.quantity) * Number(item.unit_price),
      }));

      const { error: itemsError } = await supabase.from("sale_items").insert(saleItems);
      if (itemsError) throw itemsError;

      toast.success(editingSale ? "Operação atualizada com sucesso!" : "Operação registrada com sucesso!");
      
      // Invalidate queries to refresh lists
      await queryClient.invalidateQueries({ queryKey: ["sales"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      
      onClose();
      form.reset();
    } catch (error: any) {
      console.error("Sale submission error:", error);
      toast.error(`Erro ao processar operação: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] text-white sm:max-w-[800px] max-h-[95vh] p-0 overflow-hidden rounded-2xl flex flex-col">
        <div className="bg-[#111111] p-6 border-b border-[#1F1F1F]">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-black tracking-tighter uppercase">
              {editingSale ? "EDITAR OPERAÇÃO" : "NOVA OPERAÇÃO DE VENDA"}
            </DialogTitle>
          </DialogHeader>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="client_id" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Cliente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#111111] border-[#1F1F1F] h-12 rounded-xl focus:border-[#FF1F3D] transition-all">
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
                    <FormLabel className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#111111] border-[#1F1F1F] h-12 rounded-xl focus:border-[#FF1F3D] transition-all">
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
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#111111] border-[#1F1F1F] h-12 rounded-xl focus:border-[#FF1F3D] transition-all">
                          <SelectValue placeholder="Status..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#111111] border-[#1F1F1F] text-white uppercase font-bold">
                        <SelectItem value="concluido" className="text-green-500">Concluído</SelectItem>
                        <SelectItem value="pendente" className="text-yellow-500">Pendente</SelectItem>
                        <SelectItem value="cancelado" className="text-red-500">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#FF1F3D]">Produtos Selecionados</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ product_id: "", quantity: 1, unit_price: 0 })} 
                  className="border-[#FF1F3D]/20 hover:bg-[#FF1F3D] hover:text-white text-[10px] font-bold h-8 transition-all"
                >
                  <Plus className="mr-1 h-3 w-3" /> ADICIONAR PRODUTO
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-3 items-end bg-[#111111] p-4 rounded-xl border border-[#1F1F1F] group hover:border-[#FF1F3D]/30 transition-all">
                    <div className="col-span-12 md:col-span-5">
                      <FormField control={form.control} name={`items.${index}.product_id`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Produto</FormLabel>
                          <Select onValueChange={(val) => { field.onChange(val); handleProductChange(index, val); }} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-[#0A0A0A] border-[#1F1F1F] h-11 rounded-lg">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#111111] border-[#1F1F1F] text-white">
                              {products?.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name} (R$ {Number(p.sale_price).toFixed(2)})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Qtd</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              className="bg-[#0A0A0A] border-[#1F1F1F] h-11 rounded-lg focus:border-[#FF1F3D]" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="col-span-5 md:col-span-3">
                      <FormField control={form.control} name={`items.${index}.unit_price`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Preço Unit.</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-bold">R$</span>
                              <Input 
                                type="number" 
                                step="0.01" 
                                {...field} 
                                className="bg-[#0A0A0A] border-[#1F1F1F] h-11 pl-8 rounded-lg focus:border-[#FF1F3D]" 
                              />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                    </div>
                    <div className="col-span-3 md:col-span-2 flex justify-end">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => remove(index)} 
                        className="text-zinc-600 hover:text-[#FF1F3D] hover:bg-[#FF1F3D]/10 h-11 w-11 transition-all"
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111111] p-6 rounded-2xl border border-[#1F1F1F] space-y-4 shadow-xl">
              <div className="flex justify-between items-center text-xs tracking-widest font-bold">
                <span className="text-zinc-500 uppercase">SUBTOTAL</span>
                <span className="text-white font-mono text-sm">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs tracking-widest font-bold">
                <span className="text-zinc-500 uppercase">DESCONTO</span>
                <div className="w-32 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">R$</span>
                  <FormField control={form.control} name="discount" render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field} 
                          className="bg-[#0A0A0A] border-[#1F1F1F] text-right font-mono h-9 rounded-lg pl-8 focus:border-[#FF1F3D]" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
              <div className="pt-4 border-t border-[#1F1F1F] flex justify-between items-center">
                <span className="text-white text-sm font-black uppercase tracking-[0.2em]">VALOR TOTAL</span>
                <span className="text-3xl font-black text-[#FF1F3D] font-mono tracking-tighter">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-black w-full h-14 uppercase tracking-widest rounded-xl shadow-xl shadow-[#FF1F3D]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSubmitting ? "PROCESSANDO..." : editingSale ? "ATUALIZAR OPERAÇÃO" : "FINALIZAR OPERAÇÃO"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
