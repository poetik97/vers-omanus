import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc';

interface DataExportProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DataExport({ open, onOpenChange }: DataExportProps) {
    const [exporting, setExporting] = useState(false);
    const [success, setSuccess] = useState(false);
    const { toast } = useToast();

    const exportMutation = trpc.privacy.exportUserData.useMutation({
        onSuccess: (data) => {
            // Create and download JSON file
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `organiza-te360-data-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setSuccess(true);
            toast({
                title: 'Exportação concluída',
                description: 'Seus dados foram exportados com sucesso.',
            });
            setExporting(false);
        },
        onError: (error) => {
            console.error('Error exporting data:', error);
            toast({
                title: 'Erro na exportação',
                description: 'Ocorreu um erro ao exportar seus dados. Tente novamente.',
                variant: 'destructive',
            });
            setExporting(false);
        }
    });

    const handleExport = () => {
        setExporting(true);
        setSuccess(false);
        exportMutation.mutate();
    };

    const handleClose = () => {
        setSuccess(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-primary" />
                        Exportar Meus Dados
                    </DialogTitle>
                    <DialogDescription>
                        Baixe uma cópia completa de todos os seus dados em formato JSON
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!success ? (
                        <>
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    De acordo com a GDPR (Art. 20) e LGPD (Art. 18), você tem o direito de receber
                                    uma cópia de todos os seus dados pessoais em formato estruturado e legível por máquina.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2 text-sm">
                                <p className="font-semibold">O arquivo exportado incluirá:</p>
                                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                                    <li>Informações da conta</li>
                                    <li>Todas as tarefas e projetos</li>
                                    <li>Eventos do calendário</li>
                                    <li>Metas e objetivos</li>
                                    <li>Transações financeiras</li>
                                    <li>Entradas de diário</li>
                                    <li>Dados do ciclo menstrual (se aplicável)</li>
                                    <li>Configurações e preferências</li>
                                </ul>
                            </div>

                            <div className="p-3 bg-muted rounded-lg text-sm">
                                <p className="text-muted-foreground">
                                    💾 <strong>Formato:</strong> JSON (pode ser aberto em qualquer editor de texto)
                                </p>
                            </div>
                        </>
                    ) : (
                        <Alert className="bg-green-500/10 border-green-500/20">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertDescription className="text-green-700 dark:text-green-400">
                                ✅ Seus dados foram exportados com sucesso! O arquivo foi baixado para seu dispositivo.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    {!success ? (
                        <>
                            <Button variant="outline" onClick={handleClose} disabled={exporting}>
                                Cancelar
                            </Button>
                            <Button onClick={handleExport} disabled={exporting}>
                                {exporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Exportando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        Exportar Dados
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleClose} className="w-full">
                            Fechar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
