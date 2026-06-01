import { useState, useEffect } from "react";
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
  type: z.enum(["PF", "PJ"]),
});

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingClient?: any;
}

export function ClientModal({ isOpen, onClose, editingClient }: ClientModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "PF",
    },
  });

  useEffect(() => {
    if (editingClient) {
      form.reset({
        name: editingClient.name || "",
        type: (editingClient.type as "PF" | "PJ") || "PF",
      });
    } else {
      form.reset({
        name: "",
        type: "PF",
      });
    }
  }, [editingClient, form, isOpen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    console.log("Submitting client:", values);
    try {
      if (editingClient?.id) {
        const { error } = await supabase
          .from("clients")
          .update({
            ...values,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingClient.id);
        if (error) throw error;
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("clients").insert([{ 
          ...values, 
          is_active: true,
          updated_at: new Date().toISOString()
        }]);
        if (error) throw error;
        toast.success("Cliente cadastrado com sucesso!");
      }
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      onClose();
      form.reset();
    } catch (error: any) {
      console.error("Client submission error:", error);
      toast.error(editingClient ? `Erro ao atualizar cliente: ${error.message || "Erro desconhecido"}` : `Erro ao cadastrar cliente: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] text-white sm:max-w-[400px] p-0 overflow-hidden rounded-2xl">
        <div className="bg-[#111111] p-6 border-b border-[#1F1F1F]">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold tracking-tight uppercase">
              {editingClient ? "EDITAR CLIENTE" : "ADICIONAR NOVO CLIENTE"}
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Tipo de Cliente</FormLabel>
                <FormControl>
                  <div className="flex p-1 bg-[#1A1A1A] rounded-lg border border-[#1F1F1F]">
                    <button
                      type="button"
                      onClick={() => field.onChange("PF")}
                      className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                        field.value === "PF" 
                        ? "bg-[#FF1F3D] text-white shadow-lg" 
                        : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      PESSOA FÍSICA
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange("PJ")}
                      className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                        field.value === "PJ" 
                        ? "bg-[#FF1F3D] text-white shadow-lg" 
                        : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      PESSOA JURÍDICA
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Nome Completo</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Digite o nome..."
                    className="bg-[#111111] border-[#1F1F1F] h-12 focus:border-[#FF1F3D] focus:ring-[#FF1F3D] transition-all rounded-xl" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-black uppercase tracking-widest rounded-xl shadow-xl shadow-[#FF1F3D]/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? "PROCESSANDO..." : editingClient ? "SALVAR ALTERAÇÕES" : "CADASTRAR CLIENTE"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
