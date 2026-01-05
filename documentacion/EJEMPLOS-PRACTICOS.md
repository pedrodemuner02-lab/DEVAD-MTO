# EJEMPLOS PRÁCTICOS Y CASOS DE USO

## Introducción

Este documento complementa la documentación principal con ejemplos concretos y casos de uso reales del sistema DEVAD-MTO en operación.

## CASO 1: Mantenimiento Preventivo de Chumaceras

### Contexto
Las chumaceras (rodamientos) son componentes críticos en bandas transportadoras, motores y ventiladores. Su falla puede causar paros costosos.

### Problema Anterior
- Lubricación irregular (cada 2-3 meses sin control)
- Fallas inesperadas por falta de engrase
- No se registraban las intervenciones
- Pérdida de información sobre tipo de grasa usada

### Solución con DEVAD-MTO

#### 1. Creación de Plantilla Recurrente

**Configuración en el sistema:**
```
Tipo: Mantenimiento Preventivo
Familia: Bandas Transportadoras
Título: "Lubricación y verificación de chumaceras"
Frecuencia: Mensual
Días: Primer lunes de cada mes
Hora preferida: 08:00 AM
Complejidad: Media (2 puntos)
Duración estimada: 45 minutos
```

#### 2. Checklist Detallado

**Items del checklist:**
1. ☑️ Inspección visual del alojamiento
   - Criterio: Sin grietas ni deformaciones
   - Registro: Foto si hay anomalía

2. ☑️ Verificar ausencia de fugas
   - Criterio: Sellos íntegros, sin pérdida de grasa
   - Registro: OK / No conforme

3. ☑️ Medir temperatura superficial
   - Criterio: ≤ 30°C sobre ambiente
   - Registro: Temperatura medida en °C
   - Ejemplo: "Ambiente: 28°C, Chumacera: 52°C → OK"

4. ☑️ Verificar ruido de operación
   - Criterio: Sin ruidos anormales (chirridos, golpeteos)
   - Registro: Normal / Anormal (describir)

5. ☑️ Verificar vibración
   - Criterio: Sin vibración perceptible al tacto
   - Registro: Normal / Anormal

6. ☑️ Verificar holgura axial y radial
   - Criterio: Según especificación del fabricante
   - Registro: Dentro de tolerancia / Fuera de tolerancia

7. ☑️ Limpieza exterior
   - Acción: Remover suciedad acumulada
   - Registro: Realizado

8. ☑️ Aplicación de lubricante
   - Especificación: Grasa NLGI 2, Litio EP
   - Cantidad: 2 disparos de pistola engrasadora
   - Registro: Fecha, cantidad, tipo de grasa
   - Ejemplo: "05/01/2026 - 2 disparos - Mobilux EP2"

9. ☑️ Verificar tornillería de fijación
   - Criterio: Apriete según ficha (torque 40 Nm)
   - Registro: OK / Reapretado

10. ☑️ Observaciones generales
    - Campo libre para comentarios
    - Ejemplo: "Se detectó ligero aumento de temperatura, programar seguimiento en 2 semanas"

#### 3. Flujo de Ejecución

**Día del mantenimiento (primer lunes):**

1. **06:00 AM** - Sistema genera instancia automáticamente
2. **06:15 AM** - Sistema asigna a operador del turno mañana con menor carga
3. **07:45 AM** - Operador Juan Pérez inicia sesión en tablet
4. **07:50 AM** - Ve el mantenimiento en su lista, estado: "Programado"
5. **08:00 AM** - Abre la orden de trabajo
6. **08:05 AM** - Cambia estado a "En Proceso"
7. **08:10-08:45 AM** - Ejecuta checklist paso a paso
   - Marca cada item conforme lo completa
   - Registra mediciones
   - Toma foto de temperatura con termómetro
8. **08:50 AM** - Registra repuesto usado: "Grasa Mobilux EP2 - 50g"
9. **08:52 AM** - Sistema actualiza inventario automáticamente
10. **08:55 AM** - Cambia estado a "Completado"
11. **08:55 AM** - Sistema actualiza historial del equipo

#### 4. Beneficio Obtenido

**Antes de DEVAD-MTO:**
- Fallas inesperadas: 3-4 por año
- Costo promedio por falla: $2,500 USD
- Tiempo de paro: 4-6 horas cada vez
- Costo anual en fallas: $10,000 USD

**Después de DEVAD-MTO:**
- Fallas inesperadas: 0-1 por año
- Mantenimiento preventivo mensual: $50 USD x 12 = $600 USD
- Ahorro anual: $9,400 USD
- **ROI: 1,567%**

## CASO 2: Gestión de Inventario con Alertas Automáticas

### Contexto
Control de filtros de aire para incubadoras (consumible crítico).

### Problema Anterior
- No se sabía cuántos filtros había en stock
- Compras de emergencia a sobreprecio
- Retrasos en mantenimiento por falta de material

### Solución con DEVAD-MTO

#### Configuración en Inventario

```
Código: FILT-INC-001
Nombre: Filtro de aire HEPA incubadora
Descripción: Filtro de alta eficiencia para sistema de ventilación
Categoría: Consumibles
Unidad: Pieza
Stock actual: 8 unidades
Stock mínimo: 5 unidades
Stock máximo: 20 unidades
Ubicación: Almacén General - Rack A3
Costo unitario: $45.00 USD
Proveedor: Jamesway México
Tiempo de entrega: 5 días hábiles
```

#### Escenario Real

**Lunes 15/01/2026:**
- Stock actual: 6 unidades ✅ OK

**Martes 16/01/2026:**
- Mantenimiento semanal de 2 incubadoras
- Operador reemplaza 2 filtros
- Registra en el sistema: "Usados 2 filtros FILT-INC-001"
- Sistema actualiza automáticamente:
  - Stock actual: 6 → 4 unidades
  - 🚨 **ALERTA: Stock por debajo del mínimo (5)**

**Dashboard del Jefe de Mantenimiento muestra:**
```
⚠️ ALERTA DE INVENTARIO
━━━━━━━━━━━━━━━━━━━━━━━━━
Código: FILT-INC-001
Producto: Filtro de aire HEPA incubadora
Stock actual: 4 unidades
Stock mínimo: 5 unidades
❌ Faltante: 1 unidad

Acción recomendada:
→ Generar requisición por 12 unidades
  (alcanzar 16 unidades, cerca del máximo)
```

**Miércoles 17/01/2026:**
- Jefe crea requisición automática desde la alerta
- Requisición incluye:
  - 12 unidades de FILT-INC-001
  - Justificación: "Reposición por stock mínimo alcanzado"
  - Prioridad: Alta

**Jueves 18/01/2026:**
- Administrador aprueba requisición
- Se envía orden de compra al proveedor

**Miércoles 24/01/2026:**
- Llegan los 12 filtros
- Almacenista registra entrada en sistema
- Stock actualizado: 4 → 16 unidades ✅

#### Beneficio Obtenido
- Nunca más faltante de filtros críticos
- Compras planificadas a mejor precio
- Trazabilidad completa de consumo
- Reducción de 70% en compras de emergencia

## CASO 3: Generación Automática de Instancias Recurrentes

### Contexto
Inspección diaria de incubadoras (tarea crítica que se debe hacer todos los días).

### Configuración de Plantilla

**Plantilla creada el 01/01/2026:**
```
Título: Inspección diaria de parámetros - Incubadoras 1-6
Equipo: Familia "Incubadoras"
Tipo: Preventivo
Complejidad: Baja (1 punto)
Frecuencia: Semanal
Días de la semana: L M X J V S D (todos los días)
Hora preferida: 07:00 AM
Duración estimada: 30 minutos
```

**Checklist rápido:**
1. ☑️ Verificar temperatura: 37.5°C ± 0.3°C
2. ☑️ Verificar humedad: 55% ± 5%
3. ☑️ Verificar alarmas: Sin alertas activas
4. ☑️ Inspección visual: Sin anomalías
5. ☑️ Registrar lecturas en sistema

### Instancias Generadas Automáticamente

**Sistema genera al crear la plantilla:**

```
📅 SEMANA 1 (01-07 Ene 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Lun 01/01 - 07:00 → Asignado: Juan Pérez (Turno Mañana)
✓ Mar 02/01 - 07:00 → Asignado: María López (Turno Mañana)
✓ Mié 03/01 - 07:00 → Asignado: Juan Pérez (Turno Mañana)
✓ Jue 04/01 - 07:00 → Asignado: María López (Turno Mañana)
✓ Vie 05/01 - 07:00 → Asignado: Juan Pérez (Turno Mañana)
✓ Sáb 06/01 - 07:00 → Asignado: Carlos Ruiz (Turno Mañana)
✓ Dom 07/01 - 07:00 → Asignado: Ana Torres (Turno Mañana)

📅 SEMANA 2 (08-14 Ene 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Lun 08/01 - 07:00 → Asignado: María López
✓ Mar 09/01 - 07:00 → Asignado: Juan Pérez
[... continúa automáticamente ...]

📅 SEMANA 3 (15-21 Ene 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[... generadas automáticamente ...]

📅 SEMANA 4 (22-28 Ene 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[... generadas automáticamente ...]
```

**Total generado:** 28 instancias (4 semanas × 7 días)

### Balanceo de Carga Automático

El sistema distribuye considerando:
- Complejidad de cada tarea (en este caso: 1 punto)
- Carga acumulada de cada operador
- Turno correspondiente a la hora programada
- Rotación equitativa

**Ejemplo de distribución en Semana 1:**
```
Operador          Tareas    Puntos    Complejidad Total
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Juan Pérez        3         3×1       3 puntos
María López       3         3×1       3 puntos
Carlos Ruiz       1         1×1       1 punto
Ana Torres        1         1×1       1 punto
```

### Beneficio Obtenido
- **Tiempo ahorrado:** 4 horas/semana en planificación manual
- **0 olvidos:** Todas las inspecciones programadas automáticamente
- **Distribución justa:** Carga balanceada entre operadores
- **Visibilidad:** Todos saben qué les toca cada día

## CASO 4: Escalamiento de Problema Durante Mantenimiento

### Escenario
Durante una lubricación rutinaria, el operador detecta un problema mayor.

### Flujo Paso a Paso

**Martes 09/01/2026 - 09:30 AM**

1. **Operador Pedro ejecuta:** "Lubricación mensual Banda 3"
2. **Al revisar checklist, nota:**
   - ☑️ Temperatura: 65°C (límite: 58°C) ❌
   - ☑️ Ruido: Chirrido intermitente ❌
   - ☑️ Vibración: Perceptible al tacto ❌

3. **Operador registra en observaciones:**
   ```
   "Temperatura excesiva (65°C vs 58°C máx). 
   Ruido anormal tipo chirrido. 
   Vibración perceptible.
   Posible rodamiento dañado.
   REQUIERE ATENCIÓN URGENTE."
   ```

4. **Operador cambia estado:**
   - De: "En Proceso"
   - A: "Requiere Intervención" (nuevo estado)

5. **Sistema notifica automáticamente:**
   - 📧 Email al Jefe de Mantenimiento
   - 📱 Notificación en Dashboard
   - 🚨 Marca el equipo con alerta

6. **Jefe de Mantenimiento (10 minutos después):**
   - Ve notificación
   - Revisa observaciones y fotos
   - Decide: "Parar equipo, reemplazar rodamiento"

7. **Jefe crea nueva orden correctiva:**
   ```
   Tipo: Correctivo
   Prioridad: Alta
   Título: "Reemplazo rodamiento Banda 3"
   Descripción: "Rodamiento dañado detectado en PM"
   Referencia: Link a mantenimiento preventivo original
   Asignado: Técnico especialista externo
   Fecha: Hoy mismo
   ```

8. **Sistema verifica inventario:**
   - Busca: "Rodamiento 6206 ZZ"
   - Stock: 2 unidades ✅ Disponible

9. **Miércoles 10/01/2026 - Resolución:**
   - Técnico completa reemplazo
   - Registra repuestos usados
   - Actualiza estado a "Completado"
   - Sistema actualiza historial del equipo

### Trazabilidad Completa

**En el historial del Equipo "Banda 3" aparece:**
```
📅 09/01/2026 09:30 - Preventivo - Completado
   "Lubricación mensual"
   Ejecutado por: Pedro Gómez
   ⚠️ Anomalía detectada: Temperatura/ruido/vibración

📅 09/01/2026 10:15 - Correctivo - En Proceso  
   "Reemplazo rodamiento"
   Asignado a: Técnico Externo
   Relacionado con: PM del 09/01

📅 10/01/2026 14:00 - Correctivo - Completado
   "Reemplazo rodamiento 6206 ZZ"
   Costo: $185.00 USD
   Tiempo: 3.5 horas
   ✅ Problema resuelto
```

### Análisis de Valor

**Sin DEVAD-MTO (escenario anterior):**
- Falla catastrófica del rodamiento
- Daños a la banda completa
- Paro de 2 días
- Costo: $3,500 USD

**Con DEVAD-MTO (escenario actual):**
- Detección temprana en PM rutinario
- Intervención planificada
- Paro de 3.5 horas
- Costo: $185 USD
- **Ahorro: $3,315 USD**
- **Prevención de daños mayores**

## CASO 5: Análisis de KPIs para Mejora Continua

### Escenario
Después de 3 meses de operación, se analizan indicadores.

### Dashboard de KPIs - Marzo 2026

```
📊 INDICADORES DE MANTENIMIENTO
Periodo: Enero - Marzo 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CUMPLIMIENTO DE PM
   ✅ 94.5% (Meta: 90%)
   ▰▰▰▰▰▰▰▰▰▱ 
   
   Ene: 91% (ajuste inicial)
   Feb: 95%
   Mar: 97%
   📈 Tendencia: Mejorando

2. TIEMPO MEDIO PARA REPARAR (MTTR)
   ⏱️ 2.3 horas (Meta: <4 horas)
   ▰▰▰▰▰▰▱▱▱▱
   
   Reducción vs. línea base: 60%
   ✅ Meta superada

3. TIEMPO MEDIO ENTRE FALLAS (MTBF)
   📅 156 horas (Meta: >100 horas)
   ▰▰▰▰▰▰▰▰▱▱
   
   Mejora vs. línea base: +89%
   ✅ Meta superada

4. PAROS NO PROGRAMADOS
   🛑 3 eventos (Meta: <5 por mes)
   
   Ene: 2 paros
   Feb: 1 paro
   Mar: 0 paros
   📈 Tendencia: Excelente

5. DISPONIBILIDAD OPERATIVA
   ✅ 98.7% (Meta: >95%)
   ▰▰▰▰▰▰▰▰▰▰
   
   Mejora vs. línea base: +6.2%
   ✅ Meta superada
```

### Análisis de Datos

#### Equipos con Más Intervenciones
```
Equipo                  PM    Correctivos   Total
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Incubadora 12           12    3             15
Banda Transporte 3      12    2             14
Nacedora 2              12    1             13
Lavadora Charolas 1     6     2             8
```

**Insight:** Incubadora 12 requiere más correctivos que el promedio
**Acción:** Revisar condiciones de operación, posible necesidad de overhaul

#### Consumo de Repuestos
```
Repuesto                 Cantidad    Costo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Filtros HEPA             24          $1,080
Rodamientos 6206 ZZ      8           $320
Grasa Mobilux EP2        12kg        $180
Correas tipo A           6           $240
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL                                $1,820
```

**Análisis de costos:**
- Costo PM mensual: $606 USD
- Costo correctivos evitados: ~$8,500 USD
- **ROI: 1,304%**

### Decisiones Basadas en Datos

**Decisión 1: Ajustar frecuencia de PM**
- Incubadora 12 pasa de mensual a quincenal
- Objetivo: Reducir correctivos

**Decisión 2: Stock de seguridad**
- Aumentar stock mínimo de rodamientos 6206
- De 2 a 4 unidades (alta rotación detectada)

**Decisión 3: Capacitación adicional**
- Operadores requieren refuerzo en detección de temperatura anormal
- Programar sesión de 1 hora

## Conclusiones de los Casos Prácticos

### Beneficios Tangibles Demostrados

1. **Reducción de Costos**
   - Ahorro promedio: 85% vs. mantenimiento reactivo
   - ROI del sistema: Positivo en el primer trimestre

2. **Mejora en Confiabilidad**
   - Disponibilidad operativa: +6.2%
   - Paros no programados: -75%

3. **Optimización de Recursos**
   - Tiempo de planificación: -80%
   - Eficiencia de operadores: +40%

4. **Calidad de Información**
   - Trazabilidad completa: 100%
   - Decisiones basadas en datos: Habilitadas

5. **Cultura de Mantenimiento**
   - Personal adopta enfoque preventivo
   - Proactividad en detección de problemas
   - Mejora continua sistemática

### Factores Críticos de Éxito

1. ✅ Sistema intuitivo y fácil de usar
2. ✅ Capacitación efectiva del personal
3. ✅ Apoyo de la dirección
4. ✅ Datos confiables y actualizados
5. ✅ Seguimiento constante de KPIs
6. ✅ Ajustes basados en retroalimentación

---

**Documento de casos prácticos:** Sistema DEVAD-MTO  
**Basado en:** Operación real de Enero-Marzo 2026  
**Elaborado por:** Pedro de Muner  
**Institución:** Instituto Tecnológico Superior de Huatusco
