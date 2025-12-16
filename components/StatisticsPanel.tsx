import React from 'react';
import { ClassStats } from '../types';

interface StatisticsPanelProps {
  stats: ClassStats;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ stats }) => {
  return (
    <div className="mt-6 bg-[#bdaea1] p-4 border border-gray-500 shadow-inner">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Group 1: General Pass/Fail */}
        <div className="space-y-0 border border-gray-600 bg-[#d1c7bc]">
          <div className="flex justify-between items-center border-b border-gray-500 p-2">
            <span className="font-bold text-sm text-gray-800">Nombre d'élèves qui n'ont pas la moyenne</span>
            <span className="font-bold text-white bg-red-600 px-3 py-1 min-w-[3rem] text-center">{stats.failCount}</span>
          </div>
          <div className="flex justify-between items-center p-2">
            <span className="font-bold text-sm text-gray-800">Nombre d'élèves qui ont la moyenne</span>
            <span className="font-bold text-black bg-green-400 px-3 py-1 min-w-[3rem] text-center">{stats.passCount}</span>
          </div>
        </div>

        {/* Group 2: Gender Stats */}
        <div className="space-y-0 border border-gray-600 bg-[#d1c7bc]">
          <div className="flex justify-between items-center border-b border-gray-500 p-2">
             <span className="font-bold text-sm text-gray-800">Nombre de filles</span>
             <span className="font-bold text-black bg-[#ffdbcc] px-3 py-1 min-w-[3rem] text-center">{stats.femaleCount}</span>
          </div>
          <div className="flex justify-between items-center p-2">
             <span className="font-bold text-sm text-gray-800">Nombre de garçons</span>
             <span className="font-bold text-black bg-[#ccdbff] px-3 py-1 min-w-[3rem] text-center">{stats.maleCount}</span>
          </div>
        </div>

         {/* Group 3: Pass by Gender */}
         <div className="space-y-0 border border-gray-600 bg-[#d1c7bc]">
          <div className="flex justify-between items-center border-b border-gray-500 p-2">
             <span className="font-bold text-sm text-gray-800 uppercase">Filles qui ont la moyenne</span>
             <span className="font-bold text-black bg-yellow-300 px-3 py-1 min-w-[3rem] text-center">{stats.femalePassCount}</span>
          </div>
          <div className="flex justify-between items-center p-2">
             <span className="font-bold text-sm text-gray-800 uppercase">Garçons qui ont la moyenne</span>
             <span className="font-bold text-black bg-yellow-300 px-3 py-1 min-w-[3rem] text-center">{stats.malePassCount}</span>
          </div>
        </div>
      </div>

      {/* Class Average */}
      <div className="mt-6 flex justify-center">
        <div className="flex items-center border-2 border-gray-700 bg-[#a8998a] shadow-lg transform scale-110">
          <span className="font-bold text-gray-900 px-4 py-2 text-lg uppercase">Moyenne de la classe</span>
          <span className="font-mono font-bold text-xl px-6 py-2 bg-yellow-300 text-black min-w-[100px] text-center">
            {stats.classAverage.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
