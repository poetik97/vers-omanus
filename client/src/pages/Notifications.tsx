import { useState } from 'react';
import { Bell, Filter, Trash2, Check, CheckCheck, ExternalLink, Calendar, TrendingUp } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { formatDistanceToNow, format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

const NOTIFICATION_ICONS: Record<string, string> = {
    taskReminders: '📋',
    eventReminders: '📅',
    goalUpdates: '🎯',
    financialAlerts: '💰',
    diaryReminders: '📖',
    menstrualAlerts: '🔄',
    dailySummary: '📊',
    weeklySummary: '🎯',
};

const NOTIFICATION_TYPES = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'taskReminders', label: '📋 Tarefas' },
    { value: 'eventReminders', label: '📅 Eventos' },
    { value: 'goalUpdates', label: '🎯 Objetivos' },
    { value: 'financialAlerts', label: '💰 Finanças' },
    { value: 'diaryReminders', label: '📖 Diário' },
    { value: 'menstrualAlerts', label: '🔄 Ciclo' },
    { value: 'dailySummary', label: '📊 Resumos' },
];

export default function Notifications() {
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [, setLocation] = useLocation();
    const utils = trpc.useUtils();

    // Queries
    const { data: notifications = [], isLoading } = trpc.notifications.list.useQuery({
        unreadOnly: filter === 'unread' ? true : filter === 'read' ? false : undefined,
        limit: 100,
    });

    const { data: stats } = trpc.notificationPreferences.getStats.useQuery();

    // Mutations
    const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
        onSuccess: () => {
            utils.notifications.list.invalidate();
            utils.notificationPreferences.getStats.invalidate();
            toast.success('Notificação marcada como lida');
        },
    });

    const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
        onSuccess: () => {
            utils.notifications.list.invalidate();
            utils.notificationPreferences.getStats.invalidate();
            toast.success('Todas as notificações marcadas como lidas');
        },
    });

    const deleteMutation = trpc.notifications.delete.useMutation({
        onSuccess: () => {
            utils.notifications.list.invalidate();
            utils.notificationPreferences.getStats.invalidate();
            toast.success('Notificação eliminada');
        },
    });

    const handleNotificationClick = (notification: any) => {
        if (!notification.read) {
            markAsReadMutation.mutate({ id: notification.id });
        }

        if (notification.actionUrl) {
            setLocation(notification.actionUrl);
        }
    };

    const handleMarkAllRead = () => {
        markAllAsReadMutation.mutate();
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate({ id });
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) return;

        if (confirm(`Eliminar ${selectedIds.size} notificação(ões)?`)) {
            // Delete each selected notification individually
            selectedIds.forEach(id => {
                deleteMutation.mutate({ id });
            });
            setSelectedIds(new Set());
        }
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === notifications.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(notifications.map((n: any) => n.id)));
        }
    };

    const filteredNotifications = notifications;

    return (
        <div className="container max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Bell className="h-8 w-8" />
                        Notificações
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gere todas as tuas notificações
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setLocation('/settings/notifications')}
                >
                    ⚙️ Configurações
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">Notificações totais</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
                        <Badge variant="destructive">{stats?.unread || 0}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{stats?.unread || 0}</div>
                        <p className="text-xs text-muted-foreground">Requerem atenção</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tipo Comum</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.byType?.[0]?.type ? NOTIFICATION_ICONS[stats.byType[0].type] : '📋'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.byType?.[0]?.count || 0} notificações
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Actions */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-2 w-full md:w-auto">
                            <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full md:w-auto">
                                <TabsList>
                                    <TabsTrigger value="all">Todas</TabsTrigger>
                                    <TabsTrigger value="unread">
                                        Não Lidas {stats?.unread ? `(${stats.unread})` : ''}
                                    </TabsTrigger>
                                    <TabsTrigger value="read">Lidas</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {NOTIFICATION_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            {selectedIds.size > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteSelected}
                                    disabled={false}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar ({selectedIds.size})
                                </Button>
                            )}
                            {(stats?.unread ?? 0) > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleMarkAllRead}
                                    disabled={markAllAsReadMutation.isPending}
                                >
                                    <CheckCheck className="h-4 w-4 mr-2" />
                                    Marcar todas como lidas
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            {filteredNotifications.length} Notificação(ões)
                        </CardTitle>
                        {filteredNotifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleSelectAll}
                            >
                                {selectedIds.size === filteredNotifications.length ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Desmarcar todas
                                    </>
                                ) : (
                                    <>
                                        <CheckCheck className="h-4 w-4 mr-2" />
                                        Selecionar todas
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-12 text-center text-muted-foreground">
                            Carregando notificações...
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">Sem notificações</h3>
                            <p className="text-muted-foreground">
                                {filter === 'unread'
                                    ? 'Não tens notificações não lidas! 🎉'
                                    : typeFilter !== 'all'
                                        ? 'Nenhuma notificação deste tipo'
                                        : 'Ainda não recebeste notificações'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredNotifications.map((notification: any) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-accent transition-colors relative group ${!notification.read ? 'bg-primary/5' : ''
                                        } ${selectedIds.has(notification.id) ? 'bg-accent' : ''}`}
                                >
                                    <div className="flex gap-4">
                                        {/* Checkbox */}
                                        <div className="flex items-start pt-1">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(notification.id)}
                                                onChange={() => toggleSelection(notification.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </div>

                                        {/* Icon */}
                                        <div className="text-3xl flex-shrink-0">
                                            {NOTIFICATION_ICONS[notification.type] || '🔔'}
                                        </div>

                                        {/* Content */}
                                        <div
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                                    {notification.title}
                                                </h4>
                                                {notification.actionUrl && (
                                                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                )}
                                            </div>

                                            <p className="text-sm text-muted-foreground mb-2">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true,
                                                        locale: pt,
                                                    })}
                                                </span>
                                                <span>•</span>
                                                <span>{format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => markAsReadMutation.mutate({ id: notification.id })}
                                                    disabled={markAsReadMutation.isPending}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive"
                                                onClick={() => handleDelete(notification.id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Unread indicator */}
                                        {!notification.read && (
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
