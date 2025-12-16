import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="bg-white border-2 border-gray-800 p-4 mb-4 flex flex-col md:flex-row items-center justify-between shadow-sm">
      {/* Left: Flag placeholder & Country */}
      <div className="flex flex-col items-center w-full md:w-1/4 mb-4 md:mb-0">
        <div className="w-16 h-10 bg-gradient-to-r from-green-600 via-yellow-400 to-red-600 mb-2 border border-gray-300 shadow-sm" title="Drapeau du Sénégal"></div>
        <div className="text-center text-xs font-serif leading-tight">
          <p className="font-bold">République du Sénégal</p>
          <p className="italic text-[10px]">Un Peuple – Un But – Une Foi</p>
          <p>Ministère de l'Education nationale</p>
        </div>
      </div>

      {/* Center: School Info */}
      <div className="text-center w-full md:w-1/2 mb-4 md:mb-0">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-wide uppercase">Inspection d'Académie de Louga</h1>
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mt-1 uppercase">I.E.F De Louga</h2>
        <div className="bg-gray-100 rounded px-4 py-1 mt-2 inline-block border border-gray-300">
           <h3 className="text-md font-bold text-gray-700">BST DE LOUGA</h3>
        </div>
        <p className="text-sm font-semibold mt-1">TEL: 77 521 22 88 / 33 897 96 53</p>
      </div>

      {/* Right: Logo Placeholder */}
      <div className="w-full md:w-1/4 flex justify-center md:justify-end">
        <div className="w-24 h-24 border border-gray-300 flex items-center justify-center bg-gray-50 rounded-full shadow-inner">
           {/* Abstract Logo Representation */}
           <svg viewBox="0 0 24 24" className="w-16 h-16 text-indigo-900" fill="currentColor">
             <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
           </svg>
        </div>
      </div>
    </div>
  );
};

export default Header;
