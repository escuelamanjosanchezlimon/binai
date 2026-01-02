// recordatorio.model.ts
export interface CreateRecordatorio {
  titulo: string;
  descripcion: string;
  repetir_cada: number; 
  unidad: string;     
  fecha_limite: string; 
  tipo: string;       
  estado: string;     
}

export interface UpdateRecordatorio {
  titulo: string;
  descripcion: string;
  repetir_cada: number; 
  unidad: string;     
  fecha_limite: string; 
  tipo: string;       
  estado: string;   
  fecha_cambio: Date  
}