export interface HabitoData {
  id: number;
  categoria: number;
  descripcion: string;
  tipo: number;
  estado: number;
}


export interface HabitoPayload {
  categoria: number;
  descripcion: string;
  tipo: number;
  estado: number;
}
