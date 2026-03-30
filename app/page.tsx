'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getCows, getFarms, getDashboardConfig, getLastInspectionDate, getLanguage,
  Cow, Farm, DashboardConfig,
} from '@/lib/store';
import { t } from '@/lib/translations';

export default function Dashboard() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [cows, setCows] = useState<Cow[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [config, setConfig] = useState<DashboardConfig>({ showTotalCows: true, showTotalFarms: true, statusCounts: [] });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  function loadAll() {
    setCows(getCows());
    setFarms(getFarms());
    setConfig(getDashboardConfig());
    setLang(getLanguage());
  }

  useEffect(() => {
    loadAll();
    const handler = () => { setLang(getLanguage()); };
    window.addEventListener('languagechange', handler);
    return () => window.removeEventListener('languagechange', handler);
  }, []);

  const T = t[lang];

  const allStatuses = Array.from(new Set(cows.map(c => c.currentStatus).filter(Boolean)));

  const filtered = cows.filter(cow => {
    const farm = farms.find(f => f.id === cow.farmId);
    const matchSearch =
      !search ||
      cow.id.toLowerCase().includes(search.toLowerCase()) ||
      (farm?.location.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (farm?.name.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = !statusFilter || cow.currentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const getFarmName = (farmId: string) => {
    const f = farms.find(f => f.id === farmId);
    return f ? f.location || f.name : '—';
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {config.showTotalCows && (
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-600">
            <div className="text-2xl font-bold text-green-700">{filtered.length}</div>
            <div className="text-xs text-gray-500 font-semibold mt-1">{T.totalCows}</div>
          </div>
        )}
        {config.showTotalFarms && (
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-700">{farms.length}</div>
            <div className="text-xs text-gray-500 font-semibold mt-1">{T.totalFarms}</div>
          </div>
        )}
        {config.statusCounts.map(status => (
          <div key={status} className="bg-white rounded-xl shadow p-4 border-l-4 border-green-400">
            <div className="text-2xl font-bold text-green-700">
              {filtered.filter(c => c.currentStatus === status).length}
            </div>
            <div className="text-xs text-gray-500 font-semibold mt-1">{status}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={T.searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">{T.allStatuses}</option>
          {allStatuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Cow Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">{T.noCows}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">{T.cowId}</th>
                  <th className="px-3 py-2 text-left font-semibold">{T.breed}</th>
                  <th className="px-3 py-2 text-left font-semibold">{T.farm}</th>
                  <th className="px-3 py-2 text-left font-semibold">{T.status}</th>
                  <th className="px-3 py-2 text-left font-semibold">{T.lastInspection}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cow, i) => {
                  const lastDate = getLastInspectionDate(cow.id);
                  return (
                    <tr key={cow.id} className={i % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                      <td className="px-3 py-2">
                        <Link href={`/cows/${cow.id}`} className="text-green-700 font-semibold hover:underline">
                          {cow.id}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-gray-600">{cow.breedType}</td>
                      <td className="px-3 py-2 text-gray-600">{getFarmName(cow.farmId)}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {cow.currentStatus || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs">
                        {lastDate ? lastDate.slice(0, 10) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
