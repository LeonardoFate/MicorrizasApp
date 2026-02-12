import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Pressable, Platform } from 'react-native';
import MapView, { Marker, Callout, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { dataset } from '../../src/data/dataset';
import { MicorrizaRecord } from '../../src/data/types';
import { FAMILY_COLORS, FAMILY_LIST, HABITAT_COLORS } from '../../src/utils/colors';
import { countByField } from '../../src/utils/aggregations';

const HABITATS = ['Todos', 'Bosque', 'Cultivo', 'Pastizal'];

const INITIAL_REGION = {
  latitude: -20,
  longitude: -58,
  latitudeDelta: 60,
  longitudeDelta: 45,
};

// Map family colors to marker pin colors (closest available)
const MARKER_HUE: Record<string, number> = {
  'Glomeraceae': 210,        // blue
  'Gigasporaceae': 30,       // orange
  'Acaulosporaceae': 120,    // green
  'Diversisporaceae': 280,   // purple
  'Claroideoglomeraceae': 0, // red
};

export default function MapaScreen() {
  const { width, height } = useWindowDimensions();
  const mapRef = useRef<MapView>(null);

  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedHabitat, setSelectedHabitat] = useState<string>('Todos');

  const filteredData = useMemo(() => {
    let data = dataset;
    if (selectedFamily) data = data.filter((r) => r.Familia_Objetivo === selectedFamily);
    if (selectedHabitat !== 'Todos') data = data.filter((r) => r.Habitat === selectedHabitat);
    return data;
  }, [selectedFamily, selectedHabitat]);

  // Sample points for performance (max ~500 markers)
  const sampleRate = useMemo(() => Math.max(1, Math.ceil(filteredData.length / 500)), [filteredData.length]);
  const points = useMemo(() => {
    return filteredData.filter((_, i) => i % sampleRate === 0);
  }, [filteredData, sampleRate]);

  const familyStats = useMemo(() => countByField(filteredData, 'Familia_Objetivo'), [filteredData]);

  const resetMap = () => {
    mapRef.current?.animateToRegion(INITIAL_REGION, 500);
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        mapType="standard"
      >
        {points.map((r, i) => (
          <Marker
            key={i}
            coordinate={{ latitude: r.Latitud, longitude: r.Longitud }}
            pinColor={FAMILY_COLORS[r.Familia_Objetivo] || '#999'}
            tracksViewChanges={false}
          >
            <Callout style={styles.callout}>
              <View style={styles.calloutContent}>
                <Text style={styles.calloutSpecies}>{r.Especie}</Text>
                <Text style={styles.calloutFamily}>{r.Familia_Objetivo}</Text>
                <View style={styles.calloutDivider} />
                <View style={styles.calloutRow}>
                  <Text style={styles.calloutLabel}>Habitat</Text>
                  <Text style={styles.calloutValue}>{r.Habitat}</Text>
                </View>
                <View style={styles.calloutRow}>
                  <Text style={styles.calloutLabel}>Altitud</Text>
                  <Text style={styles.calloutValue}>{Math.round(r.Altitud)}m</Text>
                </View>
                <View style={styles.calloutRow}>
                  <Text style={styles.calloutLabel}>pH Suelo</Text>
                  <Text style={styles.calloutValue}>{r.Suelo_pH.toFixed(1)}</Text>
                </View>
                <View style={styles.calloutRow}>
                  <Text style={styles.calloutLabel}>Espora</Text>
                  <Text style={styles.calloutValue}>{Math.round(r.Espora_Diametro_um)} um</Text>
                </View>
                <View style={styles.calloutRow}>
                  <Text style={styles.calloutLabel}>Color</Text>
                  <Text style={styles.calloutValue}>{r.Espora_Color}</Text>
                </View>
                <View style={styles.calloutRow}>
                  <Text style={styles.calloutLabel}>Textura</Text>
                  <Text style={styles.calloutValue}>{r.Suelo_Textura}</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Overlay controls */}
      <View style={styles.overlay}>
        {/* Family filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>FAMILIA</Text>
          <View style={styles.filters}>
            <FilterChip
              label="Todos"
              active={!selectedFamily}
              color="#666"
              onPress={() => setSelectedFamily(null)}
            />
            {FAMILY_LIST.map((f) => (
              <FilterChip
                key={f}
                label={f.substring(0, 7)}
                active={selectedFamily === f}
                color={FAMILY_COLORS[f]}
                onPress={() => setSelectedFamily(selectedFamily === f ? null : f)}
              />
            ))}
          </View>
        </View>

        {/* Habitat filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>HABITAT</Text>
          <View style={styles.filters}>
            {HABITATS.map((h) => (
              <FilterChip
                key={h}
                label={h}
                active={selectedHabitat === h}
                color={h === 'Todos' ? '#666' : HABITAT_COLORS[h] || '#666'}
                onPress={() => setSelectedHabitat(h)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Bottom info bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomStats}>
          <Text style={styles.bottomCount}>
            {points.length} puntos
            {sampleRate > 1 ? ` (de ${filteredData.length})` : ` de ${filteredData.length}`}
          </Text>
          <View style={styles.legendRow}>
            {FAMILY_LIST.map((f) => {
              const count = familyStats.find((s) => s.label === f)?.value || 0;
              if (count === 0) return null;
              return (
                <View key={f} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: FAMILY_COLORS[f] }]} />
                  <Text style={styles.legendText}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <Pressable style={styles.resetBtn} onPress={resetMap}>
          <Text style={styles.resetBtnText}>Centrar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FilterChip({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.chip,
        { borderColor: color },
        active && { backgroundColor: color, borderColor: color },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? '#fff' : color },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  filterSection: {
    marginBottom: 4,
  },
  filterTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 1,
    marginBottom: 4,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '700',
  },
  callout: {
    width: 200,
  },
  calloutContent: {
    padding: 4,
  },
  calloutSpecies: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c3e50',
  },
  calloutFamily: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  calloutDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  calloutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  calloutLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  calloutValue: {
    fontSize: 10,
    color: '#444',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
  },
  bottomStats: {
    flex: 1,
  },
  bottomCount: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 3,
  },
  legendText: {
    fontSize: 9,
    color: '#888',
    fontWeight: '600',
  },
  resetBtn: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
