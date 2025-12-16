import React from 'react';
import { RefreshCcw, Home, BarChart2, Save, FileSpreadsheet, FileText, Download } from 'lucide-react';

interface SidebarProps {
  onReset: () => void;
  onSort: () => void;
  onSave: () => void;
  onExport: () => void;
  onExportWord: () => void;
  onHome: () => void;
  onInstall?: () => void;
  showInstallButton?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onReset, onSort, onSave, onExport, onExportWord, onHome, 
  onInstall, showInstallButton 
}) => {
  return (
    <div className="flex flex-col gap-4 sticky top-4">
      
      {/* Bouton d'installation (visible seulement si installable) */}
      {showInstallButton && onInstall && (
        <button 
          onClick={onInstall}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 border-2 border-indigo-800 shadow-md hover:shadow-lg transition-all rounded uppercase text-sm tracking-wider animate-pulse"
        >
          <Download size={18} />
          INSTALLER L'APPLI
        </button>
      )}

      <button 
        onClick={onHome}
        className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 border-2 border-gray-600 shadow-md hover:shadow-lg transition-all rounded uppercase text-sm tracking-wider"
      >
        <Home size={18} />
        Tableau de Bord
      </button>

      <button 
        onClick={onSave}
        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 border-2 border-green-700 shadow-md hover:shadow-lg transition-all rounded uppercase text-sm tracking-wider"
      >
        <Save size={18} />
        Enregistrer
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={onExport}
          className="flex items-center justify-center gap-2 bg-[#1D6F42] hover:bg-[#155b33] text-white font-bold py-3 px-2 border-2 border-[#104a29] shadow-md hover:shadow-lg transition-all rounded uppercase text-xs tracking-wider"
          title="Exporter en Excel"
        >
          <FileSpreadsheet size={16} />
          Excel
        </button>
        <button 
          onClick={onExportWord}
          className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 px-2 border-2 border-blue-900 shadow-md hover:shadow-lg transition-all rounded uppercase text-xs tracking-wider"
          title="Exporter en Word"
        >
          <FileText size={16} />
          Word
        </button>
      </div>
      
      <div className="h-px bg-gray-400 my-2"></div>

      <button 
        onClick={onReset}
        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 border-2 border-red-800 shadow-md hover:shadow-lg transition-all rounded uppercase text-sm tracking-wider"
      >
        <RefreshCcw size={18} />
        RÉINITIALISER
      </button>

      <button 
        onClick={onSort}
        className="flex items-center justify-center gap-2 bg-gradient-to-b from-gray-200 to-gray-400 hover:from-gray-300 hover:to-gray-500 text-black font-extrabold py-4 px-6 border-2 border-gray-600 shadow-lg hover:shadow-xl transition-all rounded uppercase text-lg tracking-widest"
      >
        <BarChart2 size={24} />
        TRIER
      </button>
    </div>
  );
};

export default Sidebar;