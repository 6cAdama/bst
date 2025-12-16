import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import MetadataForm from './components/MetadataForm';
import GradeTable from './components/GradeTable';
import StatisticsPanel from './components/StatisticsPanel';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { Student, ClassMetadata, ClassStats, AppDB } from './types';
import { generateInitialStudents, recalculateGrades, exportToExcel, exportFullDbToExcel, exportToWord, calculateClassStats, CLASS_OPTIONS, SUBJECT_OPTIONS } from './utils';

const App: React.FC = () => {
  // --- View State ---
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  
  // --- Data State ---
  const [db, setDb] = useState<AppDB>({});
  
  // The currently selected Sheet ID (e.g., '3T1_SVT_S1')
  const [currentSheetId, setCurrentSheetId] = useState<string>('');

  // --- PWA Install State ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // We've used the prompt, and can't use it again, throw it away
    if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallButton(false);
    }
  };

  // --- Initialization ---
  useEffect(() => {
    // We use v3 key because the structure changed (S1/S2 split)
    const saved = localStorage.getItem('gestclasse_db_v3'); 
    if (saved) {
      try {
        setDb(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load data", e);
        initializeEmptyDb();
      }
    } else {
      initializeEmptyDb();
    }
  }, []);

  const initializeEmptyDb = () => {
    const newDb: AppDB = {};
    CLASS_OPTIONS.forEach(cls => {
      SUBJECT_OPTIONS.forEach(subj => {
        // Initialize for Semester 1 and Semester 2
        [1, 2].forEach(sem => {
            const key = `${cls}_${subj}_S${sem}`;
            newDb[key] = {
              metadata: {
                classe: cls,
                discipline: subj,
                semester: sem,
                professeur: '',
                coefficient: 1,
              },
              students: generateInitialStudents(100) // Initialize with 100 slots
            };
        });
      });
    });
    setDb(newDb);
  };

  // --- Derived State for Current Sheet ---
  const currentData = useMemo(() => {
    if (!currentSheetId || !db[currentSheetId]) return null;
    return db[currentSheetId];
  }, [db, currentSheetId]);

  const calculatedStudents = useMemo(() => {
    if (!currentData) return [];
    
    // If we are in Semester 2, we need to fetch Semester 1 data to calculate MoyG
    let s1Students: Student[] = [];
    if (currentData.metadata.semester === 2) {
        // Construct S1 Key: e.g., '3T1_SVT_S2' -> '3T1_SVT_S1'
        const s1Key = currentSheetId.replace('_S2', '_S1');
        if (db[s1Key]) {
            // We use the already computed averages stored in DB (or recompute if needed, 
            // but DB should have 'moyenne' property if saved). 
            // recalculateGrades will access 'moyenne' from these student objects.
            // Note: If S1 was never opened/saved, defaults are used.
            // For robustness, we could run recalculateGrades on S1 data too, but let's assume raw data is okay for now
            // or perform a quick recalc on S1 to ensure 'moyenne' is accurate to current inputs.
            const s1Raw = db[s1Key].students;
            const s1Meta = db[s1Key].metadata;
            // Quick recalc of S1 to ensure 'moyenne' is up to date with d1/d2/d3 inputs
            s1Students = recalculateGrades(s1Raw, s1Meta.coefficient); 
        }
    }

    return recalculateGrades(currentData.students, currentData.metadata.coefficient, s1Students);
  }, [currentData, db, currentSheetId]);

  const stats: ClassStats = useMemo(() => {
    return calculateClassStats(calculatedStudents);
  }, [calculatedStudents]);

  // --- Actions ---

  const handleSave = useCallback(() => {
    localStorage.setItem('gestclasse_db_v3', JSON.stringify(db));
    alert("Données enregistrées avec succès !");
  }, [db]);

  const handleSelectClass = (cls: string, subject: string, semester: number) => {
    const key = `${cls}_${subject}_S${semester}`;
    
    // If doesn't exist (safety check), init it
    if (!db[key]) {
      setDb(prev => ({
        ...prev,
        [key]: {
          metadata: { classe: cls, discipline: subject, semester: semester, professeur: '', coefficient: 1 },
          students: generateInitialStudents(100)
        }
      }));
    }
    
    setCurrentSheetId(key);
    setView('editor');
  };

  const handleMetadataChange = (field: keyof ClassMetadata, value: string | number) => {
    if (!currentSheetId) return;
    
    const currentMeta = db[currentSheetId].metadata;

    // Handle switching Class via Dropdown
    if (field === 'classe') {
      const newClass = value as string;
      handleSelectClass(newClass, currentMeta.discipline, currentMeta.semester);
      return;
    }

    // Handle switching Semester via Dropdown
    if (field === 'semester') {
        const newSemester = typeof value === 'string' ? parseInt(value) : value;
        handleSelectClass(currentMeta.classe, currentMeta.discipline, newSemester as number);
        return;
    }

    // Standard metadata update for text fields
    setDb(prev => ({
      ...prev,
      [currentSheetId]: {
        ...prev[currentSheetId],
        metadata: {
          ...prev[currentSheetId].metadata,
          [field]: value
        }
      }
    }));
  };

  const handleStudentUpdate = (id: string, field: keyof Student, value: string | number) => {
    if (!currentSheetId) return;

    setDb(prev => ({
      ...prev,
      [currentSheetId]: {
        ...prev[currentSheetId],
        students: prev[currentSheetId].students.map(s => 
          s.id === id ? { ...s, [field]: value } : s
        )
      }
    }));
  };

  const handleSort = () => {
    if (!currentSheetId) return;
    
    setDb(prev => {
      const sheetData = prev[currentSheetId];
      // Recalculate to get current averages for sorting
      // Note: We need to pass S1 data if we want to sort by MoyG, but usually sorting is done by Moyenne Semestrielle
      // If user wants to sort by MoyG, logic would need adjustment. 
      // For now, keeping sort by Moyenne Semestrielle as per original spec.
      const computed = recalculateGrades(sheetData.students, sheetData.metadata.coefficient);
      
      // Separate filled rows from empty rows to keep empty ones at bottom
      const filled = computed.filter(s => s.noms.trim() !== '' || s.prenoms.trim() !== '');
      const empty = computed.filter(s => s.noms.trim() === '' && s.prenoms.trim() === '');
      
      const sortedFilled = filled.sort((a, b) => b.moyenne - a.moyenne);
      
      return {
        ...prev,
        [currentSheetId]: {
          ...sheetData,
          students: [...sortedFilled, ...empty]
        }
      };
    });
  };

  const handleReset = () => {
    if (!currentSheetId) return;
    if (window.confirm(`ATTENTION : Vous êtes sur le point d'effacer TOUTES les données de cette fiche (Noms, Prénoms, Sexe, Notes).\n\nConfirmez-vous la réinitialisation complète ?`)) {
      setDb(prev => ({
        ...prev,
        [currentSheetId]: {
          ...prev[currentSheetId],
          students: prev[currentSheetId].students.map(s => ({
            ...s,
            // Reset everything including identity
            prenoms: '', noms: '', sexe: '',
            d1: '', d2: '', d3: '', comp: '',
            moyDev: 0, moyenne: 0, moyCoef: 0, rang: 0, mention: '', moyG: undefined
          }))
        }
      }));
    }
  };

  const handleExport = () => {
    if (currentData) {
      exportToExcel(currentData.metadata, calculatedStudents, stats);
    }
  };

  const handleGlobalExport = () => {
    if (window.confirm("Voulez-vous exporter l'intégralité des classes et semestres dans un seul fichier Excel ? (Seules les classes avec des données seront exportées)")) {
      exportFullDbToExcel(db);
    }
  };

  const handleExportWord = () => {
    if (currentData) {
      exportToWord(currentData.metadata, calculatedStudents, stats);
    }
  };

  const handleGoHome = () => {
    localStorage.setItem('gestclasse_db_v3', JSON.stringify(db));
    setView('dashboard');
    setCurrentSheetId('');
  };

  return (
    <div className="min-h-screen bg-[#d8d1c9] p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto bg-[#cbbdac] p-1 shadow-2xl border-4 border-[#a8998a]">
        <div className="bg-[#d8d1c9] p-4 md:p-6 border border-gray-400 min-h-[800px]">
          
          <Header />

          {view === 'dashboard' && (
            <Dashboard 
              data={db} 
              onSelectClass={handleSelectClass} 
              onExportAll={handleGlobalExport}
            />
          )}

          {view === 'editor' && currentData && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main Content Area */}
              <div className="flex-1">
                <MetadataForm 
                  metadata={currentData.metadata} 
                  onChange={handleMetadataChange} 
                />
                
                <GradeTable 
                  students={calculatedStudents} 
                  onUpdateStudent={handleStudentUpdate}
                  semester={currentData.metadata.semester}
                />
                
                <StatisticsPanel stats={stats} />
              </div>

              {/* Sidebar Actions */}
              <div className="w-full lg:w-48 flex-shrink-0 mt-6 lg:mt-0">
                <Sidebar 
                  onReset={handleReset} 
                  onSort={handleSort} 
                  onSave={handleSave}
                  onExport={handleExport}
                  onExportWord={handleExportWord}
                  onHome={handleGoHome}
                  onInstall={handleInstallClick}
                  showInstallButton={showInstallButton}
                />
              </div>
            </div>
          )}

        </div>
      </div>
      
      <div className="text-center mt-4 text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} Système de Gestion Scolaire. Inspiré par l'IEF de Louga.
      </div>
    </div>
  );
};

export default App;