export interface SecretoData {
    id: number,
    descripcion: string;
    contenido: string;
    salt: string;
}


export interface SecretoPayload {
    descripcion: string;
    contenido: string;
    salt: string;
}