'use client';

import { useEffect, useState } from 'react';
import { getFarms, getCows, addInspection, getLanguage, getStatuses, Farm, Cow } from '@/lib/store';
import { t } from '@/lib/translations';

type StatusGroup = {
  status: string;
  cowIds: string[];
  mesesPrene?: number;
};

export default function InspectionPage() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [allCows, setAllCows] = useState<Cow[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [farmId, setFarmId] = useState('');
  const [groups, setGroups] = useState<StatusGroup[]>([]);
  const [saved, setSaved] = useState(false);
  const [cowSearch, setCowSearch] = useState<Record<string, string>>({});

  function loadAll() {
    setFarms(getFarms());
    setAllCows(getCows());
    setStatuses(getStatuses());
    setLang(getLanguage());
  }

  useEffect(() => {
    loadAll();
    const handler = () => setLang(getLanguage());
    window.addEventListener('languagechange', handler);
    return () => window.removeEventListener('languagechange', handler);
  }, []);

  useEffect(() => {
    if (statuses.length > 0) {
      setGroups(statuses.map(s => ({ status: s, cowIds: [], mesesPrene: undefined })));
    }
  }, [statuses]);

  const T = t[lang];
  const farmCows = allCows.filter(c => c.farmId === farmId);

  function toggleCow(status: string, cowId: string) {
    setGroups(prev => prev.map(g => {
      if (g.status !== status) return g;
      const ids = g.cowIds.includes(cowId)
        ? g.cowIds.filter(id => id !== cowId)
        : [...g.cowIds, cowId];
      return { ...g, cowIds: ids };
    }));
  }

  function setMeses(status: string, val: string) {
    setGroups(prev => prev.map(g =>
      g.status === status ? { ...g, mesesPrene: val ? Number(val) : undefined } : g
    ));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entries = groups
      .filter(g => g.cowIds.length > 0)
      .map(g => ({
        cowIds: g.cowIds,
        status: g.status,
        ...(g.mesesPrene !== undefined ? { mesesPrene: g.mesesPrene } : {}),
      }));
    if (!farmId || entries.length === 0) return;
    addInspection({ date, farmId, entries });
    setSaved(true);
    setGroups(statuses.map(s => ({ status: s, cowIds: [], mesesPrene: undefined })));
    setTimeout(() => setSaved(false), 3000);
  }

  const getFilteredCows = (status: string) => {
    const q = cowSearch[status]?.toLowerCase() || '';
    return farmCows.filter(c => !q || c.id.includes(q));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-green-800">{T.newInspection}</h1>

      {saved && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-2 rounded-lg text-sm">
          {T.inspectionSaved}
        </div>
      )}

      {farms.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          {T.noFarms}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date + Farm */}
          <div className="bg-white rounded-xl shadow p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{T.date}</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{T.selectFarm}</label>
              <select
                value={farmId}
                onChange={e => setFarmId(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">{T.selectFarm}</option>
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{f.location || f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Groups */}
          {farmId && (
            <div className="space-y-3">
              {farmCows.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-2">{T.noCowsInFarm}</div>
              )}
              {groups.map(group => (
                <div key={group.status} className="bg-white rounded-xl shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-green-800 text-sm">{group.status}</span>
                    {group.cowIds.length > 0 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        {group.cowIds.length} {T.cowsCount}
                      </span>
                    )}
                  </div>

                  {/* Special meses field for PRENE status */}
                  {group.status === 'PRENE' && (
                    <div className="mb-2">
                      <label className="block text-xs text-gray-500 mb-1">{T.mesesPrene}</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={group.mesesPrene ?? ''}
                        onChange={e => setMeses(group.status, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}

                  {/* Cow search */}
                  <input
                    type="text"
                    placeholder={T.selectCows}
                    value={cowSearch[group.status] || ''}
                    onChange={e => setCowSearch(prev => ({ ...prev, [group.status]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />

                  {/* Cow multi-select grid */}
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {getFilteredCows(group.status).map(cow => {
                      const selected = group.cowIds.includes(cow.id);
                      return (
                        <button
                          key={cow.id}
                          type="button"
                          onClick={() => toggleCow(group.status, cow.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold border-2 transition-colors shadow-sm ${
                            selected
                              ? 'bg-green-600 text-white border-green-600 shadow-md'
                              : 'bg-white text-gray-800 border-gray-400 hover:border-green-500 hover:bg-green-50'
                          }`}
                        >
                          {cow.id}
                        </button>
                      );
                    })}
                    {getFilteredCows(group.status).length === 0 && (
                      <span className="text-xs text-gray-400 py-1">{farmCows.length === 0 ? T.noCowsInFarm : 'No match'}</span>
                    )}
                  </div>

                  {/* Selected summary */}
                  {group.cowIds.length > 0 && (
                    <div className="mt-2 text-xs text-green-700 font-medium">
                      ✓ {group.cowIds.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {farmId && (
            <button
              type="submit"
              disabled={saved}
              className={`w-full font-bold py-3 rounded-xl transition shadow text-white ${
                saved ? 'bg-green-500 cursor-default' : 'bg-green-700 hover:bg-green-800'
              }`}
            >
              {saved ? '✓ Submission Successful' : T.submit}
            </button>
          )}
        </form>
      )}
    </div>
  );
}
