import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { translations, Language } from '../lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    if (user) {
      loadLanguagePreference();
    }
  }, [user]);

  const loadLanguagePreference = async () => {
    try {
      const { data } = await supabase
        .from('expert_profiles')
        .select('language')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (data?.language) {
        setLanguageState(data.language as Language);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);

    if (user) {
      try {
        const { data: existing } = await supabase
          .from('expert_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('expert_profiles')
            .update({ language: lang })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('expert_profiles')
            .insert({ user_id: user.id, language: lang });
        }
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['fr']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
