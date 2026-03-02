import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAuditLogs } from '@/utils/auditLogger';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText } from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, any>;
  timestamp: string;
  users?: { email: string };
}

const AuditLogTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchAuditLogs({ limit: 200 });
        setLogs(data as unknown as AuditLog[]);
      } catch (err) {
        console.error('Error loading audit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();

    // Subscribe to new audit logs
    const subscription = supabase
      .channel('audit_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        (payload) => {
          setLogs((prev) => [payload.new as AuditLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'bg-green-100 text-green-800';
    if (action.includes('updated')) return 'bg-blue-100 text-blue-800';
    if (action.includes('deleted')) return 'bg-red-100 text-red-800';
    if (action.includes('changed')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Showing the last {logs.length} audit log entries
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No audit logs yet
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">
                        {log.entity_type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ID: {log.entity_id.substring(0, 8)}...
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {log.users?.email || `User ${log.user_id.substring(0, 8)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    {Object.keys(log.changes).length > 0 && (
                      <div className="mt-3 p-3 bg-muted rounded text-xs">
                        <details className="cursor-pointer">
                          <summary className="font-medium mb-2">Changes</summary>
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuditLogTab;
