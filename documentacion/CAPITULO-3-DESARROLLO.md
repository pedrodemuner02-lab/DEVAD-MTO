# 3. DESARROLLO

Este capítulo describe la metodología y actividades realizadas para el diagnóstico, diseño e implementación del manual de mantenimiento, siguiendo un enfoque por fases que incluyó recolección de información, análisis técnico y desarrollo de procedimientos.

## 3.1 ANÁLISIS DE LA SITUACIÓN ACTUAL

Al llegar a la planta se realizó un recorrido de reconocimiento de las áreas y de los equipos principales de la línea productiva. A partir de esta visita se elaboró un diagnóstico sobre la gestión del mantenimiento: se observó que las prácticas son mayoritariamente reactivas, basadas en la sustitución de piezas cuando el equipo deja de funcionar, y que únicamente se ejecutan acciones preventivas puntuales (manipulación de cargas en carritos de huevos y calibración de nacedoras e incubadoras).

No existe un responsable de mantenimiento formal; las reparaciones y asignaciones quedan delegadas por el jefe de planta, cuya carga de trabajo retrasa las labores de mantenimiento y reduce la eficacia de la respuesta. La ausencia de una figura de liderazgo y de supervisión genera desorganización entre los operadores, deficiencias en seguridad y un uso ineficiente del tiempo operativo (tiempos muertos destinados a tareas no prioritarias como pintura o trabajos menores en instalaciones).

Mediante observación directa se identificaron fallas sistémicas:

- **Control de stock inexistente:** No se cuenta con un inventario actualizado de refacciones y materiales
- **Ausencia de registros obligatorios de mantenimiento:** No existe documentación de las intervenciones realizadas
- **Falta de planificación de intervenciones:** Las acciones de mantenimiento no están programadas
- **Desperdicio de tiempo productivo:** Tiempos muertos por falta de organización
- **Condiciones de riesgo para los trabajadores:** Deficiencias en seguridad industrial
- **Reparaciones únicamente cuando ya existen daños críticos:** Enfoque totalmente reactivo

Estas evidencias justifican la necesidad de implementar procedimientos estandarizados, registros mínimos y una estructura de responsabilidad que permitan reducir tiempos de paro, mejorar la seguridad y optimizar la disponibilidad de los equipos.

## 3.2 DISEÑO Y DESARROLLO DEL SISTEMA DE MANTENIMIENTO

Al iniciar la recolección de datos, el inventario y el análisis del funcionamiento de los equipos resultaron fundamentales para el diseño del manual de mantenimiento. A partir de la identificación de las fallas más frecuentes en la planta surgió la idea de desarrollar un programa que administrara los equipos y registrara las intervenciones: un sistema que permitiera programar mantenimientos, conservar el historial de reparaciones y facilitar la planificación.

Durante el levantamiento se demostró que muchos de los daños son evitables y pueden solucionarse con acciones sencillas y regulares, como el engrase o el ajuste de componentes; sin embargo, la ausencia de registros y de una programación continua impide que estas tareas se realicen de forma persistente.

### 3.2.1 Clasificación de Activos por Familias

La clasificación de los activos en familias redujo la complejidad del trabajo: aunque la planta cuenta con 24 incubadoras y alrededor de 40 equipos en total, muchas máquinas comparten componentes, tableros y modos de falla similares. Esta semejanza facilitó el uso de fichas técnicas y procedimientos comunes por familia:

- **Incubadoras**
- **Nacedoras**
- **Lava charolas**
- **Bandas transportadoras**
- **Máquina de desechos**
- **Vacunadora**

Esta clasificación también evidenció la necesidad de un sistema administrativo robusto y flexible que centralice la información y agilice las intervenciones. En resumen, con registros periódicos y una herramienta de gestión adecuada, se puede reducir significativamente la recurrencia de fallas y mejorar la eficiencia del mantenimiento.

### 3.2.2 Desarrollo del Sistema DEVAD-MTO

Viendo estas necesidades, se utilizó programación por lotes y tablas en SQL, las cuales permiten manipular los datos de los equipos y los registros de los mantenimientos. Para facilitar el uso por parte de los operadores, se generó una aplicación fácil de comprender. Para distribuir e implementar este programa se usó HTML y se utilizó como puerto la red local para el acceso desde cualquier dispositivo a la plataforma donde se registran los datos de los equipos y actividades faltantes por realizar.

#### Tecnologías Implementadas

**Frontend:**
- React 18.2.0 + Vite 5.4.20
- Tailwind CSS para estilos modernos y responsive
- React Router DOM para navegación
- Lucide React para iconografía

**Backend:**
- Supabase PostgreSQL como base de datos
- Autenticación personalizada
- Row Level Security (RLS) para seguridad de datos

**Arquitectura de Base de Datos:**
```
├── auth_users (Usuarios y sesiones)
├── equipment (Equipos industriales)
├── operators (Operadores por turno)
├── maintenance (Tabla híbrida: plantillas + instancias)
│   ├── es_plantilla = true  → Plantilla recurrente
│   └── es_plantilla = false → Instancia de mantenimiento
├── inventory (Inventario de partes)
└── requisitions (Requisiciones de materiales)
```

## 3.3 ESTABLECER UN PROGRAMA DE MANTENIMIENTO PREVENTIVO BASADO EN CRITERIOS TÉCNICOS

El programa de mantenimiento preventivo se diseñó sobre la base de criterios técnicos cuantificables y reconocidos:

1. **Especificaciones del fabricante**
2. **Condiciones reales de operación**
3. **Datos históricos de fallas** (historial de órdenes de trabajo)
4. **Criticidad funcional** para el proceso de incubación
5. **Requisitos normativos aplicables**

Estos criterios permiten definir tareas, frecuencias y tolerancias para cada equipo, garantizando que las intervenciones sean pertinentes, eficientes y proporcionales al riesgo que cada activo representa para la continuidad y la inocuidad del proceso. Para esto se creó el programa de administración de mantenimiento llamado DEVAD-MTO, el cual facilita todo el manejo de datos.

### 3.3.1 Metodología de Diseño

#### Recolección y Análisis de Datos

La consolidación del inventario, revisión de fichas técnicas y análisis del historial de fallas fueron actividades fundamentales. Se realizaron entrevistas con operadores y personal de mantenimiento para identificar modos de falla recurrentes.

**Consideraciones específicas del proyecto:**

- Los datos históricos de fallas se encuentran en una base de datos de la empresa Jamesway y no se permitió el acceso a esos datos
- Las fichas técnicas se encuentran en los motores
- El mantenimiento de las familias de nacedoras e incubadoras es realizado únicamente por Jamesway en cumplimiento con las garantías establecidas en su compra
- El inventario de las piezas se lleva de forma anual

Con el programa desarrollado se planea registrar el inventario paulatinamente, ya que es gran cantidad de productos. Por el momento, la petición de contabilizar e ingresar los datos al programa está en revisión y evaluación del sistema.

Se utilizaron datos de prueba para verificar la funcionalidad del sistema, pudiendo evidenciar que el control de stock se llevaría a cabo de manera más práctica y sencilla. La interfaz fue pensada justamente para que sea fácil de aprender y entender.

#### Control de Stock Automatizado

El sistema está diseñado para realizar un match con los operadores: cuando se utilizan piezas, el sistema reacciona y muestra a qué niveles se encuentra el stock. Si pasa un punto estimado por el jefe de mantenimiento, se tiene que hacer una requisición, evitando así que no se cuenten con las piezas en el momento necesario.

#### Matriz de Prioridad y Criticidad

En el programa se establece una matriz codificada y fácil de utilizar que mantiene los mantenimientos por prioridad, lo que facilita la recolección de datos y acciones de los operadores.

Se aplicó una matriz (impacto × probabilidad [+ criticidad de inocuidad]) para asignar niveles de prioridad y decidir alcance y frecuencia de los mantenimientos preventivos.

El sistema se pensó de manera general para que, en caso de recibir autorización, sea funcional en campo de reacción rápida y prioritaria. Los equipos existentes tienen plantillas de recurrencia para los mantenimientos preventivos.

### 3.3.2 Definición de Tareas por Familia de Equipos

La definición de tareas se estructura por familia de equipos e incluye actividades específicas:

- **Inspección visual**
- **Limpieza**
- **Lubricación**
- **Calibración**
- **Ajuste**
- **Verificación de alarmas**
- **Comprobación de parámetros eléctricos**

Cada tarea se documenta como una lista de verificación (checklist) operativa, que contiene:

#### Criterios de Aceptación

Especificaciones técnicas que definen el estado óptimo del equipo, claros y medibles.

#### Registros Parametrizados

Campos diseñados para capturar datos cuantitativos y cualitativos, los cuales son generados y almacenados directamente por el sistema. Como se ejemplifica en las plantillas de mantenimiento, es posible agregar descripciones detalladas y campos personalizados a cada checklist.

### 3.3.3 Gestión de Frecuencias y Recurrencias

Adyacente a la definición de tareas, se configura el módulo de recurrencias. Este permite seleccionar una frecuencia estándar (diaria, semanal, mensual, trimestral, semestral, anual), la cual es adaptada para cada equipo en función de:

1. **Recomendaciones del fabricante**
2. **Condiciones operativas y ambientales de uso**
3. **Análisis de criticidad del activo**

#### Sistema de Plantillas Recurrentes

El sistema DEVAD-MTO implementa un módulo de plantillas recurrentes con las siguientes características:

- ✅ Generación automática de instancias de mantenimiento
- ✅ Configuración por días de la semana
- ✅ Frecuencia semanal/mensual personalizable
- ✅ Visualización de días con badges (L M X J V S D)
- ✅ Asignación automática de operadores
- ✅ Balanceo de carga entre turnos

**Flujo de Trabajo:**
1. Se crea una plantilla recurrente (es_plantilla=true)
2. El sistema genera instancias para las próximas 4 semanas automáticamente
3. Cada instancia se asigna automáticamente a un operador
4. Los operadores reciben trabajo balanceado según complejidad

### 3.3.4 Integración con el Sistema de Gestión de Mantenimiento (GMAO)

La totalidad de los parámetros (tareas, checklist, criterios y frecuencias) se cargan en el software de administración de mantenimiento (GMAO). Esta integración habilita las siguientes funcionalidades automatizadas:

#### Generación de Órdenes de Trabajo Programadas

El sistema crea y despacha órdenes de forma autónoma según la planificación. En el caso de esta empresa, el programa se ajustó para que se lleve a cabo por turnos, logrando así que el responsable sea definido por el estándar que ya cuenta la incubadora. El encargado define los operadores para cada semana y su recurrencia.

**Sistema de Turnos:**
- 🌅 Mañana (6:00 - 14:00)
- ☀️ Intermedio (14:00 - 18:00)
- 🌆 Tarde (18:00 - 22:00)
- 🌙 Noche (22:00 - 6:00)

#### Gestión de Inventario

El sistema vincula las tareas preventivas con los repuestos necesarios, facilitando la logística y el control de stock. Cuando se utilizan piezas, el sistema actualiza automáticamente el inventario y genera alertas cuando se alcanza el nivel mínimo establecido.

#### Almacenamiento del Histórico

Todo registro de ejecución se archiva de manera centralizada, construyendo el historial técnico completo del activo. Esto permite:

- Análisis de tendencias de fallas
- Identificación de patrones
- Optimización de frecuencias de mantenimiento
- Justificación técnica de intervenciones

## 3.4 SEGUIMIENTO Y MEJORA CONTINUA

El sistema soporta el ciclo de mejora continua mediante el monitoreo de indicadores clave de desempeño (KPIs), entre los que se incluyen:

### 3.4.1 Indicadores Clave de Desempeño

- **Cumplimiento del programa de mantenimiento preventivo (PM):** Porcentaje de tareas completadas vs. programadas
- **Tiempo medio para reparar (MTTR):** Tiempo promedio que toma resolver una falla
- **Tiempo medio entre fallas (MTBF):** Tiempo promedio entre fallas consecutivas
- **Número de paros imprevistos:** Cantidad de paros no programados en el periodo
- **Disponibilidad operativa:** Porcentaje de tiempo que el equipo está operativo

Estos KPIs son calculados automáticamente por el sistema y revisados periódicamente. Los resultados del análisis se utilizan para realizar ajustes fundamentados al programa de mantenimiento, optimizando frecuencias, tareas y recursos.

### 3.4.2 Criterios Técnicos Aplicados

El programa de mantenimiento se basa en los siguientes criterios técnicos:

#### Datos del Fabricante
- Intervalos de mantenimiento recomendados
- Tipos de lubricantes especificados
- Pares de apriete recomendados

#### Condiciones Operativas
- Ciclos operativos diarios
- Temperaturas de ambiente
- Humedad relativa
- Carga de trabajo

#### Historial de Fallas
- Frecuencia de averías pasadas
- Causa raíz de las fallas
- Priorización de tareas preventivas basada en datos históricos

#### Criticidad de Proceso
- Impacto en la tasa de eclosión
- Inocuidad del proceso
- Continuidad de la planta

#### Normativa y Seguridad
- Cumplimiento de normas (NOM)
- Requisitos ISO aplicables
- Procedimientos LOTO (Lockout-Tagout)

### 3.4.3 Esquema de Frecuencias

El programa implementa las siguientes frecuencias de mantenimiento preventivo:

#### Mantenimiento Diario
- Verificación de alarmas
- Registro de temperatura/humedad
- Inspección visual rápida de equipos críticos

#### Mantenimiento Semanal
- Limpieza de filtros
- Revisión de correas y tensiones
- Comprobación de ventiladores

#### Mantenimiento Mensual
- Lubricación de rodamientos y chumaceras (según tipo)
- Calibración básica de sensores críticos
- Inspección eléctrica básica

#### Mantenimiento Trimestral
- Inspección termográfica de tableros
- Alineación de motores
- Revisión de chillers (niveles y condiciones)

#### Mantenimiento Semestral
- Revisión de sistema HVAC
- Ensayos de respaldo eléctrico
- Análisis de vibraciones en motores principales

#### Mantenimiento Anual
- Revisión mayor
- Pruebas de integridad
- Revisión completa de sistemas de control
- Actualización de fichas técnicas si procede

### 3.4.4 Ejemplo Práctico: Checklist de Mantenimiento Preventivo para Chumaceras

**Frecuencia sugerida:** Mensual (ajustar según horas de operación y fabricante)

**Tareas:**

1. **Inspección visual del alojamiento**
   - Verificar sellos
   - Ausencia de fugas

2. **Comprobación de temperatura superficial**
   - Registrar temperatura
   - Comparar con valor de referencia

3. **Verificación de ruido y vibración**
   - Escuchar ruido de operación
   - Palpación de vibración
   - Si hay herramienta disponible, registrar valor

4. **Verificar holgura o juego**
   - Juego axial
   - Juego radial (si aplica)

5. **Limpieza**
   - Limpieza exterior
   - Retirada de suciedad acumulada

6. **Engrase según especificación del fabricante**
   - Tipo de grasa especificada
   - Cantidad adecuada
   - Técnica correcta (ciclos e intervalos)
   - Registrar fecha y cantidad aplicada

7. **Comprobación de tornillería**
   - Estado de tornillos
   - Sistema de fijación
   - Pares de apriete según ficha técnica

8. **Registro de observaciones**
   - Si se detecta temperatura anormal: abrir OT correctiva
   - Si se detecta ruido excesivo: abrir OT correctiva
   - Si se detecta juego excesivo: priorizar reemplazo o reparación

**Criterios de Aceptación:**
- Temperatura ≤ X °C sobre ambiente (valor según ficha técnica)
- Ruido no perceptible en operación normal
- Juego dentro de tolerancias especificadas

**Registro en el Sistema:**
- Entrada en el programa con fecha
- Técnico responsable
- Acciones realizadas
- Cantidad de lubricante aplicado
- Foto si se detectó anomalía

### 3.4.5 Integración con el Programa de Administración de Mantenimiento

#### Parametrización
Se introducen en el sistema las tareas de mantenimiento preventivo por equipo/familia, incluyendo:
- Frecuencias establecidas
- Duración estimada
- Repuestos asociados

#### Órdenes Automáticas
El sistema genera órdenes de trabajo (OT) programadas automáticamente, enviando notificaciones y registrando la ejecución:
- Fecha de ejecución
- Responsable asignado
- Horas trabajadas
- Repuestos utilizados

#### Inventario y Puntos de Reorden
Vinculación de cada tarea con:
- Códigos de repuesto
- Niveles mínimos de stock
- Garantía de disponibilidad de materiales

#### Historial y Análisis
Consultas directas desde la base de datos del programa para:
- MTTR (Tiempo Medio para Reparar)
- MTBF (Tiempo Medio entre Fallas)
- Cumplimiento de PM
- Evaluar desempeño
- Justificar ajustes técnicos

### 3.4.6 Indicadores y Verificación

#### KPIs Mínimos para Seguimiento
- **Cumplimiento PM:** Porcentaje de cumplimiento
- **Número de OTs correctivas por equipo:** N/mes
- **MTTR:** Horas
- **MTBF:** Horas
- **Disponibilidad operativa:** Porcentaje

#### Revisión Periódica
- **Evaluación mensual:** Cumplimiento de PM
- **Análisis trimestral:** MTTR/MTBF para identificar tendencias
- **Acciones correctivas:** Priorizar mejoras basadas en datos

## 3.5 IMPLEMENTAR UN PROGRAMA DE CAPACITACIÓN PARA EL USO DEL PROGRAMA Y MANUAL DE MANTENIMIENTO

### 3.5.1 Objetivo General

Capacitar al personal operativo, mantenimiento y supervisión para usar el software de gestión de mantenimiento DEVAD-MTO y aplicar correctamente el manual de mantenimiento en sus tareas diarias.

### 3.5.2 Alcance

El programa de capacitación está dirigido a:
- Usuarios finales del CMMS
- Técnicos de mantenimiento
- Supervisores de turno
- Planificadores de mantenimiento

### 3.5.3 Duración Estimada

Gracias a la facilidad y sencillez que presenta el uso del programa por ser tan intuitivo, se estima que:

- **Para operadores:** Dos días con práctica de 1 hora cada día son suficientes
  - Solo les aparecen los mantenimientos asignados
  - Interfaz simplificada y directa
  - Enfoque en ejecución y registro

- **Para jefe de mantenimiento:** Asesoría personalizada
  - Entendimiento completo de todos los factores
  - Configuración de plantillas
  - Gestión de operadores y turnos
  - Análisis de reportes y KPIs

### 3.5.4 Roles y Responsabilidades

#### Responsable de Formación
- Coordinar logística
- Preparar materiales de capacitación
- Coordinar instructores

#### Instructor
- Impartir sesiones teóricas
- Dirigir prácticas
- Resolver dudas

#### Supervisores
- Liberar al personal para asistir
- Apoyar la implementación en campo
- Dar seguimiento post-capacitación

### 3.5.5 Estructura del Programa

#### Sesión de Inducción (1 hora)
- Objetivos del programa
- Beneficios del sistema
- Expectativas
- Métricas de éxito

#### Módulo 1: Uso del Programa DEVAD-MTO (30 minutos)

**Contenido:**
- Navegación en el sistema
- Gestión de órdenes de trabajo
- Gestión de activos
- Generación de informes
- Panel de control (Dashboard)

**Características del Sistema:**
- Interfaz intuitiva y moderna
- Accesible desde cualquier dispositivo en la red local
- Diseño responsive para tablets y móviles
- Visualización clara de prioridades

#### Módulo 2: Uso del Manual de Mantenimiento (30 minutos)

**Contenido:**
- Interpretación de procedimientos
- Uso de listas de verificación (checklists)
- Aplicación de criterios técnicos
- Registro correcto de información
- Manejo de no conformidades

**Temas Clave:**
- Criterios de aceptación
- Valores de referencia
- Procedimientos de seguridad
- Escalamiento de problemas

### 3.5.6 Materiales de Capacitación

- Manual de usuario del sistema DEVAD-MTO
- Manual de mantenimiento impreso
- Guías rápidas por familia de equipos
- Videos tutoriales
- Casos prácticos

### 3.5.7 Evaluación y Seguimiento

#### Evaluación Inicial
- Conocimientos previos
- Experiencia con sistemas similares

#### Evaluación Final
- Prueba práctica en el sistema
- Ejercicios de casos reales

#### Seguimiento Post-Capacitación
- Acompañamiento en campo (primera semana)
- Resolución de dudas
- Ajustes al programa según retroalimentación

## 3.6 BENEFICIOS ESPERADOS DEL SISTEMA IMPLEMENTADO

### 3.6.1 Operacionales

- **Reducción de tiempos de paro** por fallas inesperadas
- **Mejora en la disponibilidad** de equipos críticos
- **Optimización del tiempo** de los operadores y técnicos
- **Reducción de reparaciones de emergencia**

### 3.6.2 Administrativos

- **Centralización de información** de mantenimiento
- **Historial completo** de intervenciones
- **Trazabilidad** de actividades
- **Control de inventario** automatizado
- **Reportes y análisis** basados en datos reales

### 3.6.3 Seguridad

- **Reducción de riesgos** operacionales
- **Cumplimiento de normativas** de seguridad
- **Procedimientos estandarizados** documentados
- **Mejora en condiciones de trabajo**

### 3.6.4 Económicos

- **Reducción de costos** por mantenimiento correctivo
- **Optimización de uso** de repuestos
- **Mejor planificación** de compras
- **Aumento de vida útil** de equipos

## 3.7 CONCLUSIONES DEL DESARROLLO

El desarrollo e implementación del sistema DEVAD-MTO representa un avance significativo en la gestión de mantenimiento de la planta. El sistema integra:

1. **Diagnóstico preciso** de la situación actual
2. **Diseño técnico fundamentado** en mejores prácticas
3. **Implementación tecnológica moderna** y accesible
4. **Programa de capacitación efectivo** y práctico
5. **Metodología de mejora continua** basada en KPIs

La combinación de procedimientos estandarizados, tecnología accesible y capacitación adecuada proporciona las bases para una transformación del enfoque de mantenimiento, pasando de un modelo reactivo a uno preventivo y planificado.

El sistema está diseñado para crecer y adaptarse a las necesidades futuras de la planta, permitiendo la incorporación de nuevos equipos, procedimientos y mejoras basadas en la experiencia operativa y el análisis de datos históricos.

---

**Documento elaborado para:** Instituto Tecnológico Superior de Huatusco  
**Proyecto:** Sistema de Mantenimiento Industrial DEVAD-MTO  
**Fecha:** Enero 2026
