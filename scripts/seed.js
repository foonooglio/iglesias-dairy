const fs = require('fs');

const farms = [
  { id: 'farm1', name: 'Finca Norte', location: 'Arecibo' },
  { id: 'farm2', name: 'Finca Sur', location: 'Ponce' },
  { id: 'farm3', name: 'Finca Este', location: 'Humacao' }
];

const breeds = ['Holstein', 'Jersey', 'Brown Swiss'];
const statuses = ['CELO', 'VACIO', 'HORRAR', 'PARIDA', 'ENFERMA', 'ABORTA', 'MUERTE', 'NUEVA VACA'];
const mesesPreneStatuses = ['# MESES PRENE'];

// 40 cows per farm, IDs 1-40, 41-80, 81-120
const cows = [];
for (let i = 1; i <= 120; i++) {
  const farmIndex = i <= 40 ? 0 : i <= 80 ? 1 : 2;
  cows.push({
    id: String(i),
    breedType: breeds[Math.floor(Math.random() * breeds.length)],
    farmId: farms[farmIndex].id,
    birthDate: `201${Math.floor(Math.random() * 9)}-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    currentStatus: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: '2023-01-01T00:00:00.000Z'
  });
}

// Generate inspections - at least 3 per cow
// We'll create monthly inspections for Jan, Feb, Mar, Apr, May 2024
const inspections = [];
const inspDates = ['2024-01-15', '2024-02-15', '2024-03-15', '2024-04-15', '2024-05-15'];

for (const farm of farms) {
  const farmCows = cows.filter(c => c.farmId === farm.id);
  
  for (const date of inspDates) {
    const entries = [];
    // Shuffle cows and assign random statuses in groups
    const shuffled = [...farmCows].sort(() => Math.random() - 0.5);
    let i = 0;
    while (i < shuffled.length) {
      const groupSize = Math.floor(Math.random() * 5) + 1;
      const group = shuffled.slice(i, i + groupSize);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      entries.push({
        cowIds: group.map(c => c.id),
        status: status,
        mesesPrene: status === '# MESES PRENE' ? Math.floor(Math.random() * 9) + 1 : undefined
      });
      i += groupSize;
    }
    
    inspections.push({
      id: `insp_${farm.id}_${date.replace(/-/g, '')}`,
      date: date,
      farmId: farm.id,
      entries: entries
    });
  }
}

// Update currentStatus for each cow to match most recent inspection
for (const cow of cows) {
  // Find most recent inspection entry for this cow
  const allEntries = inspections.flatMap(insp => 
    insp.entries
      .filter(e => e.cowIds.includes(cow.id))
      .map(e => ({ date: insp.date, status: e.status }))
  );
  if (allEntries.length > 0) {
    allEntries.sort((a, b) => b.date.localeCompare(a.date));
    cow.currentStatus = allEntries[0].status;
  }
}

const seedData = {
  iglesias_farms: farms,
  iglesias_cows: cows,
  iglesias_inspections: inspections,
  iglesias_movements: [],
  iglesias_breeds: breeds,
  iglesias_statuses: statuses,
  iglesias_dashboard_config: {
    showTotalCows: true,
    showTotalFarms: true,
    statusCounts: ['CELO', 'HORRAR', 'PARIDA', 'ENFERMA']
  }
};

fs.writeFileSync('public/seed-data.json', JSON.stringify(seedData, null, 2));
console.log('Seed data written to public/seed-data.json');
console.log('Farms:', farms.length);
console.log('Cows:', cows.length);
console.log('Inspections:', inspections.length);
