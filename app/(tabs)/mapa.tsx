import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import ScreenContainer from '../../src/components/ui/ScreenContainer';
import SectionCard from '../../src/components/ui/SectionCard';
import { dataset } from '../../src/data/dataset';
import { FAMILY_COLORS, FAMILY_LIST } from '../../src/utils/colors';
import Svg, { Circle, Rect, Text as SvgText, Line } from 'react-native-svg';

const MAP_W = 360;
const MAP_H = 400;
const PAD = 30;

// South America bounds
const LAT_MIN = -55;
const LAT_MAX = 12;
const LON_MIN = -80;
const LON_MAX = -35;

function latToY(lat: number) {
  return PAD + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (MAP_H - PAD * 2);
}
function lonToX(lon: number) {
  return PAD + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (MAP_W - PAD * 2);
}

export default function MapaScreen() {
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    if (!selectedFamily) return dataset;
    return dataset.filter((r) => r.Familia_Objetivo === selectedFamily);
  }, [selectedFamily]);

  // Sample for performance
  const points = useMemo(() => {
    const sampled = filteredData.filter((_, i) => i % 2 === 0);
    return sampled.map((r) => ({
      x: lonToX(r.Longitud),
      y: latToY(r.Latitud),
      color: FAMILY_COLORS[r.Familia_Objetivo] || '#ccc',
      familia: r.Familia_Objetivo,
      especie: r.Especie,
    }));
  }, [filteredData]);

  return (
    <ScreenContainer>
      <SectionCard title={`Distribucion Geografica (${filteredData.length} registros)`}>
        <View style={styles.filters}>
          <Text
            style={[styles.filterChip, !selectedFamily && styles.filterChipActive]}
            onPress={() => setSelectedFamily(null)}
          >
            Todos
          </Text>
          {FAMILY_LIST.map((f) => (
            <Text
              key={f}
              style={[
                styles.filterChip,
                selectedFamily === f && styles.filterChipActive,
                { borderColor: FAMILY_COLORS[f] },
                selectedFamily === f && { backgroundColor: FAMILY_COLORS[f] },
              ]}
              onPress={() => setSelectedFamily(selectedFamily === f ? null : f)}
            >
              {f.substring(0, 8)}
            </Text>
          ))}
        </View>

        <View style={styles.chartCenter}>
          <Svg width={MAP_W} height={MAP_H}>
            {/* Background */}
            <Rect x={PAD} y={PAD} width={MAP_W - PAD * 2} height={MAP_H - PAD * 2} fill="#e8f4f8" rx={4} />

            {/* Grid lines */}
            {[-50, -40, -30, -20, -10, 0, 10].map((lat) => (
              <React.Fragment key={`lat-${lat}`}>
                <Line x1={PAD} y1={latToY(lat)} x2={MAP_W - PAD} y2={latToY(lat)} stroke="#cde" strokeWidth={0.5} />
                <SvgText x={PAD - 4} y={latToY(lat) + 3} textAnchor="end" fontSize={8} fill="#999">{lat}</SvgText>
              </React.Fragment>
            ))}
            {[-75, -65, -55, -45, -35].map((lon) => (
              <React.Fragment key={`lon-${lon}`}>
                <Line x1={lonToX(lon)} y1={PAD} x2={lonToX(lon)} y2={MAP_H - PAD} stroke="#cde" strokeWidth={0.5} />
                <SvgText x={lonToX(lon)} y={MAP_H - PAD + 14} textAnchor="middle" fontSize={8} fill="#999">{lon}</SvgText>
              </React.Fragment>
            ))}

            {/* Axis labels */}
            <SvgText x={MAP_W / 2} y={MAP_H - 2} textAnchor="middle" fontSize={10} fill="#666">Longitud</SvgText>
            <SvgText x={6} y={MAP_H / 2} textAnchor="middle" fontSize={10} fill="#666" rotation={-90} originX={6} originY={MAP_H / 2}>Latitud</SvgText>

            {/* Data points */}
            {points.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={2} fill={p.color} opacity={0.7} />
            ))}
          </Svg>
        </View>

        <View style={styles.legend}>
          {FAMILY_LIST.map((f) => (
            <View key={f} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: FAMILY_COLORS[f] }]} />
              <Text style={styles.legendText}>{f}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Nota">
        <Text style={styles.noteText}>
          Mapa esquematico basado en coordenadas Lat/Lon del dataset.
          Los puntos representan ubicaciones simuladas en Sudamerica
          (Lat: {LAT_MIN} a {LAT_MAX}, Lon: {LON_MIN} a {LON_MAX}).
        </Text>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chartCenter: { alignItems: 'center', paddingVertical: 8 },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#999',
    fontSize: 11,
    color: '#555',
    overflow: 'hidden',
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
    color: '#fff',
  },
  legend: { marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 12, color: '#555' },
  noteText: { fontSize: 12, color: '#777', lineHeight: 18 },
});
