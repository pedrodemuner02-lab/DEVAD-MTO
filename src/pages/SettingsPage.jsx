import React, { useState } from 'react';
import { Settings, Clock, Users, Database, Bell } from 'lucide-react';
import TurnosConfig from '../components/settings/TurnosConfig';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('turnos');

  const tabs = [
    { id: 'turnos', name: 'Turnos', icon: Clock },
    { id: 'general', name: 'General', icon: Settings },
    { id: 'usuarios', name: 'Usuarios', icon: Users },
    { id: 'sistema', name: 'Sistema', icon: Database },
    { id: 'notificaciones', name: 'Notificaciones', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">
          Configura los parámetros del sistema DEVAD-MTO
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de tabs */}
      <div>
        {activeTab === 'turnos' && <TurnosConfig />}
        
        {activeTab === 'general' && (
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Configuración General
                </h3>
                <p className="text-gray-500">En desarrollo</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Gestión de Usuarios
                </h3>
                <p className="text-gray-500">En desarrollo</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sistema' && (
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Configuración del Sistema
                </h3>
                <p className="text-gray-500">En desarrollo</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notificaciones' && (
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Notificaciones
                </h3>
                <p className="text-gray-500">En desarrollo</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
