export type Gender = 'M' | 'F' | '';

export interface Student {
  id: string;
  prenoms: string;
  noms: string;
  sexe: Gender;
  d1: number | '';
  d2: number | '';
  d3: number | '';
  moyDev: number; // Read-only, calculated
  comp: number | '';
  moyenne: number; // Read-only, calculated
  moyCoef: number; // Read-only, calculated
  moyG?: number; // Read-only, calculated (S2 only)
  rang: number; // Read-only, calculated
  mention: string; // Read-only, calculated
}

export interface ClassMetadata {
  discipline: string;
  classe: string;
  semester: number;
  professeur: string;
  coefficient: number;
}

export interface ClassStats {
  totalStudents: number;
  passCount: number; // >= 10
  failCount: number; // < 10
  femaleCount: number;
  maleCount: number;
  femalePassCount: number;
  malePassCount: number;
  classAverage: number;
}

export type AppDB = Record<string, { metadata: ClassMetadata; students: Student[] }>;
