interface Tiempo {
    dias: number;
    horas: number;
    minutos: number;
    segundos: number;
}

/**
 * Calcula la fecha/hora exacta a partir de un tiempo restante
 * @param tiempo - objeto con dias, horas, minutos y segundos
 * @returns Date futura
 */
export function marcaTiempoAFecha(tiempo: Tiempo): Date {
    const ahora = new Date();
    ahora.setSeconds(ahora.getSeconds() + tiempo.segundos);
    ahora.setMinutes(ahora.getMinutes() + tiempo.minutos);
    ahora.setHours(ahora.getHours() + tiempo.horas);
    ahora.setDate(ahora.getDate() + tiempo.dias);

    return ahora;
}



export function generarMarcaDeTiempo(cantidad: number, unidad: number): number {
    const ahora = new Date();

    let ms = 0;
    switch (unidad) {
        case 1: // segundos
            ms = cantidad * 1000;
            break;
        case 2: // minutos
            ms = cantidad * 60 * 1000;
            break;
        case 3: // horas
            ms = cantidad * 60 * 60 * 1000;
            break;
        case 4: // días
            ms = cantidad * 24 * 60 * 60 * 1000;
            break;
        case 5: // meses aproximados: 30 días
            ms = cantidad * 30 * 24 * 60 * 60 * 1000;
            break;
        case 6: // años aproximados: 365 días
            ms = cantidad * 365 * 24 * 60 * 60 * 1000;
            break;
        default:
            throw new Error('Unidad no válida');
    }

    return Math.floor((ahora.getTime() + ms) / 1000);
}


export function calcularTiempoRestante(
    timestamp: number,
    unidad: 1 | 2 | 3 | 4 | 5 | 6,
    enSegundos = true
): number {
    const ahora = Date.now(); // ms
    const fecha = enSegundos ? timestamp * 1000 : timestamp; // convertir a ms solo una vez
    const diffMs = fecha - ahora; // diferencia en ms

    let resultado: number;

    switch (unidad) {
        case 1: 
            resultado = diffMs / 1000;             // segundos
            break;
        case 2: 
            resultado = diffMs / 1000 / 60;        // minutos
            break;
        case 3: 
            resultado = diffMs / 1000 / 60 / 60;   // horas
            break;
        case 4: 
            resultado = diffMs / 1000 / 60 / 60 / 24; // días
            break;
        case 5: 
            resultado = diffMs / 1000 / 60 / 60 / 24 / 30; // meses aprox
            break;
        case 6: 
            resultado = diffMs / 1000 / 60 / 60 / 24 / 365; // años aprox
            break;
        default: 
            throw new Error('Unidad no válida');
    }

    if(resultado<= 0){
        return 0;
    }

    // redondear a 2 decimales
    return Math.round(resultado * 100) / 100;
}



export function convertitMarcaDeTiempoAUnidades(timestampUnix: number) {
    const ahora = Math.floor(Date.now() / 1000); // timestamp actual en segundos
    let diff = timestampUnix - ahora; // diferencia en segundos

    if (diff <= 0) {
        return { dias: 0, horas: 0, minutos: 0, segundos: 0 }; // ya expiró
    }

    const dias = Math.floor(diff / 86400); // 1 día = 86400 segundos
    diff %= 86400;

    const horas = Math.floor(diff / 3600); // 1 hora = 3600 segundos
    diff %= 3600;

    const minutos = Math.floor(diff / 60); // 1 minuto = 60 segundos
    const segundos = diff % 60;

    return { dias, horas, minutos, segundos };
}
