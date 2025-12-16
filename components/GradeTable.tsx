import React from 'react';
import { Student } from '../types';

interface GradeTableProps {
  students: Student[];
  onUpdateStudent: (id: string, field: keyof Student, value: string | number) => void;
  semester: number;
}

const GradeTable: React.FC<GradeTableProps> = ({ students, onUpdateStudent, semester }) => {
  
  const handleNumberInput = (id: string, field: keyof Student, value: string) => {
    // Allow empty string or numbers between 0 and 20
    if (value === '') {
      onUpdateStudent(id, field, '');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 20) {
      onUpdateStudent(id, field, num);
    }
  };

  const isSemester2 = semester === 2;

  return (
    <div className="overflow-x-auto shadow-md border border-gray-500 bg-[#c7bcae]">
      <table className="w-full min-w-[1000px] border-collapse text-sm">
        <thead>
          <tr className="bg-[#a8998a] text-gray-900 border-b border-gray-600">
            <th className="border-r border-gray-600 px-2 py-3 w-10">N°</th>
            <th className="border-r border-gray-600 px-2 py-3 text-left w-48">PRÉNOMS</th>
            <th className="border-r border-gray-600 px-2 py-3 text-left w-32">NOMS</th>
            <th className="border-r border-gray-600 px-2 py-3 w-16">SEXE</th>
            <th className="border-r border-gray-600 px-1 py-3 w-12">D1</th>
            <th className="border-r border-gray-600 px-1 py-3 w-12">D2</th>
            <th className="border-r border-gray-600 px-1 py-3 w-12">D3</th>
            <th className="border-r border-gray-600 px-1 py-3 w-16 bg-[#bdaea1]">Moy Dev</th>
            <th className="border-r border-gray-600 px-1 py-3 w-16 bg-white font-bold">Comp</th>
            <th className="border-r border-gray-600 px-1 py-3 w-16 bg-[#bdaea1] font-bold">Moy</th>
            <th className="border-r border-gray-600 px-1 py-3 w-20 bg-[#bdaea1]">Moy*Coef</th>
            
            {isSemester2 && (
              <th className="border-r border-gray-600 px-1 py-3 w-20 bg-yellow-100 font-extrabold text-blue-900">Moy AN</th>
            )}

            <th className="border-r border-gray-600 px-1 py-3 w-12">Rang</th>
            <th className="px-2 py-3 w-24">Mention</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.id} className={`border-b border-gray-500 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
              <td className="border-r border-gray-400 px-2 py-1 text-center font-mono text-gray-500">{index + 1}</td>
              
              <td className="border-r border-gray-400 px-0 py-0">
                <input 
                  type="text" 
                  value={student.prenoms}
                  onChange={(e) => onUpdateStudent(student.id, 'prenoms', e.target.value)}
                  className="w-full h-full px-2 py-2 bg-transparent focus:outline-none focus:bg-blue-100 uppercase"
                />
              </td>
              
              <td className="border-r border-gray-400 px-0 py-0">
                <input 
                  type="text" 
                  value={student.noms}
                  onChange={(e) => onUpdateStudent(student.id, 'noms', e.target.value)}
                  className="w-full h-full px-2 py-2 bg-transparent focus:outline-none focus:bg-blue-100 uppercase font-bold"
                />
              </td>
              
              <td className="border-r border-gray-400 px-0 py-0 text-center">
                <select 
                  value={student.sexe}
                  onChange={(e) => onUpdateStudent(student.id, 'sexe', e.target.value)}
                  className="w-full h-full text-center bg-transparent focus:outline-none focus:bg-blue-100 appearance-none cursor-pointer"
                >
                  <option value=""></option>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </td>

              {/* Grades */}
              {['d1', 'd2', 'd3'].map((field) => (
                <td key={field} className="border-r border-gray-400 px-0 py-0">
                  <input 
                    type="number"
                    min="0" max="20"
                    value={student[field as keyof Student]}
                    onChange={(e) => handleNumberInput(student.id, field as keyof Student, e.target.value)}
                    className="w-full h-full text-center px-1 bg-transparent focus:outline-none focus:bg-blue-100"
                  />
                </td>
              ))}

              <td className="border-r border-gray-400 px-2 py-1 text-center font-bold bg-[#efebe7] text-gray-700">
                {student.moyDev > 0 ? student.moyDev.toFixed(2) : '-'}
              </td>

              <td className="border-r border-gray-400 px-0 py-0">
                <input 
                  type="number"
                  min="0" max="20"
                  value={student.comp}
                  onChange={(e) => handleNumberInput(student.id, 'comp', e.target.value)}
                  className="w-full h-full text-center px-1 bg-white font-bold text-blue-900 border-2 border-transparent focus:border-blue-500 focus:outline-none"
                />
              </td>

              <td className="border-r border-gray-400 px-2 py-1 text-center font-bold bg-[#e3ded8] text-black text-base">
                 {student.moyenne > 0 ? student.moyenne.toFixed(2) : '-'}
              </td>
              
              <td className="border-r border-gray-400 px-2 py-1 text-center font-mono text-gray-600 bg-[#efebe7]">
                {student.moyCoef > 0 ? student.moyCoef.toFixed(1) : '-'}
              </td>

              {isSemester2 && (
                <td className="border-r border-gray-400 px-2 py-1 text-center font-bold bg-yellow-50 text-blue-900">
                  {student.moyG !== undefined ? student.moyG.toFixed(2) : '-'}
                </td>
              )}

              <td className="border-r border-gray-400 px-2 py-1 text-center font-bold">
                 {student.rang > 0 ? `${student.rang}${student.rang === 1 ? 'er' : 'e'}` : '-'}
              </td>

              <td className={`px-2 py-1 text-center font-semibold text-xs 
                ${student.moyenne < 10 ? 'text-red-600' : 'text-green-700'}`}>
                {student.mention}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradeTable;
