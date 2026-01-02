export function formatearFecha(
  fecha: Date | null | undefined
): string | null {
  if (!fecha) return null;

  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');

  return `${y}/${m}/${d}`;
}

export function formatearFecha2(
  fecha: Date | null | undefined,
  formato: 'YYYY/MM/DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY' = 'YYYY/MM/DD'
): string | null {
  if (!fecha) return null;

  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');

  switch (formato) {
    case 'DD/MM/YYYY':
      return `${d}/${m}/${y}`;
    case 'MM/DD/YYYY':
      return `${m}/${d}/${y}`;
    case 'YYYY/MM/DD':
    default:
      return `${y}/${m}/${d}`;
  }
}


export function formatearFechaHora(
  fecha: Date | null | undefined,
  formato:
    | 'YYYY/MM/DD HH:mm'
    | 'DD/MM/YYYY HH:mm'
    | 'MM/DD/YYYY HH:mm' = 'YYYY/MM/DD HH:mm'
): string | null {
  if (!fecha) return null;

  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  const h = String(fecha.getHours()).padStart(2, '0');
  const min = String(fecha.getMinutes()).padStart(2, '0');

  switch (formato) {
    case 'DD/MM/YYYY HH:mm':
      return `${d}/${m}/${y} ${h}:${min}`;
    case 'MM/DD/YYYY HH:mm':
      return `${m}/${d}/${y} ${h}:${min}`;
    case 'YYYY/MM/DD HH:mm':
    default:
      return `${y}/${m}/${d} ${h}:${min}`;
  }
}



export function formatearHora(
  fecha: Date | null | undefined
): string | null {
  if (!fecha) return null;

  const h = String(fecha.getHours()).padStart(2, '0');
  const m = String(fecha.getMinutes()).padStart(2, '0');

  return `${h}:${m}`;
}
export function aDatetimeLocal(fecha: Date | string | null | undefined): string | null {
  if (!fecha) return null;

  let fechaObj: Date;

  if (typeof fecha === 'string') {

    const isoStr = fecha.trim().replace(' ', 'T');
    fechaObj = new Date(isoStr);
  } else {
    fechaObj = fecha;
  }

  if (isNaN(fechaObj.getTime())) return null;

  // Usamos el formato sueco (sv-SE) que es YYYY-MM-DD
  const dtf = new Intl.DateTimeFormat('sv-SE', {
    // QUITAMOS la zona horaria fija para que no reste las 6 horas
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = dtf.formatToParts(fechaObj);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value;

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
}

export function ahoraUTC(): Date {
  const ahora = new Date();
  return new Date(Date.UTC(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate(),
    ahora.getHours(),
    ahora.getMinutes(),
    ahora.getSeconds(),
    ahora.getMilliseconds()
  ));
}

export function sumarDias(
  fecha: Date | null | undefined,
  dias: number
): Date | null {
  if (!fecha || isNaN(fecha.getTime())) return null;

  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

export function obtenerInicioYFinSemanaLocal() {
  const hoy = new Date();
  const dia = hoy.getDay();
  const diffLunes = dia === 0 ? -6 : 1 - dia;
  const inicio = new Date(hoy);
  inicio.setDate(hoy.getDate() + diffLunes);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 7);
  return { inicio, fin };
}

export function obtenerHoyYMas15Dias() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 15);

  return { inicio, fin };
}


export function obtenerHoyYMas30Dias() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 30);

  return { inicio, fin };
}


export function diasTranscurridos(
  fechaInicio: Date | string,
  fechaFin: Date | string
): number {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    return 0; // o lanzar error si prefieres
  }

  const MS_POR_DIA = 1000 * 60 * 60 * 24;

  const diferenciaMs = fin.getTime() - inicio.getTime();

  return Math.floor(diferenciaMs / MS_POR_DIA);
}
