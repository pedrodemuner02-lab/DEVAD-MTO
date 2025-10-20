import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const RecurringTemplatesPageDebug = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      console.log('🔄 Iniciando carga...');
      setLoading(true);
      
      // Consulta directa sin servicio
      const { data, error } = await supabase
        .from('maintenance_templates')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Datos recibidos:', data);
      console.log('❌ Error:', error);

      if (error) {
        setError(error.message);
        console.error('Error al cargar:', error);
      } else {
        setTemplates(data || []);
        console.log('✅ Plantillas cargadas:', data?.length);
      }
    } catch (err) {
      console.error('💥 Excepción:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('✅ Carga finalizada');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug - Plantillas Recurrentes</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4">Cargando... (ver consola)</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p className="text-red-500">{error}</p>
        <button onClick={loadTemplates} className="mt-4 btn btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug - Plantillas Recurrentes</h1>
      
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <p className="font-bold">✅ Carga exitosa</p>
        <p>Total de plantillas: {templates.length}</p>
      </div>

      {templates.length === 0 ? (
        <div className="card">
          <p className="text-gray-500">No hay plantillas</p>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Plantillas encontradas:</h2>
          {templates.map((template) => (
            <div key={template.id} className="border-b py-4">
              <h3 className="font-bold">{template.titulo}</h3>
              <p className="text-sm text-gray-600">Tipo: {template.tipo}</p>
              <p className="text-sm text-gray-600">
                Estado: {template.is_active ? '✅ Activa' : '⏸️ Pausada'}
              </p>
              <p className="text-sm text-gray-600">ID: {template.id}</p>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(template, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      <button onClick={loadTemplates} className="mt-4 btn btn-primary">
        Recargar
      </button>
    </div>
  );
};

export default RecurringTemplatesPageDebug;
