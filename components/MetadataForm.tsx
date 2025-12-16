import React from 'react';
import { ClassMetadata } from '../types';
import { CLASS_OPTIONS } from '../utils';

interface MetadataFormProps {
  metadata: ClassMetadata;
  onChange: (field: keyof ClassMetadata, value: string | number) => void;
}

const MetadataForm: React.FC<MetadataFormProps> = ({ metadata, onChange }) => {
  return (
    <div className="bg-[#bdaea1] border border-gray-600 p-4 mb-4 shadow-md rounded-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        
        {/* Left Column */}
        <div className="space-y-3">
          <div className="flex items-center">
            <label className="w-32 font-bold text-gray-900 text-sm uppercase">Relevé de Notes :</label>
            <select 
              className="flex-1 p-1 border border-gray-400 text-sm focus:outline-none focus:border-blue-600 bg-white"
              value={metadata.classe}
              onChange={(e) => onChange('classe', e.target.value)}
            >
              <option value="" disabled>Choisir une classe</option>
              {CLASS_OPTIONS.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <label className="w-32 font-bold text-gray-900 text-sm uppercase">Discipline :</label>
            <input 
              type="text" 
              className="flex-1 p-1 border border-gray-400 text-sm focus:outline-none focus:border-blue-600 bg-white"
              value={metadata.discipline}
              onChange={(e) => onChange('discipline', e.target.value)}
              placeholder="Ex: Mathématiques"
            />
          </div>
          <div className="flex items-center">
            <label className="w-32 font-bold text-gray-900 text-sm uppercase">Coef :</label>
            <input 
              type="number" 
              className="w-20 p-1 border border-gray-400 text-sm focus:outline-none focus:border-blue-600 bg-white"
              value={metadata.coefficient}
              onChange={(e) => onChange('coefficient', parseFloat(e.target.value) || 1)}
              min={1}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
           <div className="flex items-center">
            <label className="w-28 font-bold text-gray-900 text-sm uppercase text-right mr-2">Semestre :</label>
            <select 
              className="w-24 p-1 border border-gray-400 text-sm focus:outline-none focus:border-blue-600 bg-white"
              value={metadata.semester}
              onChange={(e) => onChange('semester', parseInt(e.target.value))}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="w-28 font-bold text-gray-900 text-sm uppercase text-right mr-2">Professeur :</label>
            <input 
              type="text" 
              className="flex-1 p-1 border border-gray-400 text-sm focus:outline-none focus:border-blue-600 bg-white"
              value={metadata.professeur}
              onChange={(e) => onChange('professeur', e.target.value)}
              placeholder="Nom du professeur"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataForm;
