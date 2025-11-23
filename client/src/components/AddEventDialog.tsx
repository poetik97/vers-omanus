import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
  } | null;
}

export function AddEventDialog({ open, onOpenChange, initialData }: AddEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");

  // Update state when initialData changes
  useEffect(() => {
    if (open && initialData) {
      if (initialData.title) setTitle(initialData.title);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.startTime) setStartDate(initialData.startTime.slice(0, 16)); // Format for datetime-local
      if (initialData.endTime) setEndDate(initialData.endTime.slice(0, 16));
      if (initialData.location) setLocation(initialData.location);
    } else if (open && !initialData) {
      // Reset if opening without data (manual open)
      // But only if we want to clear form on every open. 
      // Let's keep it simple and rely on resetForm on success or manual clear if needed.
      // Actually, for better UX, if no initialData, we might want to clear or keep previous draft.
      // For now, let's just set defaults if provided.
    }
  }, [open, initialData]);

  const utils = trpc.useUtils();
  const createEvent = trpc.events.create.useMutation({
    onSuccess: () => {
      toast.success("Evento criado com sucesso!");
      utils.events.list.invalidate();
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Erro ao criar evento: " + error.message);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setLocation("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !startDate || !endDate) {
      toast.error("Título, data de início e fim são obrigatórios");
      return;
    }

    createEvent.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: startDate,
      endTime: endDate,
      location: location.trim() || undefined,
      category: "other" as any,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
          <DialogDescription>
            Adicione um novo evento ao seu calendário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reunião com cliente"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes do evento..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Data de Início *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">Data de Fim *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Escritório, Zoom, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? "A criar..." : "Criar Evento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
