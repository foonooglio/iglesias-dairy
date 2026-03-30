'use client';
import { useEffect, useState } from 'react';

export default function SeedLoader() {
  const [loaded, setLoaded] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem('iglesias_farms');
    if (existing) {
      setLoaded(true);
      return;
    }
    // Load seed data
    fetch('/seed-data.json')
      .then(r => r.json())
      .then(data => {
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
        setSeeded(true);
        setLoaded(true);
        window.location.reload();
      });
  }, []);

  if (!loaded) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="text-green-600 text-2xl mb-2">🐄</div>
        <p className="text-gray-600">{seeded ? 'Loading demo data...' : 'Loading...'}</p>
      </div>
    </div>
  );

  return null;
}
