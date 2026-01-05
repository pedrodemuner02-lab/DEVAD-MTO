# METODOLOGÍA DE DIAGNÓSTICO Y ANÁLISIS

## Introducción

Este documento describe la metodología utilizada para realizar el diagnóstico de la situación actual del mantenimiento en la planta y el análisis que fundamentó el desarrollo del sistema DEVAD-MTO.

## Fases del Diagnóstico

### Fase 1: Reconocimiento de Instalaciones

#### Objetivos
- Conocer la distribución física de la planta
- Identificar equipos principales y auxiliares
- Comprender el proceso productivo de incubación

#### Actividades Realizadas
1. **Recorrido guiado** por las instalaciones
2. **Identificación de áreas críticas** del proceso
3. **Registro fotográfico** de equipos principales
4. **Levantamiento preliminar** de equipos

#### Resultados
- Mapa de ubicación de equipos principales
- Lista preliminar de 40+ equipos en operación
- Identificación de 24 incubadoras operativas

### Fase 2: Observación de Prácticas Actuales

#### Objetivos
- Entender las prácticas actuales de mantenimiento
- Identificar problemas y áreas de oportunidad
- Documentar el flujo de trabajo existente

#### Métodos de Observación
1. **Observación directa** de actividades de mantenimiento
2. **Seguimiento de operadores** durante turno completo
3. **Análisis de tiempos** y movimientos
4. **Registro de incidentes** y fallas

#### Hallazgos Principales

##### Fortalezas Identificadas
- Conocimiento empírico de los operadores
- Experiencia práctica con los equipos
- Disposición para mejorar procesos

##### Debilidades Identificadas
- **Enfoque reactivo dominante:** 90% de las intervenciones son correctivas
- **Ausencia de planificación:** No existe calendario de mantenimiento
- **Falta de registros:** No se documentan las intervenciones
- **Sin control de inventario:** No se conoce el stock disponible
- **Desorganización:** Falta de priorización de actividades
- **Problemas de seguridad:** Procedimientos no estandarizados

### Fase 3: Entrevistas con Personal Clave

#### Entrevistas Realizadas

##### Jefe de Planta
- Visión general de la operación
- Problemáticas principales
- Expectativas de mejora
- Restricciones presupuestales

##### Operadores de Turno
- Experiencias con los equipos
- Fallas más frecuentes
- Necesidades de capacitación
- Sugerencias de mejora

##### Personal de Mantenimiento Informal
- Procedimientos actuales
- Herramientas disponibles
- Conocimiento de equipos
- Dificultades encontradas

#### Insights Obtenidos
- Muchas fallas se repiten periódicamente
- Los operadores conocen las fallas comunes pero no tienen forma de prevenirlas
- Existe consenso sobre la necesidad de un sistema formal
- Hay disposición para adoptar nuevas prácticas

### Fase 4: Análisis de Documentación Existente

#### Documentos Revisados
- Manuales de equipos (cuando disponibles)
- Fichas técnicas de motores
- Registros informales de reparaciones
- Facturas de compra de refacciones

#### Limitaciones Encontradas
- **Datos históricos de Jamesway:** No accesibles (propiedad del proveedor)
- **Fichas técnicas:** Dispersas, algunas ilegibles
- **Sin historial formal:** Información fragmentada
- **Garantías activas:** Mantenimiento de incubadoras/nacedoras restringido a Jamesway

### Fase 5: Clasificación de Equipos

#### Metodología de Clasificación

##### Criterio 1: Familia Tecnológica
Agrupación por similitud funcional y constructiva:
- Incubadoras (24 unidades)
- Nacedoras
- Sistemas de lavado
- Transporte (bandas, carros)
- Sistemas auxiliares

##### Criterio 2: Criticidad Operacional
Evaluación mediante matriz de impacto:

**Matriz de Criticidad**
```
                    Probabilidad de Falla
                    Baja    Media    Alta
Impacto Alto        Media   Alta     Crítica
Impacto Medio       Baja    Media    Alta
Impacto Bajo        Baja    Baja     Media
```

##### Criterio 3: Componentes Comunes
Identificación de partes compartidas:
- Motores eléctricos estándar
- Rodamientos y chumaceras
- Sistemas de control similares
- Sensores de temperatura/humedad

#### Resultados de la Clasificación

**Equipos Críticos (Prioridad 1)**
- Incubadoras principales (24)
- Nacedoras (6)
- Sistema de ventilación principal

**Equipos Importantes (Prioridad 2)**
- Lava charolas
- Bandas transportadoras principales
- Vacunadora

**Equipos Auxiliares (Prioridad 3)**
- Bandas auxiliares
- Equipos de limpieza
- Iluminación y servicios

### Fase 6: Identificación de Necesidades

#### Necesidades Técnicas
1. Sistema de registro de mantenimientos
2. Control de inventario de refacciones
3. Programación de actividades preventivas
4. Historial por equipo
5. Indicadores de desempeño

#### Necesidades Organizacionales
1. Definición de responsabilidades
2. Procedimientos estandarizados
3. Sistema de priorización
4. Capacitación formal
5. Comunicación efectiva

#### Necesidades Tecnológicas
1. Software de gestión de mantenimiento (GMAO/CMMS)
2. Acceso desde múltiples dispositivos
3. Interfaz intuitiva
4. Base de datos centralizada
5. Generación de reportes

## Justificación del Desarrollo del Sistema DEVAD-MTO

### Problema Central Identificado

La ausencia de un sistema formal de gestión de mantenimiento genera:

1. **Pérdida de productividad** por paros no planificados
2. **Costos elevados** por mantenimiento correctivo
3. **Riesgos de seguridad** por falta de procedimientos
4. **Desperdicio de recursos** por falta de planificación
5. **Pérdida de información** valiosa sobre equipos

### Solución Propuesta

Desarrollo de un sistema integral que:

1. **Centralice la información** de equipos y mantenimientos
2. **Automatice la programación** de actividades preventivas
3. **Facilite el registro** de intervenciones
4. **Controle el inventario** de refacciones
5. **Genere indicadores** para mejora continua

### Criterios de Diseño del Sistema

#### Facilidad de Uso
- Interfaz intuitiva
- Curva de aprendizaje mínima
- Accesible desde cualquier dispositivo
- Diseño responsive

#### Funcionalidad
- Gestión completa de equipos
- Plantillas recurrentes
- Asignación automática
- Control de inventario
- Requisiciones de materiales

#### Escalabilidad
- Capacidad para crecer
- Módulos independientes
- Base de datos robusta
- Arquitectura moderna

#### Accesibilidad
- Basado en web
- Red local (sin dependencia de internet)
- Compatible con tablets y smartphones
- Sin requerir instalación en clientes

## Conclusiones del Diagnóstico

### Hallazgos Principales

1. El mantenimiento actual es **mayoritariamente reactivo**
2. **No existe un responsable formal** de mantenimiento
3. La **falta de registros** impide el análisis y mejora
4. Muchas fallas son **prevenibles y recurrentes**
5. Los operadores **tienen conocimiento valioso** no documentado

### Oportunidades de Mejora

1. **Implementar mantenimiento preventivo** programado
2. **Establecer procedimientos** estandarizados
3. **Crear sistema de registro** y seguimiento
4. **Desarrollar indicadores** de desempeño
5. **Capacitar al personal** en mejores prácticas

### Riesgos Identificados

#### Si no se implementa un sistema formal:
- Incremento de fallas críticas
- Mayor costo de mantenimiento
- Riesgos de seguridad
- Pérdida de competitividad
- Deterioro acelerado de equipos

#### Mitigación propuesta:
El sistema DEVAD-MTO como solución integral que aborda todos estos puntos de manera estructurada y sostenible.

## Referencias

- Observaciones directas en planta (Octubre 2024 - Diciembre 2025)
- Entrevistas con personal operativo y directivo
- Documentación técnica disponible
- Mejores prácticas de mantenimiento industrial
- Normas NOM aplicables
- Estándares ISO 55000 (Gestión de Activos)

---

**Documento complementario de:** CAPITULO-3-DESARROLLO.md  
**Proyecto:** Sistema DEVAD-MTO  
**Elaborado por:** Pedro de Muner  
**Institución:** Instituto Tecnológico Superior de Huatusco  
**Fecha:** Enero 2026
