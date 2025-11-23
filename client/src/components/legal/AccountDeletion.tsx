import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { UserX, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface AccountDeletionProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AccountDeletion({ open, onOpenChange }: AccountDeletionProps) {
    const [step, setStep] = useState<'warning' | 'confirm' | 'password'>('warning');
    const [confirmations, setConfirmations] = useState({
        understand: false,
        permanent: false,
        noRecovery: false,
    });
    const [confirmText, setConfirmText] = useState('');
    const [password, setPassword] = useState('');
    const [deleting, setDeleting] = useState(false);
    const { toast } = useToast();
    const { signOut } = useSupabaseAuth();

    const deleteAccountMutation = trpc.privacy.deleteAccount.useMutation({
        onSuccess: async () => {
            toast({
                title: 'Conta excluída',
                description: 'Sua conta foi permanentemente excluída. Você será redirecionado.',
            });

            // Logout and redirect
            await signOut();
            window.location.href = '/';
        },
        onError: (error) => {
            console.error('Error deleting account:', error);
            toast({
                title: 'Erro',
                description: error.message || 'Ocorreu um erro ao excluir sua conta. Verifique sua senha e tente novamente.',
                variant: 'destructive',
            });
            setDeleting(false);
        }
    });

    const resetState = () => {
        setStep('warning');
        setConfirmations({
            understand: false,
            permanent: false,
            noRecovery: false,
        });
        setConfirmText('');
        setPassword('');
        setDeleting(false);
    };

    const handleClose = () => {
        resetState();
        onOpenChange(false);
    };

    const allConfirmationsChecked =
        confirmations.understand &&
        confirmations.permanent &&
        confirmations.noRecovery;

    const handleDelete = () => {
        setDeleting(true);
        deleteAccountMutation.mutate({ password });
    };

    return (
        <AlertDialog open={open} onOpenChange={handleClose}>
            <AlertDialogContent className="max-w-2xl">
                {step === 'warning' && (
                    <>
                        <AlertDialogHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="rounded-full bg-destructive/10 p-2">
                                    <UserX className="h-6 w-6 text-destructive" />
                                </div>
                                <AlertDialogTitle className="text-2xl">
                                    Excluir Conta Permanentemente
                                </AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="text-base">
                                Esta ação é <strong className="text-destructive">irreversível</strong> e excluirá
                                permanentemente todos os seus dados de nossos servidores.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="space-y-4 py-4">
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Atenção: Esta ação é permanente!</AlertTitle>
                                <AlertDescription>
                                    Após a exclusão, não será possível recuperar sua conta ou qualquer um dos seus dados.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-3 text-sm">
                                <p className="font-semibold">Os seguintes dados serão permanentemente excluídos:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 bg-muted rounded">
                                        <p className="text-muted-foreground">✗ Informações da conta</p>
                                    </div>
                                    <div className="p-2 bg-muted rounded">
                                        <p className="text-muted-foreground">✗ Todas as tarefas</p>
                                    </div>
                                    <div className="p-2 bg-muted rounded">
                                        <p className="text-muted-foreground">✗ Eventos do calendário</p>
                                    </div>
                                    <div className="p-2 bg-muted rounded">
                                        <p className="text-muted-foreground">✗ Metas e objetivos</p>
                                    </div>
                                    <div className="p-2 bg-muted rounded">
                                        <p className="text-muted-foreground">✗ Transações financeiras</p>
                                    </div>
                                    <div className="p-2 bg-muted rounded">
                                        <p className="text-muted-foreground">✗ Entradas de diário</p>
                                    </div>
                                    <div className="p-2 bg-muted rounded">
                                        <p className="text-muted-foreground">✗ Dados do ciclo menstrual</p>
                                    </div>
                                    <div className="p-2 bg-muted rounded">
                                        <p className="text-muted-foreground">✗ Todas as configurações</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-sm">
                                    💡 <strong>Sugestão:</strong> Antes de excluir, considere exportar seus dados para ter
                                    uma cópia de backup. Você pode fazer isso em "Exportar Meus Dados".
                                </p>
                            </div>

                            <div className="space-y-3 text-sm">
                                <p className="font-semibold">Confirmações necessárias:</p>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="understand"
                                            checked={confirmations.understand}
                                            onCheckedChange={(checked) =>
                                                setConfirmations({ ...confirmations, understand: checked as boolean })
                                            }
                                        />
                                        <Label htmlFor="understand" className="cursor-pointer leading-tight">
                                            Eu entendo que esta ação é irreversível
                                        </Label>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="permanent"
                                            checked={confirmations.permanent}
                                            onCheckedChange={(checked) =>
                                                setConfirmations({ ...confirmations, permanent: checked as boolean })
                                            }
                                        />
                                        <Label htmlFor="permanent" className="cursor-pointer leading-tight">
                                            Eu entendo que todos os meus dados serão permanentemente excluídos
                                        </Label>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="noRecovery"
                                            checked={confirmations.noRecovery}
                                            onCheckedChange={(checked) =>
                                                setConfirmations({ ...confirmations, noRecovery: checked as boolean })
                                            }
                                        />
                                        <Label htmlFor="noRecovery" className="cursor-pointer leading-tight">
                                            Eu entendo que não poderei recuperar minha conta após a exclusão
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleClose}>Cancelar</AlertDialogCancel>
                            <Button
                                variant="destructive"
                                onClick={() => setStep('confirm')}
                                disabled={!allConfirmationsChecked}
                            >
                                Continuar
                            </Button>
                        </AlertDialogFooter>
                    </>
                )}

                {step === 'confirm' && (
                    <>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmação Final</AlertDialogTitle>
                            <AlertDialogDescription>
                                Digite <strong>EXCLUIR PERMANENTEMENTE</strong> para confirmar a exclusão da sua conta
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="confirm-text">Texto de confirmação</Label>
                                <Input
                                    id="confirm-text"
                                    placeholder="Digite: EXCLUIR PERMANENTEMENTE"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    className="font-mono"
                                />
                            </div>

                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                    Última chance: Esta ação não pode ser desfeita. Todos os seus dados serão
                                    permanentemente excluídos dos nossos servidores.
                                </AlertDescription>
                            </Alert>
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setStep('warning')}>
                                Voltar
                            </AlertDialogCancel>
                            <Button
                                variant="destructive"
                                onClick={() => setStep('password')}
                                disabled={confirmText !== 'EXCLUIR PERMANENTEMENTE'}
                            >
                                Continuar
                            </Button>
                        </AlertDialogFooter>
                    </>
                )}

                {step === 'password' && (
                    <>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Digite sua senha</AlertDialogTitle>
                            <AlertDialogDescription>
                                Por segurança, digite sua senha para confirmar a exclusão da conta
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Digite sua senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <Alert>
                                <AlertDescription className="text-sm">
                                    De acordo com a GDPR (Art. 17) e LGPD (Art. 18), você tem o direito ao esquecimento.
                                    Após a confirmação, sua conta e todos os dados associados serão permanentemente excluídos
                                    dentro de 30 dias.
                                </AlertDescription>
                            </Alert>
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setStep('confirm')} disabled={deleting}>
                                Voltar
                            </AlertDialogCancel>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={!password || deleting}
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Excluindo...
                                    </>
                                ) : (
                                    <>
                                        <UserX className="h-4 w-4 mr-2" />
                                        Excluir Conta Permanentemente
                                    </>
                                )}
                            </Button>
                        </AlertDialogFooter>
                    </>
                )}
            </AlertDialogContent>
        </AlertDialog>
    );
}
