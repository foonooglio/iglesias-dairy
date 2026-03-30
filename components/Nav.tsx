'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getLanguage } from '@/lib/store';
import { t } from '@/lib/translations';

const navItems = (lang: 'es' | 'en') => [
  { href: '/', label: t[lang].dashboard, icon: '🏠' },
  { href: '/inspection', label: t[lang].inspection, icon: '📋' },
  { href: '/cows', label: t[lang].cows, icon: '🐄' },
  { href: '/settings', label: t[lang].settings, icon: '⚙️' },
];

export default function Nav() {
  const pathname = usePathname();
  const [lang, setLang] = useState<'es' | 'en'>('es');

  useEffect(() => {
    setLang(getLanguage());
    const handler = () => setLang(getLanguage());
    window.addEventListener('languagechange', handler);
    return () => window.removeEventListener('languagechange', handler);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems(lang).map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 text-xs font-medium transition-colors ${
                active ? 'text-green-700' : 'text-gray-500 hover:text-green-600'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span>{item.label}</span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 bg-green-600 rounded-t" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
