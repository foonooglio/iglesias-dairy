'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getCows, getFarms, getBreeds, addCow, getMovements, addMovement, getLanguage,
  Cow, Farm, CowMovement,
} from '@/lib/store';
import { t } from '@/lib/translations';

export default function CowsPage() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [cows, setCows] = useState<Cow[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [breeds, setBreeds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  // Add cow form
  const [bulkIds, setBulkIds] = useState('');
  const [newFarmId, setNewFarmId] = useState('');
  const [newBreed, setNewBreed] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  // Transfer form
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferIds, setTransferIds] = useState('');
  const [toFarmId, setToFarmId] = useState('');
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [transferError, setTransferError] = useState('');

  function loadAll() {
    setCows(getCows());
    setFarms(getFarms());
    setBreeds(getBreeds());
    setLang(getLanguage());
  }

  useEffect(() => {
    loadAll();
    const handler = () => setLang(getLanguage());
    window.addEventListener('languagechange', handler);
    return () => window.removeEventListener('languagechange', handler);
  }, []);

  const T = t[lang];

  function parseIds(raw: string): string[] {
    const ids: string[] = [];
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr.trim(), 10);
        const end = parseInt(endStr.trim(), 10);
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          for (let i = start; i <= end; i++) ids.push(String(i));
        }
      } else {
        if (part) ids.push(part);
      }
    }
    return [...new Set(ids)];
  }

  function handleAddCows(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    if (!newFarmId) { setAddError(T.selectFarmReq); return; }
    if (!newBreed) { setAddError(T.selectBreedReq); return; }
    const ids = parseIds(bulkIds);
    if (ids.length === 0) { setAddError(T.enterIds); return; }
    const existingIds = new Set(cows.map(c => c.id));
    const dupes = ids.filter(id => existingIds.has(id));
    if (dupes.length > 0) { setAddError(`${T.idAlreadyExists}: ${dupes.join(', ')}`); return; }
    for (const id of ids) {
      addCow({
        id,
        breedType: newBreed,
        farmId: newFarmId,
        birthDate: newBirthDate || undefined,
        currentStatus: '',
      });
    }
    setAddSuccess(`✓ ${ids.length} ${T.cowsCount}`);
    setBulkIds('');
    setNewBirthDate('');
    loadAll();
    setTimeout(() => setAddSuccess(''), 3000);
  }

  function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setTransferError('');
    const ids = parseIds(transferIds);
    if (!ids.length || !toFarmId) return;

    const registeredIds = new Set(cows.map(c => c.id));
    const unregistered = ids.filter(id => !registeredIds.has(id));
    if (unregistered.length > 0) {
      setTransferError(`Cow IDs not registered: ${unregistered.join(', ')}`);
      return;
    }

    for (const cowId of ids) {
      const cow = cows.find(c => c.id === cowId);
      if (cow && cow.farmId !== toFarmId) {
        addMovement({ cowId, fromFarmId: cow.farmId, toFarmId, date: transferDate });
      }
    }
    setTransferIds('');
    setShowTransfer(false);
    loadAll();
  }

  const getFarmName = (farmId: string) => {
    const f = farms.find(f => f.id === farmId);
    return f ? f.location || f.name : '—';
  };

  const filtered = cows.filter(cow => {
    if (!search) return true;
    const farm = farms.find(f => f.id === cow.farmId);
    return (
      cow.id.toLowerCase().includes(search.toLowerCase()) ||
      (farm?.location.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (farm?.name.toLowerCase().includes(search.toLowerCase()) ?? false)
    );
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-green-800">{T.cowManagement}</h1>

      {/* Add Cows Form */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold text-green-700 mb-3">{T.addCows}</h2>
        <form onSubmit={handleAddCows} className="space-y-2">
          <input
            type="text"
            placeholder={T.bulkIds}
            value={bulkIds}
            onChange={e => setBulkIds(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={newFarmId}
            onChange={e => setNewFarmId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">{T.selectFarm}</option>
            {farms.map(f => <option key={f.id} value={f.id}>{f.location || f.name}</option>)}
          </select>
          <select
            value={newBreed}
            onChange={e => setNewBreed(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">{T.selectBreed}</option>
            {breeds.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <input
            type="date"
            value={newBirthDate}
            onChange={e => setNewBirthDate(e.target.value)}
            placeholder={T.birthDate}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {addError && <p className="text-red-600 text-xs">{addError}</p>}
          {addSuccess && <p className="text-green-600 text-xs font-semibold">{addSuccess}</p>}
          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 rounded-lg transition"
          >
            {T.add}
          </button>
        </form>
      </div>

      {/* Transfer */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-green-700">{T.transferCows}</h2>
          <button
            onClick={() => setShowTransfer(!showTransfer)}
            className="text-xs text-green-600 border border-green-600 px-3 py-1 rounded-full"
          >
            {showTransfer ? T.cancel : T.transfer}
          </button>
        </div>
        {showTransfer && (
          <form onSubmit={handleTransfer} className="mt-3 space-y-2">
            <p className="text-xs text-gray-500">Enter registered cow IDs (e.g. 1,2,3 or 10-20). The system will automatically detect each cow&apos;s current farm.</p>
            <input
              type="text"
              placeholder={T.bulkIds}
              value={transferIds}
              onChange={e => setTransferIds(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={toFarmId}
              onChange={e => setToFarmId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">{T.toFarm}</option>
              {farms.map(f => <option key={f.id} value={f.id}>{f.location || f.name}</option>)}
            </select>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Transfer date (record of when move occurred)</label>
              <input
                type="date"
                value={transferDate}
                onChange={e => setTransferDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {transferError && <p className="text-red-600 text-xs">{transferError}</p>}
            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 rounded-lg transition"
            >
              {T.transfer}
            </button>
          </form>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={T.searchPlaceholder}
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {/* Cow List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">{T.noCows}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-3 py-2 text-left">{T.cowId}</th>
                  <th className="px-3 py-2 text-left">{T.breed}</th>
                  <th className="px-3 py-2 text-left">{T.farm}</th>
                  <th className="px-3 py-2 text-left">{T.status}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cow, i) => (
                  <tr key={cow.id} className={i % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                    <td className="px-3 py-2">
                      <Link href={`/cows/${cow.id}`} className="inline-block bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded border border-green-300 hover:bg-green-200 transition text-xs">
                        #{cow.id} →
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{cow.breedType}</td>
                    <td className="px-3 py-2 text-gray-600">{getFarmName(cow.farmId)}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        {cow.currentStatus || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
