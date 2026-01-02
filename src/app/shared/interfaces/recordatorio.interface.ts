export interface Recordatorio {
    id: number;
    titulo: string;
    descripcion: string;
    repetir_cada: number;
    unidad: string;
    fecha_limite: Date;
    create_at: Date;
    tipo: string;
    estado: string;
    fecha_cambio: Date ;
}
