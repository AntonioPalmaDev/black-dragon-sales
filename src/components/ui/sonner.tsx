import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#111111] group-[.toaster]:text-white group-[.toaster]:border-[#1F1F1F] group-[.toaster]:shadow-2xl rounded-xl",
          description: "group-[.toast]:text-zinc-400",
          actionButton: "group-[.toast]:bg-[#FF1F3D] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-[#1A1A1A] group-[.toast]:text-zinc-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
