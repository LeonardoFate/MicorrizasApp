const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, '../../ProyectoINT/dataset_micorrizas_pis.csv');
const outputPath = path.resolve(__dirname, '../src/data/dataset.ts');

const csv = fs.readFileSync(csvPath, 'utf-8');
const lines = csv.trim().split('\n');
const headers = lines[0].split(',');

const records = [];
for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');
  if (values.length !== headers.length) continue;
  records.push({
    Familia_Objetivo: values[0],
    Especie: values[1],
    Latitud: parseFloat(values[2]),
    Longitud: parseFloat(values[3]),
    Altitud: parseFloat(values[4]),
    Habitat: values[5],
    Espora_Diametro_um: parseFloat(values[6]),
    Espora_Grosor_Pared_um: parseFloat(values[7]),
    Espora_Color: values[8],
    Suelo_pH: parseFloat(values[9]),
    Suelo_Nitrogeno_perc: parseFloat(values[10]),
    Suelo_Textura: values[11],
    Gen_Region_ITS: values[12],
  });
}

const output = `import { MicorrizaRecord } from './types';

export const dataset: MicorrizaRecord[] = ${JSON.stringify(records, null, 2)};
`;

fs.writeFileSync(outputPath, output, 'utf-8');
console.log(`Generated ${records.length} records to ${outputPath}`);
