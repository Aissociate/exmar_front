import { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
  level: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
}

interface ActivityLoggerContextType {
  logs: ActivityLog[];
  logActivity: (
    action: string,
    level?: 'info' | 'warning' | 'error' | 'success',
    details?: any,
    entityType?: string,
    entityId?: string
  ) => Promise<void>;
  clearLogs: () => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

const ActivityLoggerContext = createContext<ActivityLoggerContextType | undefined>(undefined);

const MAX_LOCAL_LOGS = 50;

export function ActivityLoggerProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const consoleLogs = localStorage.getItem('console_logs');
      if (consoleLogs) {
        try {
          const parsedLogs = JSON.parse(consoleLogs);
          if (parsedLogs.length > 0) {
            setLogs((prev) => {
              const newLogs = parsedLogs.map((log: any) => ({
                id: `console-${Date.now()}-${Math.random()}`,
                user_id: undefined,
                action: log.action,
                level: log.level,
                details: log.details,
                created_at: log.timestamp,
              }));
              return [...newLogs, ...prev].slice(0, MAX_LOCAL_LOGS);
            });
            localStorage.removeItem('console_logs');
          }
        } catch (error) {
          console.error('ActivityLogger: Error processing console logs:', error);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const logActivity = useCallback(
    async (
      action: string,
      level: 'info' | 'warning' | 'error' | 'success' = 'info',
      details: any = {},
      entityType?: string,
      entityId?: string
    ) => {
      const tempLog: ActivityLog = {
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        user_id: undefined,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        level,
      };

      setLogs((prev) => [tempLog, ...prev].slice(0, MAX_LOCAL_LOGS));
    },
    []
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const value = {
    logs,
    logActivity,
    clearLogs,
    isVisible,
    toggleVisibility,
  };

  return (
    <ActivityLoggerContext.Provider value={value}>{children}</ActivityLoggerContext.Provider>
  );
}

export function useActivityLogger() {
  const context = useContext(ActivityLoggerContext);
  if (context === undefined) {
    throw new Error('useActivityLogger must be used within an ActivityLoggerProvider');
  }
  return context;
}
