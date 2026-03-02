import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, AlertCircle, Zap, BarChart3 } from 'lucide-react';
import UserManagementTab from '@/components/admin/UserManagementTab';
import AuditLogTab from '@/components/admin/AuditLogTab';
import ZoneManagementTab from '@/components/admin/ZoneManagementTab';
import AlertManagementTab from '@/components/admin/AlertManagementTab';
import DashboardStatsTab from '@/components/admin/DashboardStatsTab';
import Navbar from '@/components/Navbar';

const AdminPage: React.FC = () => {
  const { user, role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Only allow admins and policymakers
  if (!user || !['admin', 'policymaker'].includes(role || '')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Administration Panel</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, zones, alerts, and system audit logs
          </p>
          {role === 'admin' && (
            <div className="mt-2 p-2 bg-primary/10 border border-primary/30 rounded text-sm text-primary">
              You are logged in as an <strong>Admin</strong> with full access.
            </div>
          )}
          {role === 'policymaker' && (
            <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-600">
              You are logged in as a <strong>PolicyMaker</strong>. Zone and alert management is available.
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-6">
            {role === 'admin' && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
            )}

            <TabsTrigger value="zones" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Zones</span>
            </TabsTrigger>

            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>

            {role === 'admin' && (
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Audit Log</span>
              </TabsTrigger>
            )}

            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
          </TabsList>

          {role === 'admin' && (
            <TabsContent value="users">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">User Management</h2>
                <UserManagementTab />
              </Card>
            </TabsContent>
          )}

          <TabsContent value="zones">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Zone Management</h2>
              <ZoneManagementTab />
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Alert Management</h2>
              <AlertManagementTab />
            </Card>
          </TabsContent>

          {role === 'admin' && (
            <TabsContent value="audit">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Audit Log</h2>
                <AuditLogTab />
              </Card>
            </TabsContent>
          )}

          <TabsContent value="stats">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Dashboard Statistics</h2>
              <DashboardStatsTab />
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
