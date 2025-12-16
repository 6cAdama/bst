import React from 'react';
import { Users, BookOpen, Layers, Calendar, Download } from 'lucide-react';
import { ClassMetadata, Student } from '../types';
import { CLASS_OPTIONS, SUBJECT_OPTIONS } from '../utils';

interface DashboardProps {
  data: Record<string, { metadata: ClassMetadata; students: Student[] }>;
  onSelectClass: (className: string, subject: string, semester: number) => void;
  onExportAll: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onSelectClass, onExportAll }) => {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b-2 border-gray-400 pb-2">
        <h2 className="text-3xl font-bold text-gray-800 uppercase flex items-center">
          <Layers className="mr-3" />
          Tableau de Bord des Classes
        </h2>
        <button 
          onClick={onExportAll}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-[#1D6F42] hover:bg-[#155b33] text-white font-bold py-3 px-6 border-2 border-[#104a29] shadow-lg rounded uppercase text-sm tracking-wider"
        >
          <Download size={20} />
          EXPORTER TOUT (.XLSX)
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {CLASS_OPTIONS.map((cls) => {
          return (
            <div 
              key={cls}
              className="bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
                <div className="bg-gray-800 text-white font-bold text-2xl px-4 py-1 rounded shadow-sm">
                  {cls}
                </div>
                <BookOpen className="text-gray-400" size={24} />
              </div>
              
              <div className="flex divide-x divide-gray-200">
                {/* Semester 1 Column */}
                <div className="w-1/2 p-3 bg-blue-50/30">
                  <div className="flex items-center justify-center mb-3 text-blue-800 font-bold text-sm uppercase border-b border-blue-100 pb-1">
                    <Calendar size={14} className="mr-1" /> Semestre 1
                  </div>
                  <div className="flex flex-col gap-2">
                    {SUBJECT_OPTIONS.map(subject => (
                      <button
                        key={`${subject}_S1`}
                        onClick={() => onSelectClass(cls, subject, 1)}
                        className="text-left px-3 py-2 bg-white hover:bg-blue-100 border border-blue-200 rounded text-xs font-bold text-gray-700 transition-colors shadow-sm flex justify-between items-center group"
                      >
                        {subject}
                        <span className="opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity">
                          &rarr;
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Semester 2 Column */}
                <div className="w-1/2 p-3 bg-green-50/30">
                  <div className="flex items-center justify-center mb-3 text-green-800 font-bold text-sm uppercase border-b border-green-100 pb-1">
                    <Calendar size={14} className="mr-1" /> Semestre 2
                  </div>
                  <div className="flex flex-col gap-2">
                    {SUBJECT_OPTIONS.map(subject => (
                      <button
                        key={`${subject}_S2`}
                        onClick={() => onSelectClass(cls, subject, 2)}
                        className="text-left px-3 py-2 bg-white hover:bg-green-100 border border-green-200 rounded text-xs font-bold text-gray-700 transition-colors shadow-sm flex justify-between items-center group"
                      >
                        {subject}
                        <span className="opacity-0 group-hover:opacity-100 text-green-600 transition-opacity">
                          &rarr;
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;