'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getCows, getFarms, getInspections, getMovements, updateCow, getLanguage,
  Cow, Farm, Inspection, CowMovement,
} from '@/lib/store';
import { t } from '@/lib/translations';

export default function CowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cowId = params.id as string;

  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [cow, setCow] = useState<Cow | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [movements, setMovements] = useState<CowMovement[]>([]);
  const [birthDate, setBirthDate] = useState('');
  const [saved, setSaved] = useState(false);

  function loadAll() {
    const cows = getCows();
    const found = cows.find(c => c.id === cowId) ?? null;
    setCow(found);
    setBirthDate(found?.birthDate ?? '');
    setFarms(getFarms());
    setInspections(getInspections());
    setMovements(getMovements());
    setLang(getLanguage());
  }

  useEffect(() => {
    loadAll();
    const handler = () => setLang(getLanguage());
    window.addEventListener('languagechange', handler);
    return () => window.removeEventListener('languagechange', handler);
  }, [cowId]);

  const T = t[lang];

  const getFarmName = (farmId: string) => {
    const f = farms.find(f => f.id === farmId);
    return f ? f.location || f.name : farmId;
  };

  const cowInspections = inspections
    .filter(insp => insp.entries.some(e => e.cowIds.includes(cowId)))
    .sort((a, b) => b.date.localeCompare(a.date));

  const cowMovements = movements
    .filter(m => m.cowId === cowId)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Pregnancy / dry-off calculation
  const pregnancyAlert = (() => {
    for (const insp of cowInspections) {
      const entry = insp.entries.find(e => e.cowIds.includes(cowId) && e.mesesPrene !== undefined);
      if (entry && entry.mesesPrene !== undefined) {
        const inspDate = new Date(insp.date);
        const monthsRemaining = 9 - entry.mesesPrene;
        const expectedBirth = new Date(inspDate);
        expectedBirth.setMonth(expectedBirth.getMonth() + monthsRemaining);
        const dryOffDate = new Date(expectedBirth);
        dryOffDate.setDate(dryOffDate.getDate() - 60);
        const today = new Date();
        const daysUntilDryOff = Math.round((dryOffDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          mesesPrene: entry.mesesPrene,
          inspDate: insp.date,
          expectedBirth: expectedBirth.toISOString().slice(0, 10),
          dryOffDate: dryOffDate.toISOString().slice(0, 10),
          daysUntilDryOff,
        };
      }
    }
    return null;
  })();

  function saveBirthDate() {
    if (!cow) return;
    updateCow(cow.id, { birthDate: birthDate || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    loadAll();
  }

  if (!cow) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>Cow {cowId} not found.</p>
        <button onClick={() => router.back()} className="mt-2 text-green-600 underline text-sm">{T.back}</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="text-green-600 text-sm hover:underline">← {T.back}</button>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h1 className="text-xl font-bold text-green-800">{T.cowDetail}: #{cow.id}</h1>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">{T.breed}:</span> <strong>{cow.breedType}</strong></div>
          <div><span className="text-gray-500">{T.farm}:</span> <strong>{getFarmName(cow.farmId)}</strong></div>
          <div><span className="text-gray-500">{T.status}:</span> <strong>{cow.currentStatus || '—'}</strong></div>
          <div><span className="text-gray-500">{T.birthDate}:</span> <strong>{cow.birthDate || '—'}</strong></div>
        </div>
        {/* Birth date edit */}
        <div className="mt-3 flex gap-2 items-center">
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={saveBirthDate}
            className="bg-green-700 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-green-800 transition"
          >
            {saved ? T.saved : T.save}
          </button>
        </div>
      </div>

      {/* Pregnancy Alert */}
      {pregnancyAlert && (
        <div className={`rounded-xl shadow p-4 border-2 ${pregnancyAlert.daysUntilDryOff <= 14 ? 'bg-red-50 border-red-400' : pregnancyAlert.daysUntilDryOff <= 30 ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-300'}`}>
          <h2 className="font-semibold text-gray-800 mb-2">🐄 {lang === 'es' ? 'Preñez' : 'Pregnancy'}</h2>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-500">{lang === 'es' ? 'Meses preñada (última inspección)' : 'Months pregnant (last inspection)'}:</span> <strong>{pregnancyAlert.mesesPrene} / 9</strong></p>
            <p><span className="text-gray-500">{lang === 'es' ? 'Parto estimado' : 'Expected birth'}:</span> <strong>{pregnancyAlert.expectedBirth}</strong></p>
            <p><span className="text-gray-500">{lang === 'es' ? 'Fecha de secado' : 'Dry-off date'}:</span> <strong>{pregnancyAlert.dryOffDate}</strong></p>
            <p className={`font-bold mt-1 ${pregnancyAlert.daysUntilDryOff <= 0 ? 'text-red-700' : pregnancyAlert.daysUntilDryOff <= 14 ? 'text-red-600' : pregnancyAlert.daysUntilDryOff <= 30 ? 'text-yellow-700' : 'text-blue-700'}`}>
              {pregnancyAlert.daysUntilDryOff <= 0
                ? (lang === 'es' ? '⚠️ Esta vaca debe estar seca ahora' : '⚠️ This cow should be dry now')
                : `${lang === 'es' ? '📅 Días para secar' : '📅 Days until dry-off'}: ${pregnancyAlert.daysUntilDryOff}`}
            </p>
          </div>
        </div>
      )}

      {/* Inspection History */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-green-700 mb-2">{T.history}</h2>
        {cowInspections.length === 0 ? (
          <p className="text-gray-400 text-sm">{T.noHistory}</p>
        ) : (
          <div className="space-y-2">
            {cowInspections.map(insp => {
              const entry = insp.entries.find(e => e.cowIds.includes(cowId));
              return (
                <div key={insp.id} className="border border-gray-100 rounded-lg p-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{insp.date}</span>
                    <span className="font-medium text-green-700">{getFarmName(insp.farmId)}</span>
                  </div>
                  {entry && (
                    <div className="mt-1">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 font-semibold">
                        {entry.status}
                        {entry.mesesPrene !== undefined ? ` (${entry.mesesPrene} ${T.meses})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Movements */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-green-700 mb-2">{T.movements}</h2>
        {cowMovements.length === 0 ? (
          <p className="text-gray-400 text-sm">{T.noMovements}</p>
        ) : (
          <div className="space-y-2">
            {cowMovements.map(mv => (
              <div key={mv.id} className="border border-gray-100 rounded-lg p-2 text-sm flex items-center gap-2">
                <span className="text-gray-500">{mv.date}</span>
                <span className="text-gray-700">{getFarmName(mv.fromFarmId)}</span>
                <span className="text-green-500">→</span>
                <span className="text-green-700 font-medium">{getFarmName(mv.toFarmId)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
