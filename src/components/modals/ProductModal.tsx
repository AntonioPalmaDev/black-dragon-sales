import { useForm } from "react-hook-form";
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

const formSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  sku: z.string().optional(),
  category_id: z.string().optional(),
  cost_price: z.coerce.number().min(0),
  sale_price: z.coerce.number().min(0),
  stock_current: z.coerce.number().int().min(0),
  stock_min: z.coerce.number().int().min(0),
  unit_measure: z.string().default("UN"),
});

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ isOpen, onClose }: ProductModalProps) {
  const queryClient = useQueryClient();
  
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sku: "",
      category_id: undefined,
      cost_price: 0,
      sale_price: 0,
      stock_current: 0,
      stock_min: 0,
      unit_measure: "UN",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase.from("products").insert([values]);
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
      <DialogContent className="bg-[#111111] border-[#1F1F1F] text-white sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-white text-xl uppercase font-black">NOVO PRODUTO</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl><Input {...field} className="bg-[#0A0A0A] border-[#1F1F1F]" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sku" render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl><Input {...field} className="bg-[#0A0A0A] border-[#1F1F1F]" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="category_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#0A0A0A] border-[#1F1F1F]">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#111111] border-[#1F1F1F] text-white">
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="cost_price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço de Custo</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} className="bg-[#0A0A0A] border-[#1F1F1F]" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="sale_price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço de Venda</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} className="bg-[#0A0A0A] border-[#1F1F1F]" /></FormControl>
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="stock_current" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estoque Atual</FormLabel>
                  <FormControl><Input type="number" {...field} className="bg-[#0A0A0A] border-[#1F1F1F]" /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="stock_min" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estoque Mínimo</FormLabel>
                  <FormControl><Input type="number" {...field} className="bg-[#0A0A0A] border-[#1F1F1F]" /></FormControl>
                </FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#FF1F3D] hover:bg-[#D91B34] text-white">SALVAR</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
