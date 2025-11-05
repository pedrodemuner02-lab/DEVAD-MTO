# 📊 Plan de Muestreo Estadístico - DEVAD-MTO

Este directorio contiene la documentación completa y herramientas para el **Plan de Muestreo Estadístico** del Sistema de Mantenimiento Industrial DEVAD-MTO.

## 🎯 Objetivo

Justificar las mejoras implementadas en el sistema mediante **metodología estadística rigurosa**, utilizando herramientas de ingeniería industrial para crear secuencias de muestreo pseudoaleatorio que permitan acercarnos al valor real esperado y acreditar porcentajes de mejora.

## 📁 Archivos en este Directorio

### Documentación Principal

| Archivo | Descripción | Propósito |
|---------|-------------|-----------|
| **[JUSTIFICACION-MANUAL.md](./JUSTIFICACION-MANUAL.md)** | 🎯 **LEER PRIMERO** | Resumen ejecutivo y justificación del plan |
| **[PLAN-MUESTREO-ESTADISTICO.md](./PLAN-MUESTREO-ESTADISTICO.md)** | 📖 Plan completo | Marco teórico, fórmulas y metodología detallada |
| **[GUIA-PRACTICA-MUESTREO.md](./GUIA-PRACTICA-MUESTREO.md)** | 🛠️ Guía práctica | Instrucciones paso a paso para implementación |

### Código y Ejemplos

| Archivo | Descripción |
|---------|-------------|
| **[ejemplo-uso.js](./ejemplo-uso.js)** | 💡 Ejemplos de uso del servicio de muestreo |
| **[test-sampling.js](./test-sampling.js)** | ✅ Tests unitarios y validación |

### Implementación

La implementación del código está en:
```
src/services/samplingService.js
```

## 🚀 Inicio Rápido

### 1. Leer la Justificación

Comienza leyendo [JUSTIFICACION-MANUAL.md](./JUSTIFICACION-MANUAL.md) para entender:
- ¿Por qué necesitamos un plan de muestreo?
- ¿Cómo justifica las mejoras?
- ¿Qué resultados podemos esperar?

### 2. Revisar el Plan Completo

Lee [PLAN-MUESTREO-ESTADISTICO.md](./PLAN-MUESTREO-ESTADISTICO.md) para:
- Marco teórico estadístico
- Fórmulas y cálculos
- Diseño de la metodología
- Indicadores clave (KPIs)

### 3. Implementar en tu Sistema

Sigue [GUIA-PRACTICA-MUESTREO.md](./GUIA-PRACTICA-MUESTREO.md) para:
- Configurar las tablas en Supabase
- Calcular tamaño de muestra
- Seleccionar muestra aleatoria
- Registrar mediciones
- Analizar resultados

### 4. Ejecutar Ejemplos

```bash
# Ejecutar tests de validación
node docs/plan-muestreo/test-sampling.js

# Ejecutar ejemplos de uso (requiere npm install)
node docs/plan-muestreo/ejemplo-uso.js
```

## 📊 Metodología Resumida

### Fase 1: Configuración (Semanas 1-2)

```javascript
import samplingService from './src/services/samplingService';

// 1. Calcular tamaño de muestra
const n = samplingService.calcularTamañoMuestra(100, 0.95, 0.05);
// Resultado: 80 equipos

// 2. Seleccionar muestra aleatoria
const muestra = samplingService.seleccionarMuestraAleatoria(
  equipos, 
  80, 
  12345 // semilla
);
```

### Fase 2: Línea Base (Semanas 3-6)

- Registrar KPIs actuales de los 80 equipos
- Durante 4 semanas
- Establecer valores de referencia

### Fase 3: Intervención (Semanas 7-10)

- Implementar mejoras del sistema
- Asignación automática inteligente
- Plantillas recurrentes
- Balanceo de carga

### Fase 4: Post-Intervención (Semanas 11-14)

- Volver a medir los mismos 80 equipos
- Durante 4 semanas
- Comparar con línea base

### Fase 5: Análisis (Semanas 15-16)

```javascript
// Generar reporte de mejora
const reporte = samplingService.generarReporteMejora(
  datosBaseline,
  datosPost,
  kpiInfo
);

console.log(`Mejora: ${reporte.mejora.porcentaje.toFixed(2)}%`);
console.log(`Significativo: ${reporte.mejora.pruebaEstadistica.esSignificativo}`);
```

## 🎓 Conceptos Clave

### Muestreo Aleatorio Simple (MAS)

```
n = (Z² × p × q × N) / (e² × (N-1) + Z² × p × q)

Donde:
- n = Tamaño de muestra
- Z = 1.96 (95% confianza)
- p = 0.5 (máxima varianza)
- N = Tamaño población
- e = 0.05 (5% error)
```

### Generador Pseudoaleatorio (LCG)

```
Xn+1 = (48271 × Xn + 0) mod 2147483647
```

**Ventajas:**
- Reproducible (misma semilla = misma secuencia)
- Distribución uniforme
- Sin sesgos

### Intervalo de Confianza (95%)

```
IC = x̄ ± (1.96 × σ/√n)
```

Interpretación: Hay 95% de probabilidad de que el valor real esté en este rango.

### Prueba de Significancia (Prueba t)

```
H0: μpost ≤ μbaseline (No hay mejora)
H1: μpost > μbaseline (Hay mejora)

Si p < 0.05 → Mejora estadísticamente significativa
```

## 📈 KPIs Medidos

| KPI | Descripción | Meta | Unidad |
|-----|-------------|------|--------|
| **MTBF** | Mean Time Between Failures | ≥ 720h | Horas |
| **MTTR** | Mean Time To Repair | ≤ 4h | Horas |
| **OEE** | Overall Equipment Effectiveness | ≥ 85% | % |
| **Disponibilidad** | Uptime del equipo | ≥ 95% | % |
| **Cumplimiento PM** | Preventivos a tiempo | ≥ 90% | % |
| **Utilización** | Carga operadores | 70-90% | % |

## ✅ Validación

### Tests Implementados

1. ✅ Generador pseudoaleatorio
2. ✅ Cálculo de tamaño de muestra
3. ✅ Estadísticas descriptivas
4. ✅ Selección aleatoria sin reemplazo
5. ✅ Distribución uniforme
6. ✅ Cálculo de mejora porcentual
7. ✅ Intervalos de confianza

**Ejecutar tests:**
```bash
node docs/plan-muestreo/test-sampling.js
```

**Resultado esperado:**
```
Tests aprobados: 19/19
Porcentaje de éxito: 100.0%
✅ TODOS LOS TESTS PASARON EXITOSAMENTE
```

## 📚 Referencias Bibliográficas

- **Montgomery, D. C.** (2012). *Statistical Quality Control*. 7th Edition. Wiley.
- **Cochran, W. G.** (1977). *Sampling Techniques*. 3rd Edition. John Wiley & Sons.
- **Knuth, D. E.** (1997). *The Art of Computer Programming, Vol. 2*. 3rd Edition.
- **Niebel & Freivalds** (2013). *Ingeniería Industrial: Métodos y Estándares*. 13ª Ed.
- **ISO 9001:2015** - Quality Management Systems
- **ISO 55000** - Asset Management

## 🤝 Contribuciones

Este plan fue desarrollado siguiendo estándares de ingeniería industrial reconocidos internacionalmente y puede ser auditado, reproducido y extendido según las necesidades del proyecto.

## 📞 Soporte

Para preguntas sobre el plan de muestreo:

1. Revisar primero la [GUIA-PRACTICA-MUESTREO.md](./GUIA-PRACTICA-MUESTREO.md)
2. Consultar ejemplos en [ejemplo-uso.js](./ejemplo-uso.js)
3. Ejecutar tests para validar: [test-sampling.js](./test-sampling.js)

## 📝 Notas Importantes

⚠️ **Reproducibilidad**: Usa siempre la misma semilla para reproducir resultados  
⚠️ **Tamaño mínimo**: n ≥ 30 para aplicar Teorema del Límite Central  
⚠️ **Independencia**: Las mediciones deben ser independientes  
⚠️ **Aleatoriedad**: No modificar manualmente la muestra seleccionada  

---

**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Autor:** Pedro Demuner - DEVAD-MTO  
**Instituto:** Tecnológico Superior de Huatusco

---

## 🎯 Resultado Esperado

Con este plan de muestreo podrás:

✅ **Justificar mejoras** con evidencia cuantitativa  
✅ **Calcular porcentajes de mejora** con intervalos de confianza  
✅ **Validar significancia estadística** de los cambios  
✅ **Documentar resultados** de forma auditable  
✅ **Reproducir análisis** cuando sea necesario  

**¡El sistema está completamente documentado y listo para usar!** 🚀
