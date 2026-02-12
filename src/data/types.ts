export interface MicorrizaRecord {
  Familia_Objetivo: string;
  Especie: string;
  Latitud: number;
  Longitud: number;
  Altitud: number;
  Habitat: 'Bosque' | 'Cultivo' | 'Pastizal';
  Espora_Diametro_um: number;
  Espora_Grosor_Pared_um: number;
  Espora_Color: string;
  Suelo_pH: number;
  Suelo_Nitrogeno_perc: number;
  Suelo_Textura: 'Franco' | 'Arcilloso' | 'Arenoso';
  Gen_Region_ITS: string;
}
