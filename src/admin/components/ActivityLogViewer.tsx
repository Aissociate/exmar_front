import { useState, useEffect } from 'react';
import { useActivityLogger } from '../contexts/ActivityLoggerContext';
import {
  Activity,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Trash2,
} from 'lucide-react';

export function ActivityLogViewer() {
  const { logs, clearLogs, isVisible, toggleVisibility } = useActivityLogger();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');

  // Log all console output to activity log
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog(...args);
      // Don't log our own activity logger logs to prevent infinite loop
      if (args[0] && typeof args[0] === 'string' && !args[0].includes('ActivityLogger')) {
        // Format the console message
        const message = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');

        // Store in localStorage so activity logger can pick it up
        const consoleLog = {
          action: 'console_log',
          level: 'info',
          details: { message },
          timestamp: new Date().toISOString()
        };

        const existing = localStorage.getItem('console_logs') || '[]';
        const logs = JSON.parse(existing);
        logs.push(consoleLog);
        localStorage.setItem('console_logs', JSON.stringify(logs));
      }
    };

    console.error = (...args) => {
      originalError(...args);
      if (args[0] && typeof args[0] === 'string' && !args[0].includes('ActivityLogger')) {
        const message = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');

        const consoleLog = {
          action: 'console_error',
          level: 'error',
          details: { message },
          timestamp: new Date().toISOString()
        };

        const existing = localStorage.getItem('console_logs') || '[]';
        const logs = JSON.parse(existing);
        logs.push(consoleLog);
        localStorage.setItem('console_logs', JSON.stringify(logs));
      }
    };

    console.warn = (...args) => {
      originalWarn(...args);
      if (args[0] && typeof args[0] === 'string' && !args[0].includes('ActivityLogger')) {
        const message = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');

        const consoleLog = {
          action: 'console_warn',
          level: 'warning',
          details: { message },
          timestamp: new Date().toISOString()
        };

        const existing = localStorage.getItem('console_logs') || '[]';
        const logs = JSON.parse(existing);
        logs.push(consoleLog);
        localStorage.setItem('console_logs', JSON.stringify(logs));
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const filteredLogs = filter === 'all' ? logs : logs.filter((log) => log.level === filter);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 p-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition-all z-50"
        title="Afficher les logs d'activité"
      >
        <Activity className="w-5 h-5" />
        {logs.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
            {logs.length > 9 ? '9+' : logs.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
      <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <h3 className="font-semibold">Logs d'activité</h3>
          <span className="text-xs bg-slate-700 px-2 py-1 rounded">
            {filteredLogs.length}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title={isExpanded ? 'Réduire' : 'Agrandir'}
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={toggleVisibility}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('info')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filter === 'info'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filter === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            Succès
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filter === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-200'
            }`}
          >
            Erreur
          </button>
        </div>
        <button
          onClick={clearLogs}
          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          title="Effacer les logs"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div
        className={`overflow-y-auto ${
          isExpanded ? 'max-h-96' : 'max-h-64'
        } transition-all`}
      >
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune activité enregistrée</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 hover:bg-slate-50 transition-colors border-l-4 ${getLevelColor(
                  log.level
                )}`}
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-0.5">{getLevelIcon(log.level)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {formatAction(log.action)}
                      </p>
                      <span className="text-xs text-slate-500 ml-2">
                        {formatTime(log.created_at)}
                      </span>
                    </div>
                    {log.entity_type && (
                      <p className="text-xs text-slate-600">
                        {log.entity_type}
                        {log.entity_id && ` - ${log.entity_id.slice(0, 8)}...`}
                      </p>
                    )}
                    {log.details && Object.keys(log.details).length > 0 && (
                      <details className="mt-1">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700">
                          Détails
                        </summary>
                        <pre className="text-xs bg-slate-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
