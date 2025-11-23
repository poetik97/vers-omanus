import { useState } from 'react';
import { Bell, Check, X, Trash2, ExternalLink } from 'lucide-react';
import { trpc } from '../lib/trpc';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useLocation } from 'wouter';
import { Button } from './ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

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

export function NotificationCenter() {
    const [open, setOpen] = useState(false);
    const [, setLocation] = useLocation();
    const utils = trpc.useUtils();

    // Queries
    const { data: notifications = [], isLoading } = trpc.notifications.list.useQuery(
        { unreadOnly: false, limit: 20 },
        { enabled: open }
    );

    const { data: unreadCount = 0 } = trpc.notifications.unreadCount.useQuery(undefined, {
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    // Mutations
    const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
        onSuccess: () => {
            utils.notifications.list.invalidate();
            utils.notifications.unreadCount.invalidate();
        },
    });

    const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
        onSuccess: () => {
            utils.notifications.list.invalidate();
            utils.notifications.unreadCount.invalidate();
        },
    });

    const deleteMutation = trpc.notifications.delete.useMutation({
        onSuccess: () => {
            utils.notifications.list.invalidate();
            utils.notifications.unreadCount.invalidate();
        },
    });

    const handleNotificationClick = (notification: any) => {
        if (!notification.read) {
            markAsReadMutation.mutate({ id: notification.id });
        }

        if (notification.actionUrl) {
            setOpen(false);
            setLocation(notification.actionUrl);
        }
    };

    const handleMarkAllRead = () => {
        markAllAsReadMutation.mutate();
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        deleteMutation.mutate({ id });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notificações"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-96 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg">Notificações</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            disabled={markAllAsReadMutation.isPending}
                        >
                            <Check className="h-4 w-4 mr-1" />
                            Marcar todas como lidas
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Carregando...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">Sem notificações</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification: any) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 cursor-pointer hover:bg-accent transition-colors relative group ${!notification.read ? 'bg-primary/5' : ''
                                        }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex gap-3">
                                        <div className="text-2xl flex-shrink-0">
                                            {NOTIFICATION_ICONS[notification.type] || '🔔'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={`font-medium text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                                                    {notification.title}
                                                </h4>
                                                {notification.actionUrl && (
                                                    <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>

                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>

                                            <p className="text-xs text-muted-foreground mt-2">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true,
                                                    locale: pt,
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleDelete(e, notification.id)}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>

                                    {!notification.read && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-3 border-t bg-muted/30">
                    <Button
                        variant="ghost"
                        className="w-full justify-center text-sm"
                        onClick={() => {
                            setOpen(false);
                            setLocation('/notifications');
                        }}
                    >
                        Ver todas as notificações
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
