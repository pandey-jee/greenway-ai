import { supabase } from '@/integrations/supabase/client';

export type AuditAction = 
  | 'zone_created'
  | 'zone_updated'
  | 'zone_deleted'
  | 'alert_created'
  | 'alert_updated'
  | 'alert_deleted'
  | 'recommendation_created'
  | 'recommendation_updated'
  | 'recommendation_deleted'
  | 'user_role_changed'
  | 'user_created'
  | 'user_deleted';

export interface AuditLogEntry {
  action: AuditAction;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Log an audit event to the database
 */
export const logAuditEvent = async (
  userId: string,
  action: AuditAction,
  entityType: string,
  entityId: string,
  changes: Record<string, any>,
  metadata?: Record<string, any>
) => {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        changes,
        metadata,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Audit log error:', error);
    }
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
};

/**
 * Fetch audit logs with optional filtering
 */
export const fetchAuditLogs = async (filters?: {
  userId?: string;
  action?: AuditAction;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) => {
  try {
    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        user_id,
        action,
        entity_type,
        entity_id,
        changes,
        metadata,
        timestamp,
        users:user_id(email)
      `)
      .order('timestamp', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    if (filters?.startDate) {
      query = query.gte('timestamp', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('timestamp', filters.endDate.toISOString());
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(100);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
    return [];
  }
};
