
export interface TareaLista {
    id: number;
    created_at: string;
    titulo: string;
    tipo: number;
    descripcion: string;
    prioridad: number;
    estado: string;
    fecha_completada: string | null;
    expiracion: number;
    unidad: number;
    _loading?: boolean;

}


