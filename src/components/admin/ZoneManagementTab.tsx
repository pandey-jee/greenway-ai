import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { logAuditEvent } from '@/utils/auditLogger';
import { Edit2, Trash2, Plus } from 'lucide-react';

interface Zone {
  name: string;
  country: string;
  density: number;
  ecoScore: number;
  status: 'critical' | 'high' | 'moderate' | 'low';
}

const ZoneManagementTab: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [newZone, setNewZone] = useState<Partial<Zone>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Load zones from your backend
    const loadZones = async () => {
      try {
        // This would fetch from your backend endpoint
        // For now, showing the framework
        setZones([]);
      } catch (err) {
        toast({ variant: 'destructive', title: 'Failed to load zones' });
      } finally {
        setLoading(false);
      }
    };

    loadZones();
  }, []);

  const handleSaveZone = async (zone: Zone) => {
    if (!user?.id) return;

    try {
      // TODO: Implement zone save logic in your backend
      // POST/PUT to /api/zones endpoint

      await logAuditEvent(
        user.id,
        editingZone ? 'zone_updated' : 'zone_created',
        'zone',
        zone.name,
        editingZone ? { before: editingZone, after: zone } : { created: zone }
      );

      setEditingZone(null);
      toast({
        title: editingZone ? 'Zone Updated' : 'Zone Created',
        description: `Zone "${zone.name}" has been saved`,
      });
    } catch (err) {
      console.error('Error saving zone:', err);
      toast({ variant: 'destructive', title: 'Failed to save zone' });
    }
  };

  const handleDeleteZone = async (name: string) => {
    if (!confirm(`Delete zone "${name}"? This action cannot be undone.`)) return;

    if (!user?.id) return;

    try {
      // TODO: Implement zone delete logic in your backend

      await logAuditEvent(
        user.id,
        'zone_deleted',
        'zone',
        name,
        { deleted_zone: name }
      );

      setZones(zones.filter(z => z.name !== name));
      toast({
        title: 'Zone Deleted',
        description: `Zone "${name}" has been removed`,
      });
    } catch (err) {
      console.error('Error deleting zone:', err);
      toast({ variant: 'destructive', title: 'Failed to delete zone' });
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading zones...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
        <strong>💡 Note:</strong> Zone management allows policymakers to adjust tourist density levels, eco scores, and congestion status directly from this panel. Changes are tracked in the audit log.
      </div>

      {/* Create Zone Form */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Create New Zone
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Zone name" />
          <Input placeholder="Country" />
          <Input type="number" placeholder="Density %" />
          <Input type="number" placeholder="Eco Score (0-100)" />
        </div>
        <Button className="mt-4 w-full">Create Zone</Button>
      </div>

      {/* Zones Table */}
      <div>
        <h3 className="font-semibold mb-4">Existing Zones ({zones.length})</h3>
        {zones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No zones found. Create one above to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Zone Name</th>
                  <th className="text-left py-3 px-4">Country</th>
                  <th className="text-left py-3 px-4">Density</th>
                  <th className="text-left py-3 px-4">Eco Score</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.name} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{zone.name}</td>
                    <td className="py-3 px-4">{zone.country}</td>
                    <td className="py-3 px-4">{zone.density}%</td>
                    <td className="py-3 px-4">{zone.ecoScore}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        zone.status === 'critical' ? 'bg-red-100 text-red-800' :
                        zone.status === 'high' ? 'bg-orange-100 text-orange-800' :
                        zone.status === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {zone.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingZone(zone)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteZone(zone.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneManagementTab;
