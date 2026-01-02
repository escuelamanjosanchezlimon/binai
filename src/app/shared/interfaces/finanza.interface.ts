export interface FinanzaData {
    id: number;
    create_at: string;
    descripcion: string;
    monto: number;
    tipo: number;
}


export interface FinanzaPayload {
    descripcion: string;
    monto: number;
    tipo: number;
}