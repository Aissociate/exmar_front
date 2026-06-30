import { useState, useEffect } from 'react';
import { Save, User, CheckCircle, Globe, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';

export function SettingsPage() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    title: '',
    address: '',
    phone: '',
    email: '',
    registration_number: '',
    qualifications: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    loadContactEmail();
  }, []);

  const loadContactEmail = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'contact_notification_email')
      .maybeSingle();
    if (data?.value) setContactEmail(data.value);
  };

  const handleSaveEmail = async () => {
    setSavingEmail(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'contact_notification_email', value: contactEmail.trim(), updated_at: new Date().toISOString() });
    if (error) {
      showToast("Erreur lors de l'enregistrement de l'adresse", 'error');
    } else {
      showToast('Adresse de notification enregistrée', 'success');
    }
    setSavingEmail(false);
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          title: data.title || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          registration_number: data.registration_number || '',
          qualifications: data.qualifications || '',
        });
      }
    } catch {
      showToast(t('settings.loadError'), 'error');
      setMessage({ type: 'error', text: t('settings.loadError') });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const { data: existing } = await supabase
        .from('expert_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('expert_profiles')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('expert_profiles')
          .insert({
            ...formData,
            user_id: user?.id,
          });

        if (error) throw error;
      }

      setMessage({ type: 'success', text: t('settings.success') });
    } catch {
      showToast(t('settings.error'), 'error');
      setMessage({ type: 'error', text: t('settings.error') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t('settings.title')}</h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">{t('settings.subtitle')}</p>
      </div>

      {message && (
        <div className={`p-3 sm:p-4 rounded-lg flex items-center gap-2 text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
          <span className="flex-1">{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">{t('settings.profile.title')}</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{t('settings.profile.subtitle')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('settings.fullName')} *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Jean DUPONT"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('settings.title.field')} *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Expert près de la Cour d'Appel"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('settings.address')} *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123 rue de la Marine, 75001 Paris"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('settings.phone')} *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('settings.email')} *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="expert@maritime.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('settings.registrationNumber')}
            </label>
            <input
              type="text"
              value={formData.registration_number}
              onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 12345-A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('settings.qualifications')}
            </label>
            <textarea
              value={formData.qualifications}
              onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('settings.qualifications.placeholder')}
            />
          </div>
        </div>

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200">
          <div className="flex items-start sm:items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">{t('settings.language')}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-sm sm:text-base ${
                language === 'fr'
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="font-semibold">{t('settings.language.fr')}</div>
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-sm sm:text-base ${
                language === 'en'
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="font-semibold">{t('settings.language.en')}</div>
            </button>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{t('settings.saving')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t('settings.save')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Notifications de contact</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Adresse e-mail qui reçoit les messages envoyés depuis le formulaire du site public.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Adresse e-mail de réception</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="contact@exmar-oi.com"
          />
          <p className="text-xs text-slate-500 mt-2">
            Les messages sont aussi enregistrés dans l'onglet « Messages ». L'envoi d'e-mail nécessite la
            configuration de la fonction <code>send-contact-email</code> (clé Resend) côté Supabase.
          </p>
        </div>

        <div className="mt-4 sm:mt-6 flex justify-end">
          <button
            onClick={handleSaveEmail}
            disabled={savingEmail}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            {savingEmail ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{t('settings.saving')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t('settings.save')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
