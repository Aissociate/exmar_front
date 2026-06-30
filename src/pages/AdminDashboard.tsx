import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Calendar, Eye, Trash2, CheckCircle,
  RefreshCw, Inbox, Search, FileText, BarChart2, Clock, AlertTriangle,
  Building2, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ContactSubmission } from '../types';

type DossierStatus = 'recu' | 'en_cours' | 'traite' | 'archive';
type Tab = 'contacts' | 'dossiers' | 'stats';

interface Dossier {
  id: string;
  type: string;
  prix: number;
  statut: DossierStatus;
  donnees: Record<string, unknown>;
  email_client: string;
  notes_internes: string;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<DossierStatus, { label: string; color: string; bg: string }> = {
  recu: { label: 'Reçu', color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-500/30' },
  en_cours: { label: 'En cours', color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-500/30' },
  traite: { label: 'Traité', color: 'text-green-400', bg: 'bg-green-900/30 border-green-500/30' },
  archive: { label: 'Archivé', color: 'text-muted', bg: 'bg-navy-border/50 border-navy-border' },
};

const typeLabel: Record<string, string> = {
  mutation: 'Mutation de propriété',
  enregistrement: "Certificat d'enregistrement",
  modification: 'Modification administrative',
  radiation: 'Radiation / Cession',
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const fmtDateShort = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('contacts');

  // --- Contacts ---
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [searchContact, setSearchContact] = useState('');
  const [filterLoc, setFilterLoc] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');

  // --- Dossiers ---
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loadingDossiers, setLoadingDossiers] = useState(true);
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
  const [searchDossier, setSearchDossier] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    fetchContacts();
    fetchDossiers();
  }, []);

  const fetchContacts = async () => {
    setLoadingContacts(true);
    const { data } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
    setSubmissions(data || []);
    setLoadingContacts(false);
  };

  const fetchDossiers = async () => {
    setLoadingDossiers(true);
    const { data } = await supabase.from('dossiers_administratifs').select('*').order('created_at', { ascending: false });
    setDossiers((data || []) as Dossier[]);
    setLoadingDossiers(false);
  };


  const markRead = async (id: string) => {
    await supabase.from('contact_submissions').update({ read: true }).eq('id', id);
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, read: true } : s)));
    if (selectedContact?.id === id) setSelectedContact((c) => c ? { ...c, read: true } : c);
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    await supabase.from('contact_submissions').delete().eq('id', id);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    if (selectedContact?.id === id) setSelectedContact(null);
  };

  const openContact = async (s: ContactSubmission) => {
    setSelectedContact(s);
    if (!s.read) await markRead(s.id);
  };

  const updateDossierStatus = async (id: string, statut: DossierStatus) => {
    await supabase.from('dossiers_administratifs').update({ statut }).eq('id', id);
    setDossiers((prev) => prev.map((d) => d.id === id ? { ...d, statut } : d));
    if (selectedDossier?.id === id) setSelectedDossier((d) => d ? { ...d, statut } : d);
  };

  const saveNotes = async (id: string) => {
    await supabase.from('dossiers_administratifs').update({ notes_internes: notesDraft }).eq('id', id);
    setDossiers((prev) => prev.map((d) => d.id === id ? { ...d, notes_internes: notesDraft } : d));
    if (selectedDossier?.id === id) setSelectedDossier((d) => d ? { ...d, notes_internes: notesDraft } : d);
  };

  const openDossier = (d: Dossier) => {
    setSelectedDossier(d);
    setNotesDraft(d.notes_internes || '');
  };

  // Filtered lists
  const filteredContacts = submissions.filter((s) => {
    const m = s.name.toLowerCase().includes(searchContact.toLowerCase()) ||
      s.email.toLowerCase().includes(searchContact.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchContact.toLowerCase());
    const l = !filterLoc || s.location === filterLoc;
    const r = filterRead === 'all' || (filterRead === 'read' && s.read) || (filterRead === 'unread' && !s.read);
    return m && l && r;
  });

  const filteredDossiers = dossiers.filter((d) => {
    const m = !searchDossier || JSON.stringify(d.donnees).toLowerCase().includes(searchDossier.toLowerCase()) || d.type.includes(searchDossier);
    const t = !filterType || d.type === filterType;
    const s = !filterStatus || d.statut === filterStatus;
    return m && t && s;
  });

  const unreadCount = submissions.filter((s) => !s.read).length;
  const pendingDossiers = dossiers.filter((d) => d.statut === 'recu' || d.statut === 'en_cours').length;
  const totalCA = dossiers.filter((d) => d.statut !== 'archive').reduce((a, d) => a + d.prix, 0);
  const locations = [...new Set(submissions.map((s) => s.location).filter(Boolean))];

  const inp = 'px-4 py-2.5 rounded-lg bg-navy-mid border border-navy-border text-white placeholder-muted/40 focus:ring-2 focus:ring-gold/40 focus:border-gold/40 outline-none transition-all text-[13px]';

  return (
    <div className="min-h-screen bg-navy-deep text-white flex flex-col">
      {/* Topbar */}
      <header className="bg-navy-mid border-b border-navy-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img src="/image.png" alt="EXMAR-OI" className="h-9 w-auto brightness-0 invert" />
              <div className="h-5 w-px bg-navy-border" />
              <span className="text-muted text-[13px]">Back-office</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-[13px] text-muted hover:text-white transition-colors flex items-center gap-1">
                Voir le site <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Messages non lus', value: unreadCount, icon: Inbox, color: 'text-blue-400' },
            { label: 'Dossiers actifs', value: pendingDossiers, icon: FileText, color: 'text-amber-400' },
            { label: 'Total dossiers', value: dossiers.length, icon: BarChart2, color: 'text-green-400' },
            { label: 'CA dossiers', value: `${totalCA} €`, icon: CheckCircle, color: 'text-gold' },
          ].map((stat, i) => (
            <div key={i} className="bg-navy-card border border-navy-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-muted text-[12px] uppercase tracking-wider">{stat.label}</p>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className={`font-bebas text-[36px] leading-none ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-navy-mid border border-navy-border rounded-xl p-1 mb-6 w-fit">
          {([
            { id: 'contacts' as Tab, label: 'Messages', icon: Inbox, badge: unreadCount },
            { id: 'dossiers' as Tab, label: 'Dossiers Admin', icon: FileText, badge: pendingDossiers },
            { id: 'stats' as Tab, label: 'Activité', icon: BarChart2 },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                tab === t.id ? 'bg-navy-card text-white shadow' : 'text-muted hover:text-white'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-gold text-navy-deep text-[11px] font-bold flex items-center justify-center">{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ===== CONTACTS TAB ===== */}
        {tab === 'contacts' && (
          <div>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input className={inp + ' w-full pl-9'} placeholder="Rechercher..." value={searchContact} onChange={(e) => setSearchContact(e.target.value)} />
              </div>
              <select className={inp} value={filterLoc} onChange={(e) => setFilterLoc(e.target.value)}>
                <option value="">Toutes les zones</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <select className={inp} value={filterRead} onChange={(e) => setFilterRead(e.target.value as 'all' | 'read' | 'unread')}>
                <option value="all">Tous</option>
                <option value="unread">Non lus</option>
                <option value="read">Lus</option>
              </select>
              <button onClick={fetchContacts} className="px-3 py-2.5 border border-navy-border rounded-lg hover:border-gold/30 transition-colors">
                <RefreshCw className={`w-4 h-4 text-muted ${loadingContacts ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* List */}
              <div className="bg-navy-card border border-navy-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-navy-border flex items-center justify-between">
                  <h3 className="text-white font-semibold text-[14px]">Messages ({filteredContacts.length})</h3>
                </div>
                <div className="divide-y divide-navy-border max-h-[580px] overflow-y-auto">
                  {loadingContacts ? (
                    <div className="p-8 text-center text-muted text-[13px]">Chargement...</div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="p-8 text-center">
                      <Inbox className="w-10 h-10 text-navy-border mx-auto mb-3" />
                      <p className="text-muted text-[13px]">Aucun message</p>
                    </div>
                  ) : filteredContacts.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => openContact(s)}
                      className={`w-full p-4 text-left hover:bg-navy-mid transition-colors ${selectedContact?.id === s.id ? 'bg-navy-mid border-l-2 border-gold' : !s.read ? 'bg-gold/5' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`text-[14px] truncate ${!s.read ? 'font-semibold text-white' : 'text-white/70'}`}>{s.name}</span>
                        {!s.read && <span className="w-2 h-2 bg-gold rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-[12px] text-muted truncate mb-1">{s.subject}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted/60">
                        <MapPin className="w-3 h-3" />{s.location || '—'}
                        <Calendar className="w-3 h-3 ml-1" />{fmtDateShort(s.created_at)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail */}
              <div className="lg:col-span-2 bg-navy-card border border-navy-border rounded-xl">
                {selectedContact ? (
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-navy-border">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-white font-semibold text-lg">{selectedContact.subject}</h3>
                          <p className="text-muted text-[13px] mt-1 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />{fmtDate(selectedContact.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedContact.read && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-900/30 border border-green-500/30 text-green-400 rounded-full text-[11px]">
                              <CheckCircle className="w-3 h-3" /> Lu
                            </span>
                          )}
                          <button onClick={() => deleteContact(selectedContact.id)} className="p-2 text-muted hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                          { icon: Mail, label: 'Email', value: selectedContact.email, href: `mailto:${selectedContact.email}` },
                          { icon: Phone, label: 'Téléphone', value: selectedContact.phone, href: `tel:${selectedContact.phone}` },
                          { icon: Building2, label: 'Société', value: selectedContact.company },
                          { icon: MapPin, label: 'Zone', value: selectedContact.location },
                        ].filter(f => f.value).map((f, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-navy-mid rounded-xl">
                            <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <f.icon className="w-3.5 h-3.5 text-gold" />
                            </div>
                            <div>
                              <p className="text-[11px] text-muted mb-0.5">{f.label}</p>
                              {f.href ? (
                                <a href={f.href} className="text-[13px] text-white hover:text-gold transition-colors">{f.value}</a>
                              ) : (
                                <p className="text-[13px] text-white">{f.value}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-[11px] text-muted uppercase tracking-widest mb-3">Message</p>
                        <div className="bg-navy-mid rounded-xl p-5">
                          <p className="text-white/80 text-[14px] whitespace-pre-wrap leading-relaxed">{selectedContact.message}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border-t border-navy-border">
                      <a
                        href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-[14px]"
                      >
                        <Mail className="w-4 h-4" /> Répondre par email
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-center p-8">
                    <div>
                      <Eye className="w-12 h-12 text-navy-border mx-auto mb-3" />
                      <p className="text-muted text-[14px]">Sélectionnez un message</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== DOSSIERS TAB ===== */}
        {tab === 'dossiers' && (
          <div>
            <div className="flex flex-col md:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input className={inp + ' w-full pl-9'} placeholder="Rechercher..." value={searchDossier} onChange={(e) => setSearchDossier(e.target.value)} />
              </div>
              <select className={inp} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">Tous les types</option>
                {Object.entries(typeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select className={inp} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Tous les statuts</option>
                {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button onClick={fetchDossiers} className="px-3 py-2.5 border border-navy-border rounded-lg hover:border-gold/30 transition-colors">
                <RefreshCw className={`w-4 h-4 text-muted ${loadingDossiers ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* List */}
              <div className="bg-navy-card border border-navy-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-navy-border">
                  <h3 className="text-white font-semibold text-[14px]">Dossiers ({filteredDossiers.length})</h3>
                </div>
                <div className="divide-y divide-navy-border max-h-[580px] overflow-y-auto">
                  {loadingDossiers ? (
                    <div className="p-8 text-center text-muted text-[13px]">Chargement...</div>
                  ) : filteredDossiers.length === 0 ? (
                    <div className="p-8 text-center">
                      <FileText className="w-10 h-10 text-navy-border mx-auto mb-3" />
                      <p className="text-muted text-[13px]">Aucun dossier</p>
                    </div>
                  ) : filteredDossiers.map((d) => {
                    const sc = statusConfig[d.statut];
                    return (
                      <button
                        key={d.id}
                        onClick={() => openDossier(d)}
                        className={`w-full p-4 text-left hover:bg-navy-mid transition-colors ${selectedDossier?.id === d.id ? 'bg-navy-mid border-l-2 border-gold' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-[13px] text-white font-medium">{typeLabel[d.type] || d.type}</span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>{sc.label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted/60">
                          <span className="text-gold font-semibold text-[12px]">{d.prix} €</span>
                          <Calendar className="w-3 h-3" />{fmtDateShort(d.created_at)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dossier detail */}
              <div className="lg:col-span-2 bg-navy-card border border-navy-border rounded-xl">
                {selectedDossier ? (
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-navy-border">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-white font-semibold text-lg">{typeLabel[selectedDossier.type] || selectedDossier.type}</h3>
                          <p className="text-muted text-[13px] mt-1">Reçu le {fmtDate(selectedDossier.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bebas text-3xl text-gold">{selectedDossier.prix} €</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                      {/* Status change */}
                      <div className="mb-6">
                        <p className="text-[11px] text-muted uppercase tracking-widest mb-3">Statut du dossier</p>
                        <div className="flex flex-wrap gap-2">
                          {(Object.entries(statusConfig) as [DossierStatus, typeof statusConfig[DossierStatus]][]).map(([k, v]) => (
                            <button
                              key={k}
                              onClick={() => updateDossierStatus(selectedDossier.id, k)}
                              className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-all ${
                                selectedDossier.statut === k
                                  ? `${v.bg} ${v.color} border-current`
                                  : 'bg-navy-mid border-navy-border text-muted hover:border-gold/30 hover:text-white'
                              }`}
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Data */}
                      <div className="mb-6">
                        <p className="text-[11px] text-muted uppercase tracking-widest mb-3">Données du dossier</p>
                        <div className="bg-navy-mid rounded-xl p-5 max-h-48 overflow-y-auto">
                          {Object.entries(selectedDossier.donnees).length === 0 ? (
                            <p className="text-muted text-[13px]">Aucune donnée enregistrée</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(selectedDossier.donnees).filter(([, v]) => v).map(([k, v]) => (
                                <div key={k}>
                                  <p className="text-[11px] text-muted">{k.replace(/_/g, ' ')}</p>
                                  <p className="text-[13px] text-white">{String(v)}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <p className="text-[11px] text-muted uppercase tracking-widest mb-3">Notes internes</p>
                        <textarea
                          value={notesDraft}
                          onChange={(e) => setNotesDraft(e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg bg-navy-mid border border-navy-border text-white placeholder-muted/40 focus:ring-2 focus:ring-gold/40 outline-none transition-all text-[14px] resize-none"
                          placeholder="Ajouter des notes internes..."
                        />
                        <button
                          onClick={() => saveNotes(selectedDossier.id)}
                          className="mt-2 px-4 py-2 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-[13px]"
                        >
                          Sauvegarder les notes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-center p-8">
                    <div>
                      <FileText className="w-12 h-12 text-navy-border mx-auto mb-3" />
                      <p className="text-muted text-[14px]">Sélectionnez un dossier</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== STATS TAB ===== */}
        {tab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Dossiers par type */}
              <div className="bg-navy-card border border-navy-border rounded-xl p-6">
                <p className="text-[11px] text-muted uppercase tracking-widest mb-5 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-gold" /> Par type</p>
                <div className="space-y-3">
                  {Object.entries(typeLabel).map(([k, v]) => {
                    const count = dossiers.filter((d) => d.type === k).length;
                    const pct = dossiers.length ? Math.round((count / dossiers.length) * 100) : 0;
                    return (
                      <div key={k}>
                        <div className="flex justify-between text-[13px] mb-1">
                          <span className="text-white/70">{v}</span>
                          <span className="text-gold font-semibold">{count}</span>
                        </div>
                        <div className="h-1.5 bg-navy-border rounded-full overflow-hidden">
                          <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Par statut */}
              <div className="bg-navy-card border border-navy-border rounded-xl p-6">
                <p className="text-[11px] text-muted uppercase tracking-widest mb-5 flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> Par statut</p>
                <div className="space-y-3">
                  {(Object.entries(statusConfig) as [DossierStatus, typeof statusConfig[DossierStatus]][]).map(([k, v]) => {
                    const count = dossiers.filter((d) => d.statut === k).length;
                    return (
                      <div key={k} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${v.bg}`}>
                        <span className={`text-[13px] font-medium ${v.color}`}>{v.label}</span>
                        <span className={`font-bebas text-2xl leading-none ${v.color}`}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CA */}
              <div className="bg-navy-card border border-navy-border rounded-xl p-6">
                <p className="text-[11px] text-muted uppercase tracking-widest mb-5 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-gold" /> Chiffre d'affaires</p>
                <div className="space-y-4">
                  {Object.entries(typeLabel).map(([k, v]) => {
                    const ca = dossiers.filter((d) => d.type === k && d.statut !== 'archive').reduce((a, d) => a + d.prix, 0);
                    return ca > 0 ? (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-white/70 text-[13px]">{v.split(' ').slice(0, 2).join(' ')}</span>
                        <span className="text-gold font-semibold text-[14px]">{ca} €</span>
                      </div>
                    ) : null;
                  })}
                  <div className="border-t border-navy-border pt-4 flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="font-bebas text-3xl text-gold leading-none">{totalCA} €</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alertes */}
            {pendingDossiers > 0 && (
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-5 flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-400 font-semibold text-[14px] mb-1">{pendingDossiers} dossier{pendingDossiers > 1 ? 's' : ''} en attente de traitement</p>
                  <p className="text-amber-400/70 text-[13px]">Vérifiez les dossiers avec statut "Reçu" ou "En cours".</p>
                </div>
                <button onClick={() => setTab('dossiers')} className="ml-auto flex items-center gap-1 text-amber-400 text-[13px] hover:text-amber-300 transition-colors flex-shrink-0">
                  Voir <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
