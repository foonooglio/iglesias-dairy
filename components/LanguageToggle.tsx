'use client';

import { getLanguage, saveLanguage } from '@/lib/store';
import { t } from '@/lib/translations';
import { useEffect, useState } from 'react';

export default function LanguageToggle() {
  const [lang, setLang] = useState<'es' | 'en'>('es');

  useEffect(() => {
    setLang(getLanguage());
  }, []);

  function toggle() {
    const next = lang === 'es' ? 'en' : 'es';
    saveLanguage(next);
    setLang(next);
    window.dispatchEvent(new Event('languagechange'));
  }

  return (
    <button
      onClick={toggle}
      className="text-xs font-semibold px-3 py-1 rounded-full border border-green-600 text-green-700 hover:bg-green-50 transition"
    >
      {lang === 'es' ? t.es.english : t.en.spanish}
    </button>
  );
}
