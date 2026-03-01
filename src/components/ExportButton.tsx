import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ExportButton = () => {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      toast({
        title: '⏳ Exporting Data...',
        description: 'Preparing your dashboard data for export.',
      });

      const data = await apiService.exportDashboardData();
      
      // Create a blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `greenway-dashboard-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: '✅ Export Complete!',
        description: 'Your dashboard data has been downloaded successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '❌ Export Failed',
        description: 'Unable to export dashboard data. Please try again.',
      });
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      Export Data
    </Button>
  );
};

export default ExportButton;
