import { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2, Phone, Building2, MapPin, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  location: string;
  read: boolean;
  created_at: string;
}

export function MessagesPage() {
  const { showToast } = useNotification();
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      showToast('Impossible de charger les messages', 'error');
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const toggleRead = async (m: ContactSubmission) => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ read: !m.read })
      .eq('id', m.id);
    if (error) {
      showToast('Action impossible', 'error');
    } else {
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: !x.read } : x)));
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
    if (error) {
      showToast('Suppression impossible', 'error');
    } else {
      setMessages((prev) => prev.filter((x) => x.id !== id));
      showToast('Message supprimé', 'success');
    }
  };

  const openMessage = (m: ContactSubmission) => {
    setExpanded(expanded === m.id ? null : m.id);
    if (!m.read && expanded !== m.id) toggleRead(m);
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Messages de contact</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Demandes reçues via le formulaire du site public.
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={loadMessages}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 text-center text-slate-500">
          <Mail className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          Aucun message pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`bg-white rounded-xl shadow-sm border transition-colors ${
                m.read ? 'border-slate-200' : 'border-blue-300 ring-1 ring-blue-100'
              }`}
            >
              <button
                onClick={() => openMessage(m)}
                className="w-full text-left p-4 sm:p-5 flex items-start gap-3"
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${m.read ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
                  {m.read ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold ${m.read ? 'text-slate-700' : 'text-slate-900'}`}>{m.name}</span>
                    <span className="text-xs text-slate-400">{new Date(m.created_at).toLocaleString('fr-FR')}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{m.subject || 'Sans sujet'}</p>
                  {expanded !== m.id && (
                    <p className="text-sm text-slate-400 mt-1 truncate">{m.message}</p>
                  )}
                </div>
              </button>

              {expanded === m.id && (
                <div className="px-4 sm:px-5 pb-5 -mt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                    <a href={`mailto:${m.email}`} className="flex items-center gap-2 hover:text-blue-600">
                      <Mail className="w-4 h-4 text-slate-400" /> {m.email}
                    </a>
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="flex items-center gap-2 hover:text-blue-600">
                        <Phone className="w-4 h-4 text-slate-400" /> {m.phone}
                      </a>
                    )}
                    {m.company && (
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" /> {m.company}
                      </span>
                    )}
                    {m.location && (
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" /> {m.location}
                      </span>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg whitespace-pre-wrap text-slate-800 text-sm">{m.message}</div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => toggleRead(m)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      {m.read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                      {m.read ? 'Marquer non lu' : 'Marquer lu'}
                    </button>
                    <button
                      onClick={() => remove(m.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" /> Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
