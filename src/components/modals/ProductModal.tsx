import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  sale_price: z.coerce.number().min(0, "O valor deve ser maior ou igual a zero"),
  is_active: z.boolean(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ isOpen, onClose }: ProductModalProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sale_price: 0,
      is_active: true,
    },
  });

  const onSubmit = async (values: ProductFormValues) => {
    try {
      const { error } = await supabase.from("products").insert([{
        ...values,
        unit_measure: "UN", // Defaulting as it might be required in DB or UI logic elsewhere
        stock_current: 0,
        stock_min: 0,
      }]);
      
      if (error) throw error;
      
      toast.success("Produto cadastrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Erro ao cadastrar produto.");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] text-white sm:max-w-[400px] p-0 overflow-hidden rounded-2xl">
        <div className="bg-[#111111] p-6 border-b border-[#1F1F1F]">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold tracking-tight text-center uppercase">Adicionar Novo Produto</DialogTitle>
          </DialogHeader>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            <FormField control={form.control} name="is_active" render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Status do Produto</FormLabel>
                <FormControl>
                  <div className="flex p-1 bg-[#1A1A1A] rounded-lg border border-[#1F1F1F]">
                    <button
                      type="button"
                      onClick={() => field.onChange(true)}
                      className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                        field.value === true 
                        ? "bg-[#FF1F3D] text-white shadow-lg" 
                        : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      ATIVO
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange(false)}
                      className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                        field.value === false 
                        ? "bg-[#FF1F3D] text-white shadow-lg" 
                        : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      INATIVO
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Nome do Produto</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Ex: Camiseta Black Dragons"
                    className="bg-[#111111] border-[#1F1F1F] h-12 focus:border-[#FF1F3D] focus:ring-[#FF1F3D] transition-all rounded-xl" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="sale_price" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Valor Unitário</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">R$</span>
                    <Input 
                      type="number"
                      step="0.01"
                      {...field} 
                      className="bg-[#111111] border-[#1F1F1F] h-12 pl-12 focus:border-[#FF1F3D] focus:ring-[#FF1F3D] transition-all rounded-xl" 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-black uppercase tracking-widest rounded-xl shadow-xl shadow-[#FF1F3D]/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                CADASTRAR PRODUTO
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}