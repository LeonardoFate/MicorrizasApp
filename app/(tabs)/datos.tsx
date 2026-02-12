import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { dataset } from '../../src/data/dataset';
import { MicorrizaRecord } from '../../src/data/types';
import { FAMILY_COLORS } from '../../src/utils/colors';

const FAMILIES = ['Todos', ...new Set(dataset.map((r) => r.Familia_Objetivo))];
const HABITATS = ['Todos', ...new Set(dataset.map((r) => r.Habitat))];
const TEXTURES = ['Todos', ...new Set(dataset.map((r) => r.Suelo_Textura))];

export default function DatosScreen() {
  const [search, setSearch] = useState('');
  const [familyFilter, setFamilyFilter] = useState('Todos');
  const [habitatFilter, setHabitatFilter] = useState('Todos');
  const [textureFilter, setTextureFilter] = useState('Todos');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof MicorrizaRecord | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const filteredData = useMemo(() => {
    let data = dataset;
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.Especie.toLowerCase().includes(s) ||
          r.Familia_Objetivo.toLowerCase().includes(s)
      );
    }
    if (familyFilter !== 'Todos') data = data.filter((r) => r.Familia_Objetivo === familyFilter);
    if (habitatFilter !== 'Todos') data = data.filter((r) => r.Habitat === habitatFilter);
    if (textureFilter !== 'Todos') data = data.filter((r) => r.Suelo_Textura === textureFilter);
    if (sortField) {
      data = [...data].sort((a, b) => {
        const va = a[sortField];
        const vb = b[sortField];
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortAsc ? va - vb : vb - va;
        }
        return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
    }
    return data;
  }, [search, familyFilter, habitatFilter, textureFilter, sortField, sortAsc]);

  const handleSort = (field: keyof MicorrizaRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: MicorrizaRecord; index: number }) => {
      const isExpanded = expandedIndex === index;
      return (
        <TouchableOpacity
          style={[styles.row, index % 2 === 0 && styles.rowAlt]}
          onPress={() => setExpandedIndex(isExpanded ? null : index)}
          activeOpacity={0.7}
        >
          <View style={styles.rowMain}>
            <View style={[styles.familyDot, { backgroundColor: FAMILY_COLORS[item.Familia_Objetivo] || '#ccc' }]} />
            <Text style={styles.cellSpecies} numberOfLines={1}>{item.Especie}</Text>
            <Text style={styles.cellSmall}>{item.Habitat}</Text>
            <Text style={styles.cellNum}>{Math.round(item.Espora_Diametro_um)}</Text>
            <Text style={styles.cellNum}>{item.Suelo_pH.toFixed(1)}</Text>
          </View>
          {isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedRow}>Familia: {item.Familia_Objetivo}</Text>
              <Text style={styles.expandedRow}>Latitud: {item.Latitud.toFixed(4)}</Text>
              <Text style={styles.expandedRow}>Longitud: {item.Longitud.toFixed(4)}</Text>
              <Text style={styles.expandedRow}>Altitud: {Math.round(item.Altitud)}m</Text>
              <Text style={styles.expandedRow}>Color: {item.Espora_Color}</Text>
              <Text style={styles.expandedRow}>Grosor Pared: {item.Espora_Grosor_Pared_um.toFixed(2)} um</Text>
              <Text style={styles.expandedRow}>Nitrogeno: {(item.Suelo_Nitrogeno_perc * 100).toFixed(1)}%</Text>
              <Text style={styles.expandedRow}>Textura: {item.Suelo_Textura}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [expandedIndex]
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar especie o familia..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <FilterChips label="Familia" options={FAMILIES} value={familyFilter} onChange={setFamilyFilter} />
      </View>
      <View style={styles.filtersRow}>
        <FilterChips label="Habitat" options={HABITATS} value={habitatFilter} onChange={setHabitatFilter} />
        <FilterChips label="Textura" options={TEXTURES} value={textureFilter} onChange={setTextureFilter} />
      </View>

      <Text style={styles.countText}>
        Mostrando {filteredData.length} de {dataset.length} registros
      </Text>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerCellDot}> </Text>
        <Pressable style={styles.headerCellSpecies} onPress={() => handleSort('Especie')}>
          <Text style={styles.headerText}>Especie {sortField === 'Especie' ? (sortAsc ? '▲' : '▼') : ''}</Text>
        </Pressable>
        <Pressable style={styles.headerCellSmall} onPress={() => handleSort('Habitat')}>
          <Text style={styles.headerText}>Habitat {sortField === 'Habitat' ? (sortAsc ? '▲' : '▼') : ''}</Text>
        </Pressable>
        <Pressable style={styles.headerCellNum} onPress={() => handleSort('Espora_Diametro_um')}>
          <Text style={styles.headerText}>Diam {sortField === 'Espora_Diametro_um' ? (sortAsc ? '▲' : '▼') : ''}</Text>
        </Pressable>
        <Pressable style={styles.headerCellNum} onPress={() => handleSort('Suelo_pH')}>
          <Text style={styles.headerText}>pH {sortField === 'Suelo_pH' ? (sortAsc ? '▲' : '▼') : ''}</Text>
        </Pressable>
      </View>

      {/* Data */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(_, i) => String(i)}
        style={styles.list}
        initialNumToRender={30}
        maxToRenderPerBatch={30}
        windowSize={10}
      />
    </View>
  );
}

function FilterChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}:</Text>
      {options.map((opt) => (
        <Text
          key={opt}
          style={[styles.chip, value === opt && styles.chipActive]}
          onPress={() => onChange(opt)}
        >
          {opt === 'Todos' ? 'Todos' : opt.substring(0, 10)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchRow: {
    padding: 12,
    paddingBottom: 4,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
    marginRight: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    fontSize: 10,
    color: '#555',
    overflow: 'hidden',
  },
  chipActive: {
    backgroundColor: '#2196F3',
    color: '#fff',
  },
  countText: {
    fontSize: 12,
    color: '#888',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
    alignItems: 'center',
  },
  headerCellDot: { width: 18 },
  headerCellSpecies: { flex: 3 },
  headerCellSmall: { flex: 2 },
  headerCellNum: { flex: 1.5, alignItems: 'flex-end' },
  headerText: { fontSize: 11, fontWeight: '700', color: '#1565C0' },
  list: { flex: 1 },
  row: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  rowAlt: {
    backgroundColor: '#fafafa',
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  familyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  cellSpecies: { flex: 3, fontSize: 12, color: '#333' },
  cellSmall: { flex: 2, fontSize: 11, color: '#666' },
  cellNum: { flex: 1.5, fontSize: 11, color: '#555', textAlign: 'right' },
  expandedContent: {
    paddingTop: 8,
    paddingLeft: 26,
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
    marginTop: 6,
  },
  expandedRow: {
    fontSize: 11,
    color: '#666',
    lineHeight: 18,
  },
});
