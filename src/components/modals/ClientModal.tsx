import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
}

export function ClientModal({ isOpen, onClose }: ClientModalProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "PF",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase.from("clients").insert([values]);
      if (error) throw error;
      toast.success("Cliente cadastrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Erro ao cadastrar cliente.");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0A0A0A] border-[#1F1F1F] text-white sm:max-w-[400px] p-0 overflow-hidden rounded-2xl">
        <div className="bg-[#111111] p-6 border-b border-[#1F1F1F]">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold tracking-tight">ADICIONAR NOVO CLIENTE</DialogTitle>
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
                className="w-full h-12 bg-[#FF1F3D] hover:bg-[#D91B34] text-white font-black uppercase tracking-widest rounded-xl shadow-xl shadow-[#FF1F3D]/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                CADASTRAR CLIENTE
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
