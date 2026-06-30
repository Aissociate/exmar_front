import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import { Dossier } from '../lib/types';
import {
  FolderOpen,
  Clock,
  CheckCircle,
  Plus,
  Ship,
  Container,
  TrendingUp,
  Archive,
} from 'lucide-react';

interface Stats {
  total: number;
  draft: number;
  in_progress: number;
  completed: number;
  archived: number;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useNotification();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    draft: 0,
    in_progress: 0,
    completed: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const { data: dossiersData, error } = await supabase
        .from('dossiers')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setDossiers(dossiersData || []);

      const { data: allDossiers, error: statsError } = await supabase
        .from('dossiers')
        .select('status')
        .eq('user_id', user?.id);

      if (statsError) throw statsError;

      const newStats: Stats = {
        total: allDossiers?.length || 0,
        draft: allDossiers?.filter((d) => d.status === 'draft').length || 0,
        in_progress:
          allDossiers?.filter(
            (d) => d.status === 'in_progress' || d.status === 'inspection_complete'
          ).length || 0,
        completed:
          allDossiers?.filter(
            (d) => d.status === 'report_generated' || d.status === 'validated'
          ).length || 0,
        archived: allDossiers?.filter((d) => d.status === 'archived').length || 0,
      };

      setStats(newStats);
    } catch {
      showToast('Erreur lors du chargement du tableau de bord', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: t('dossier.status.draft'), className: 'bg-slate-100 text-slate-700' },
      in_progress: { label: t('dossier.status.in_progress'), className: 'bg-blue-100 text-blue-700' },
      inspection_complete: {
        label: t('dossier.status.in_progress'),
        className: 'bg-amber-100 text-amber-700',
      },
      report_generated: { label: t('dossier.status.completed'), className: 'bg-green-100 text-green-700' },
      validated: { label: t('dossier.status.completed'), className: 'bg-emerald-100 text-emerald-700' },
      archived: { label: t('dossier.status.archived'), className: 'bg-slate-100 text-slate-600' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    if (type === 'container_incident') return <Container className="w-5 h-5" />;
    return <Ship className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{t('nav.dashboard')}</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">{t('dashboard.welcome')}</p>
        </div>
        <Link
          to="/dossiers/new"
          className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{t('dossiers.new')}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">{t('dashboard.stats.dossiers')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">{stats.total}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">{t('dossier.status.in_progress')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">{stats.in_progress}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">{t('dossier.status.completed')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">{stats.completed}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">{t('dossier.status.archived')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-600 mt-1 sm:mt-2">{stats.archived}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">{t('dashboard.recent.title')}</h2>
          <Link
            to="/dossiers"
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors whitespace-nowrap"
          >
            {t('dashboard.recent.viewAll')}
          </Link>
        </div>

        {dossiers.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-2">{t('dashboard.recent.empty')}</h3>
            <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">{t('dossiers.empty.subtitle')}</p>
            <Link
              to="/dossiers/new"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{t('dossiers.new')}</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {dossiers.map((dossier) => (
              <Link
                key={dossier.id}
                to={`/dossiers/${dossier.id}`}
                className="block p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(dossier.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900 truncate">
                          {dossier.vessel_name || 'Sans nom'}
                        </h3>
                        {getStatusBadge(dossier.status)}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Dossier N° {dossier.dossier_number}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        {dossier.vessel_type && (
                          <span className="capitalize">{dossier.vessel_type}</span>
                        )}
                        {dossier.imo_number && <span>IMO: {dossier.imo_number}</span>}
                        {dossier.flag && <span>Pavillon: {dossier.flag}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500 ml-4 flex-shrink-0">
                    <p>
                      Modifié le{' '}
                      {new Date(dossier.updated_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Besoin d'aide ?</h3>
            <p className="text-blue-100 mb-4">
              Consultez notre guide pour optimiser vos expertises maritimes
            </p>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Accéder au guide
            </button>
          </div>
          <TrendingUp className="w-24 h-24 text-blue-400 opacity-50" />
        </div>
      </div>
    </div>
  );
}
