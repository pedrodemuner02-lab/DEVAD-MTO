import React, { useState, useEffect } from 'react';
import { supabase, TABLES } from '../lib/supabase';
import { Repeat, Calendar, Clock, Power, Search } from 'lucide-react';

const RecurringTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      // 📊 CONSULTA HÍBRIDA: Obtener mantenimientos donde es_plantilla = true
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE)
        .select(`
          *,
          equipment:equipment_id (
            id,
            codigo,
            nombre,
            tipo
          )
        `)
        .eq('es_plantilla', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando plantillas:', error);
        throw error;
      }

      // Convertir dias_semana de JSONB a array
      const templatesConDias = (data || []).map(template => ({
        ...template,
        dias_semana: Array.isArray(template.dias_semana) 
          ? template.dias_semana 
          : (template.dias_semana ? JSON.parse(template.dias_semana) : [])
      }));

      console.log('✅ Plantillas cargadas:', templatesConDias);
      setTemplates(templatesConDias);
    } catch (error) {
      console.error('❌ Error al cargar plantillas:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTemplateActive = async (templateId, currentState) => {
    try {
      const newState = currentState === 'Activo' ? 'Inactivo' : 'Activo';
      
      const { error } = await supabase
        .from(TABLES.MAINTENANCE)
        .update({ estado: newState })
        .eq('id', templateId);

      if (error) throw error;

      // Actualizar estado local
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, estado: newState } : t
      ));
      
      console.log(`✅ Plantilla ${newState === 'Activo' ? 'activada' : 'desactivada'}`);
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
    }
  };

  const getFrecuenciaTexto = (numero, unidad) => {
    if (!numero || !unidad) return 'No especificada';
    return `Cada ${numero} ${unidad}`;
  };

  const formatDiasSemana = (diasArray) => {
    // Validar que diasArray sea un array válido
    if (!diasArray) return '-';
    
    // Si es string, intentar parsearlo
    let dias = diasArray;
    if (typeof diasArray === 'string') {
      try {
        dias = JSON.parse(diasArray);
      } catch (e) {
        console.warn('No se pudo parsear dias_semana:', diasArray);
        return '-';
      }
    }
    
    // Verificar que sea un array con elementos
    if (!Array.isArray(dias) || dias.length === 0) {
      return '-';
    }
    
    const nombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias.map(d => nombres[d]).join(', ');
  };

  const handleGenerarInstancias = async (templateId) => {
    try {
      console.log(`🔄 Generando instancias para plantilla ${templateId}...`);
      
      const instanceGenerator = (await import('../services/instanceGenerator')).default;
      const resultado = await instanceGenerator.generateInstances(templateId, 4);
      
      alert(`✅ ${resultado.generadas} instancias generadas exitosamente`);
      loadTemplates();
    } catch (error) {
      console.error('Error generando instancias:', error);
      alert('❌ Error al generar instancias: ' + error.message);
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.equipment?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Repeat className="w-8 h-8 text-primary-600" />
            Plantillas Recurrentes
          </h1>
          <p className="text-gray-500 mt-1">
            Mantenimientos programados de forma recurrente
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total de plantillas</p>
          <p className="text-3xl font-bold text-primary-600">{templates.length}</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por equipo, tipo o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={loadTemplates}
            className="btn btn-secondary"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Lista de Plantillas */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="text-gray-500 mt-4">Cargando plantillas...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Repeat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No hay plantillas recurrentes</p>
            <p className="text-gray-400 text-sm">
              Crea un mantenimiento y marca "Activar recurrencia" para que aparezca aquí
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Frecuencia</th>
                  <th>Días</th>
                  <th>Horas Est.</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template) => (
                  <tr key={template.id}>
                    <td>
                      <div className="font-medium text-gray-900">
                        {template.equipment?.nombre || 'Sin equipo'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {template.equipment?.codigo || '-'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        template.tipo === 'Preventivo' ? 'badge-success' : 
                        template.tipo === 'Correctivo' ? 'badge-warning' : 
                        'badge-info'
                      }`}>
                        {template.tipo}
                      </span>
                    </td>
                    <td className="max-w-xs truncate">
                      {template.descripcion || 'Sin descripción'}
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {getFrecuenciaTexto(template.frecuencia_numero, template.frecuencia_unidad)}
                      </div>
                    </td>
                    <td>
                      {template.dias_semana && Array.isArray(template.dias_semana) && template.dias_semana.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {template.dias_semana.map(dia => (
                            <span key={dia} className="badge badge-sm badge-info">
                              {['D', 'L', 'M', 'X', 'J', 'V', 'S'][dia]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {template.horas_estimadas || 1}h
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        template.estado === 'Activo' ? 'badge-success' : 'badge-secondary'
                      }`}>
                        {template.estado || 'Activo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleGenerarInstancias(template.id)}
                          className="btn btn-sm btn-primary"
                          title="Generar instancias ahora"
                        >
                          <Repeat className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleTemplateActive(template.id, template.estado)}
                          className={`btn btn-sm ${
                            template.estado === 'Activo' ? 'btn-secondary' : 'btn-success'
                          }`}
                          title={template.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Activas</p>
              <p className="text-2xl font-bold text-green-700">
                {templates.filter(t => t.estado === 'Activo').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Power className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Preventivos</p>
              <p className="text-2xl font-bold text-blue-700">
                {templates.filter(t => t.tipo === 'Preventivo').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Repeat className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Correctivos</p>
              <p className="text-2xl font-bold text-orange-700">
                {templates.filter(t => t.tipo === 'Correctivo').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Repeat className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringTemplatesPage;
