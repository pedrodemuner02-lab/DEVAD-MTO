import React from 'react';
import { FileText } from 'lucide-react';

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
      
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Módulo de Reportes
            </h3>
            <p className="text-gray-500">Este módulo está en desarrollo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
