import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { logAuditEvent } from '@/utils/auditLogger';
import { Edit2, Trash2, Plus, AlertTriangle } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'inactive';
  createdAt: string;
}

const AlertManagementTab: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [newAlert, setNewAlert] = useState({ title: '', description: '', severity: 'warning' });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        // TODO: Load alerts from backend /api/alerts endpoint
        setAlerts([]);
      } catch (err) {
        toast({ variant: 'destructive', title: 'Failed to load alerts' });
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  const handleCreateAlert = async () => {
    if (!newAlert.title || !newAlert.description) {
      toast({ variant: 'destructive', title: 'Please fill in all fields' });
      return;
    }

    if (!user?.id) return;

    try {
      // TODO: POST to /api/alerts endpoint
      const alert: Alert = {
        id: Date.now().toString(),
        ...newAlert,
        status: 'active',
        severity: newAlert.severity as any,
        createdAt: new Date().toISOString(),
      };

      await logAuditEvent(
        user.id,
        'alert_created',
        'alert',
        alert.id,
        alert
      );

      setAlerts([...alerts, alert]);
      setNewAlert({ title: '', description: '', severity: 'warning' });
      toast({ title: 'Alert Created', description: 'New alert has been created' });
    } catch (err) {
      console.error('Error creating alert:', err);
      toast({ variant: 'destructive', title: 'Failed to create alert' });
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Delete this alert? This action cannot be undone.')) return;

    if (!user?.id) return;

    try {
      // TODO: DELETE /api/alerts/{alertId}

      await logAuditEvent(
        user.id,
        'alert_deleted',
        'alert',
        alertId,
        { deleted_alert: alertId }
      );

      setAlerts(alerts.filter(a => a.id !== alertId));
      toast({ title: 'Alert Deleted', description: 'Alert has been removed' });
    } catch (err) {
      console.error('Error deleting alert:', err);
      toast({ variant: 'destructive', title: 'Failed to delete alert' });
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
        <strong>⚠️ Note:</strong> Alerts notify all users about critical tourism issues. Admins and policymakers can create and manage alerts directly.
      </div>

      {/* Create Alert Form */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Create New Alert
        </h3>
        <div className="space-y-3">
          <Input
            placeholder="Alert title (e.g., 'High congestion at Goa Beach')"
            value={newAlert.title}
            onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
          />
          <Input
            placeholder="Description"
            value={newAlert.description}
            onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
          />
          <div className="flex gap-2">
            <select
              className="flex-1 px-3 py-2 border rounded-md bg-background"
              value={newAlert.severity}
              onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
            <Button onClick={handleCreateAlert}>Create Alert</Button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Active Alerts ({alerts.length})
        </h3>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No alerts currently active. Create one above to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <h4 className="font-semibold">{alert.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteAlert(alert.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertManagementTab;
