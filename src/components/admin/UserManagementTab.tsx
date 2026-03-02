import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { logAuditEvent } from '@/utils/auditLogger';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Trash2, Edit2, CheckCircle } from 'lucide-react';

interface UserWithRole {
  id: string;
  email: string;
  role: 'admin' | 'policymaker' | 'viewer';
  created_at: string;
}

const UserManagementTab: React.FC = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'policymaker' | 'viewer'>('viewer');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Fetch users and their roles
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role, users:user_id(email, created_at)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = data?.map((item: any) => ({
        id: item.user_id,
        email: item.users?.email || 'Unknown',
        role: item.role,
        created_at: item.users?.created_at || new Date().toISOString(),
      })) || [];

      setUsers(formattedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast({ variant: 'destructive', title: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: 'admin' | 'policymaker' | 'viewer') => {
    try {
      const oldRole = users.find(u => u.id === userId)?.role;

      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      if (currentUser?.id) {
        await logAuditEvent(
          currentUser.id,
          'user_role_changed',
          'user',
          userId,
          { old_role: oldRole, new_role: newRole }
        );
      }

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingId(null);
      toast({
        title: 'Role Updated',
        description: `User ${users.find(u => u.id === userId)?.email} is now a ${newRole}`,
      });
    } catch (err) {
      console.error('Error updating role:', err);
      toast({ variant: 'destructive', title: 'Failed to update role' });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) throw roleError;

      if (currentUser?.id) {
        await logAuditEvent(currentUser.id, 'user_deleted', 'user', userId, {});
      }

      setUsers(users.filter(u => u.id !== userId));
      toast({ title: 'User Deleted', description: 'User has been removed from the system' });
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({ variant: 'destructive', title: 'Failed to delete user' });
    }
  };

  const createNewUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast({ variant: 'destructive', title: 'Please enter email and password' });
      return;
    }

    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true,
      });

      if (error) throw error;

      if (data.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: 'viewer' });

        if (roleError) throw roleError;

        if (currentUser?.id) {
          await logAuditEvent(currentUser.id, 'user_created', 'user', data.user.id, {
            email: newUserEmail,
          });
        }

        setNewUserEmail('');
        setNewUserPassword('');
        fetchUsers();
        toast({ title: 'User Created', description: `${newUserEmail} has been added as a viewer` });
      }
    } catch (err) {
      console.error('Error creating user:', err);
      toast({ variant: 'destructive', title: 'Failed to create user' });
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create New User */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Create New User
        </h3>
        <div className="space-y-3">
          <Input
            placeholder="Email address"
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
          />
          <Button onClick={createNewUser} className="w-full">
            Create User as Viewer
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Users ({users.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Created</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{userItem.email}</td>
                  <td className="py-3 px-4">
                    {editingId === userItem.id ? (
                      <div className="flex gap-2">
                        <Select
                          value={selectedRole}
                          onValueChange={(val: any) => setSelectedRole(val)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="policymaker">PolicyMaker</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => updateUserRole(userItem.id, selectedRole)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        userItem.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : userItem.role === 'policymaker'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {userItem.role}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {new Date(userItem.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(userItem.id);
                          setSelectedRole(userItem.role);
                        }}
                        disabled={editingId === userItem.id}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteUser(userItem.id)}
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
      </div>
    </div>
  );
};

export default UserManagementTab;
