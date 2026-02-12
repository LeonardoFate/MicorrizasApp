import { MicorrizaRecord } from '../data/types';

export function countByField(data: MicorrizaRecord[], field: keyof MicorrizaRecord) {
  const counts: Record<string, number> = {};
  data.forEach((r) => {
    const key = String(r[field]);
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function averageByGroup(
  data: MicorrizaRecord[],
  groupField: keyof MicorrizaRecord,
  valueField: keyof MicorrizaRecord
) {
  const groups: Record<string, { sum: number; count: number }> = {};
  data.forEach((r) => {
    const key = String(r[groupField]);
    const val = Number(r[valueField]);
    if (!groups[key]) groups[key] = { sum: 0, count: 0 };
    groups[key].sum += val;
    groups[key].count += 1;
  });
  return Object.entries(groups)
    .map(([label, { sum, count }]) => ({ label, value: Math.round((sum / count) * 100) / 100 }))
    .sort((a, b) => b.value - a.value);
}

export function crossTabCount(
  data: MicorrizaRecord[],
  rowField: keyof MicorrizaRecord,
  colField: keyof MicorrizaRecord
) {
  const result: Record<string, Record<string, number>> = {};
  const colKeys = new Set<string>();
  data.forEach((r) => {
    const row = String(r[rowField]);
    const col = String(r[colField]);
    colKeys.add(col);
    if (!result[row]) result[row] = {};
    result[row][col] = (result[row][col] || 0) + 1;
  });
  return { data: result, columns: Array.from(colKeys).sort() };
}

export function rangeByGroup(
  data: MicorrizaRecord[],
  groupField: keyof MicorrizaRecord,
  valueField: keyof MicorrizaRecord
) {
  const groups: Record<string, number[]> = {};
  data.forEach((r) => {
    const key = String(r[groupField]);
    const val = Number(r[valueField]);
    if (!groups[key]) groups[key] = [];
    groups[key].push(val);
  });
  return Object.entries(groups).map(([label, values]) => ({
    label,
    min: Math.round(Math.min(...values) * 100) / 100,
    max: Math.round(Math.max(...values) * 100) / 100,
    avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
  }));
}
