import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import { Dossier } from '../lib/types';
import { Plus, Search, Filter, Ship, Container, FolderOpen } from 'lucide-react';

export function DossiersPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadDossiers();
    }
  }, [user]);

  const loadDossiers = async () => {
    try {
      const { data, error } = await supabase
        .from('dossiers')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDossiers(data || []);
    } catch {
      showToast('Erreur lors du chargement des dossiers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredDossiers = dossiers.filter((dossier) => {
    const matchesSearch =
      dossier.vessel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.dossier_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.imo_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || dossier.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Brouillon', className: 'bg-slate-100 text-slate-700' },
      in_progress: { label: 'En cours', className: 'bg-blue-100 text-blue-700' },
      inspection_complete: {
        label: 'Inspection terminée',
        className: 'bg-amber-100 text-amber-700',
      },
      report_generated: { label: 'Rapport généré', className: 'bg-green-100 text-green-700' },
      validated: { label: 'Validé', className: 'bg-emerald-100 text-emerald-700' },
      archived: { label: 'Archivé', className: 'bg-slate-100 text-slate-600' },
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

  const getTypeLabel = (type: string) => {
    const types = {
      vessel_incident: 'Sinistre navire',
      container_incident: 'Sinistre container',
      vessel_evaluation: 'Évaluation navire',
    };
    return types[type as keyof typeof types] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes dossiers</h1>
          <p className="text-slate-600 mt-1">
            Gérez vos dossiers d'expertise maritime
          </p>
        </div>
        <Link
          to="/dossiers/new"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau dossier</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un dossier (nom, numéro, IMO...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="in_progress">En cours</option>
              <option value="inspection_complete">Inspection terminée</option>
              <option value="report_generated">Rapport généré</option>
              <option value="validated">Validé</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
        </div>
      </div>

      {filteredDossiers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {searchTerm || filterStatus !== 'all'
              ? 'Aucun résultat'
              : 'Aucun dossier'}
          </h3>
          <p className="text-slate-600 mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Créez votre premier dossier d\'expertise'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Link
              to="/dossiers/new"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau dossier</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDossiers.map((dossier) => (
            <Link
              key={dossier.id}
              to={`/dossiers/${dossier.id}`}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  {getTypeIcon(dossier.type)}
                </div>
                {getStatusBadge(dossier.status)}
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                {dossier.vessel_name || 'Sans nom'}
              </h3>
              <p className="text-sm text-slate-500 mb-3">
                {dossier.dossier_number}
              </p>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Type:</span>
                  <span className="font-medium">{getTypeLabel(dossier.type)}</span>
                </div>
                {dossier.vessel_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Navire:</span>
                    <span className="font-medium capitalize">{dossier.vessel_type}</span>
                  </div>
                )}
                {dossier.imo_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">IMO:</span>
                    <span className="font-medium">{dossier.imo_number}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                Modifié le{' '}
                {new Date(dossier.updated_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
