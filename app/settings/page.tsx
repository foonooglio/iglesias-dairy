'use client';

import { useEffect, useState } from 'react';
import {
  getFarms, addFarm, removeFarm,
  getBreeds, saveBreeds,
  getStatuses, saveStatuses,
  getDashboardConfig, saveDashboardConfig,
  getLanguage, saveLanguage,
  DashboardConfig,
} from '@/lib/store';
import { t } from '@/lib/translations';

export default function SettingsPage() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [farms, setFarms] = useState<{ id: string; name: string; location: string }[]>([]);
  const [breeds, setBreeds] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [config, setConfig] = useState<DashboardConfig>({ showTotalCows: true, showTotalFarms: true, statusCounts: [] });
  // Farm form
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  // Breed form
  const [newBreed, setNewBreed] = useState('');
  // Status form
  const [newStatus, setNewStatus] = useState('');

  function loadAll() {
    setFarms(getFarms());
    setBreeds(getBreeds());
    setStatuses(getStatuses());
    setConfig(getDashboardConfig());
    setLang(getLanguage());
  }

  useEffect(() => {
    loadAll();
    const handler = () => setLang(getLanguage());
    window.addEventListener('languagechange', handler);
    return () => window.removeEventListener('languagechange', handler);
  }, []);

  const T = t[lang];

  function handleAddFarm(e: React.FormEvent) {
    e.preventDefault();
    if (!farmLocation.trim()) return;
    addFarm(farmName.trim() || farmLocation.trim(), farmLocation.trim());
    setFarmName('');
    setFarmLocation('');
    loadAll();
  }

  function handleRemoveFarm(id: string) {
    removeFarm(id);
    loadAll();
  }

  function handleAddBreed(e: React.FormEvent) {
    e.preventDefault();
    if (!newBreed.trim() || breeds.includes(newBreed.trim())) return;
    saveBreeds([...breeds, newBreed.trim()]);
    setNewBreed('');
    loadAll();
  }

  function handleRemoveBreed(b: string) {
    saveBreeds(breeds.filter(br => br !== b));
    loadAll();
  }

  function handleAddStatus(e: React.FormEvent) {
    e.preventDefault();
    const val = newStatus.trim().toUpperCase();
    if (!val || statuses.includes(val)) return;
    saveStatuses([...statuses, val]);
    setNewStatus('');
    loadAll();
  }

  function handleRemoveStatus(s: string) {
    saveStatuses(statuses.filter(st => st !== s));
    loadAll();
  }

  function updateConfig(updates: Partial<DashboardConfig>) {
    const next = { ...config, ...updates };
    setConfig(next);
    saveDashboardConfig(next);
  }

  function toggleStatusCount(status: string) {
    const current = config.statusCounts;
    const next = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    updateConfig({ statusCounts: next });
  }

  function switchLang(l: 'es' | 'en') {
    saveLanguage(l);
    setLang(l);
    window.dispatchEvent(new Event('languagechange'));
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-green-800">{T.settingsTitle}</h1>

      {/* Language */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-green-700 mb-3">{T.language}</h2>
        <div className="flex gap-3">
          <button
            onClick={() => switchLang('es')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
              lang === 'es' ? 'bg-green-700 text-white border-green-700' : 'border-gray-300 text-gray-600'
            }`}
          >
            🇵🇷 {T.spanish}
          </button>
          <button
            onClick={() => switchLang('en')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
              lang === 'en' ? 'bg-green-700 text-white border-green-700' : 'border-gray-300 text-gray-600'
            }`}
          >
            🇺🇸 {T.english}
          </button>
        </div>
      </section>

      {/* Farms */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-green-700 mb-3">{T.farms}</h2>
        <form onSubmit={handleAddFarm} className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder={T.farmName}
            value={farmName}
            onChange={e => setFarmName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder={T.farmLocation}
            value={farmLocation}
            onChange={e => setFarmLocation(e.target.value)}
            required
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-700 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-800 transition"
          >
            {T.add}
          </button>
        </form>
        <div className="space-y-1">
          {farms.map(f => (
            <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm"><strong>{f.location}</strong> {f.name !== f.location && <span className="text-gray-400">({f.name})</span>}</span>
              <button
                onClick={() => handleRemoveFarm(f.id)}
                className="text-red-400 hover:text-red-600 text-xs ml-2"
              >
                ✕
              </button>
            </div>
          ))}
          {farms.length === 0 && <p className="text-gray-400 text-xs">{T.noFarms}</p>}
        </div>
      </section>

      {/* Breeds */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-green-700 mb-3">{T.breeds}</h2>
        <form onSubmit={handleAddBreed} className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder={T.addBreed}
            value={newBreed}
            onChange={e => setNewBreed(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-700 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-800 transition"
          >
            {T.add}
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {breeds.map(b => (
            <span key={b} className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-sm">
              {b}
              <button onClick={() => handleRemoveBreed(b)} className="text-red-400 hover:text-red-600 ml-1 text-xs">✕</button>
            </span>
          ))}
        </div>
      </section>

      {/* Statuses */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-green-700 mb-3">{T.statuses}</h2>
        <form onSubmit={handleAddStatus} className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder={T.addStatus}
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-700 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-800 transition"
          >
            {T.add}
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {statuses.map(s => (
            <span key={s} className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-sm font-semibold">
              {s}
              <button onClick={() => handleRemoveStatus(s)} className="text-red-400 hover:text-red-600 ml-1 text-xs">✕</button>
            </span>
          ))}
        </div>
      </section>

      {/* Dashboard Config */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-green-700 mb-3">{T.dashboardConfig}</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showTotalCows}
              onChange={e => updateConfig({ showTotalCows: e.target.checked })}
              className="w-4 h-4 accent-green-600"
            />
            <span className="text-sm">{T.showTotalCowsLabel}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.showTotalFarms}
              onChange={e => updateConfig({ showTotalFarms: e.target.checked })}
              className="w-4 h-4 accent-green-600"
            />
            <span className="text-sm">{T.showTotalFarmsLabel}</span>
          </label>
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-2">{T.showStatusCounts}:</p>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => (
                <label key={s} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.statusCounts.includes(s)}
                    onChange={() => toggleStatusCount(s)}
                    className="w-3.5 h-3.5 accent-green-600"
                  />
                  <span className="text-xs font-semibold">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
