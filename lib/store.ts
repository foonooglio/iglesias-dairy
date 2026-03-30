// lib/store.ts - All data types and localStorage functions

export type Farm = {
  id: string;
  name: string;
  location: string;
};

export type Cow = {
  id: string; // user-assigned number as string
  breedType: string;
  farmId: string;
  birthDate?: string; // ISO date string
  currentStatus: string;
  createdAt: string; // ISO date string
};

export type InspectionEntry = {
  cowIds: string[];
  status: string;
  mesesPrene?: number;
};

export type Inspection = {
  id: string;
  date: string; // ISO date string
  farmId: string;
  entries: InspectionEntry[];
};

export type CowMovement = {
  id: string;
  cowId: string;
  fromFarmId: string;
  toFarmId: string;
  date: string; // ISO date string
};

export type DashboardConfig = {
  showTotalCows: boolean;
  showTotalFarms: boolean;
  statusCounts: string[]; // which statuses to show count for
};

// Keys
const FARMS_KEY = 'iglesias_farms';
const COWS_KEY = 'iglesias_cows';
const INSPECTIONS_KEY = 'iglesias_inspections';
const MOVEMENTS_KEY = 'iglesias_movements';
const BREEDS_KEY = 'iglesias_breeds';
const STATUSES_KEY = 'iglesias_statuses';
const DASHBOARD_CONFIG_KEY = 'iglesias_dashboard_config';
const LANGUAGE_KEY = 'iglesias_language';

function getJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// --- Farms ---
export function getFarms(): Farm[] {
  return getJSON<Farm[]>(FARMS_KEY, []);
}
export function saveFarms(farms: Farm[]): void {
  setJSON(FARMS_KEY, farms);
}
export function addFarm(name: string, location: string): Farm {
  const farm: Farm = { id: uuid(), name, location };
  const farms = getFarms();
  farms.push(farm);
  saveFarms(farms);
  return farm;
}
export function removeFarm(id: string): void {
  saveFarms(getFarms().filter(f => f.id !== id));
}

// --- Cows ---
export function getCows(): Cow[] {
  return getJSON<Cow[]>(COWS_KEY, []);
}
export function saveCows(cows: Cow[]): void {
  setJSON(COWS_KEY, cows);
}
export function addCow(data: Omit<Cow, 'createdAt'>): Cow {
  const cow: Cow = { ...data, createdAt: new Date().toISOString() };
  const cows = getCows();
  cows.push(cow);
  saveCows(cows);
  return cow;
}
export function updateCow(id: string, updates: Partial<Cow>): void {
  const cows = getCows().map(c => (c.id === id ? { ...c, ...updates } : c));
  saveCows(cows);
}
export function removeCow(id: string): void {
  saveCows(getCows().filter(c => c.id !== id));
}

// --- Inspections ---
export function getInspections(): Inspection[] {
  return getJSON<Inspection[]>(INSPECTIONS_KEY, []);
}
export function saveInspections(inspections: Inspection[]): void {
  setJSON(INSPECTIONS_KEY, inspections);
}
export function addInspection(data: Omit<Inspection, 'id'>): Inspection {
  const inspection: Inspection = { ...data, id: uuid() };
  const inspections = getInspections();
  inspections.push(inspection);
  saveInspections(inspections);
  // Update cow statuses
  const cows = getCows();
  for (const entry of data.entries) {
    for (const cowId of entry.cowIds) {
      const idx = cows.findIndex(c => c.id === cowId);
      if (idx !== -1) {
        cows[idx] = { ...cows[idx], currentStatus: entry.status };
      }
    }
  }
  saveCows(cows);
  return inspection;
}

// --- Movements ---
export function getMovements(): CowMovement[] {
  return getJSON<CowMovement[]>(MOVEMENTS_KEY, []);
}
export function saveMovements(movements: CowMovement[]): void {
  setJSON(MOVEMENTS_KEY, movements);
}
export function addMovement(data: Omit<CowMovement, 'id'>): CowMovement {
  const movement: CowMovement = { ...data, id: uuid() };
  const movements = getMovements();
  movements.push(movement);
  saveMovements(movements);
  // Update cow's farm
  updateCow(data.cowId, { farmId: data.toFarmId });
  return movement;
}

// --- Breeds ---
const DEFAULT_BREEDS = ['Holstein', 'Jersey', 'Brown Swiss', 'Guernsey', 'Ayrshire'];
export function getBreeds(): string[] {
  return getJSON<string[]>(BREEDS_KEY, DEFAULT_BREEDS);
}
export function saveBreeds(breeds: string[]): void {
  setJSON(BREEDS_KEY, breeds);
}

// --- Statuses ---
const DEFAULT_STATUSES = ['CELO', 'VACIO', 'HORRAR', 'PARIDA', 'ENFERMA', 'ABORTA', 'MUERTE', 'NUEVA VACA', 'PRENE'];
export function getStatuses(): string[] {
  return getJSON<string[]>(STATUSES_KEY, DEFAULT_STATUSES);
}
export function saveStatuses(statuses: string[]): void {
  setJSON(STATUSES_KEY, statuses);
}

// --- Dashboard Config ---
const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  showTotalCows: true,
  showTotalFarms: true,
  statusCounts: ['CELO', 'PARIDA', 'ENFERMA'],
};
export function getDashboardConfig(): DashboardConfig {
  return getJSON<DashboardConfig>(DASHBOARD_CONFIG_KEY, DEFAULT_DASHBOARD_CONFIG);
}
export function saveDashboardConfig(config: DashboardConfig): void {
  setJSON(DASHBOARD_CONFIG_KEY, config);
}

// --- Language ---
export function getLanguage(): 'es' | 'en' {
  return getJSON<'es' | 'en'>(LANGUAGE_KEY, 'es');
}
export function saveLanguage(lang: 'es' | 'en'): void {
  setJSON(LANGUAGE_KEY, lang);
}

// --- Helpers ---
export function getLastInspectionDate(cowId: string): string | null {
  const inspections = getInspections();
  let lastDate: string | null = null;
  for (const insp of inspections) {
    for (const entry of insp.entries) {
      if (entry.cowIds.includes(cowId)) {
        if (!lastDate || insp.date > lastDate) {
          lastDate = insp.date;
        }
      }
    }
  }
  return lastDate;
}
