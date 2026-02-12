import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import ScreenContainer from '../../src/components/ui/ScreenContainer';
import SectionCard from '../../src/components/ui/SectionCard';
import StatCard from '../../src/components/ui/StatCard';
import { dataset } from '../../src/data/dataset';
import { countByField } from '../../src/utils/aggregations';
import { FAMILY_COLORS, HABITAT_COLORS } from '../../src/utils/colors';

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width - 80, 320);

  const familyCounts = useMemo(() => countByField(dataset, 'Familia_Objetivo'), []);
  const habitatCounts = useMemo(() => countByField(dataset, 'Habitat'), []);
  const speciesCount = useMemo(() => new Set(dataset.map((r) => r.Especie)).size, []);
  const altitudes = useMemo(() => dataset.map((r) => r.Altitud), []);
  const maxAlt = Math.round(Math.max(...altitudes));

  const pieData = familyCounts.map((item) => ({
    value: item.value,
    color: FAMILY_COLORS[item.label] || '#ccc',
    text: `${Math.round((item.value / dataset.length) * 100)}%`,
  }));

  const barData = habitatCounts.map((item) => ({
    value: item.value,
    label: item.label,
    frontColor: HABITAT_COLORS[item.label] || '#ccc',
  }));

  const barW = Math.max(Math.floor((chartWidth - 60) / 3 - 16), 30);

  return (
    <ScreenContainer>
      <Text style={styles.header}>Micorrizas de Sudamerica</Text>
      <Text style={styles.subtitle}>Dataset de hongos Glomeromycota</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard label="Registros" value={dataset.length} color="#2196F3" />
          <StatCard label="Especies" value={speciesCount} color="#FF9800" />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Familias" value={familyCounts.length} color="#4CAF50" />
          <StatCard label="Alt. Max" value={`${maxAlt}m`} color="#9C27B0" />
        </View>
      </View>

      <SectionCard title="Distribucion por Familia">
        <View style={styles.chartCenter}>
          <PieChart
            data={pieData}
            donut
            radius={Math.min(width * 0.28, 110)}
            innerRadius={Math.min(width * 0.14, 55)}
            textColor="#333"
            textSize={10}
            showTextBackground
            textBackgroundRadius={12}
          />
        </View>
        <View style={styles.legend}>
          {familyCounts.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: FAMILY_COLORS[item.label] }]} />
              <Text style={styles.legendText}>
                {item.label} ({item.value})
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Distribucion por Habitat">
        <View style={styles.chartCenter}>
          <BarChart
            data={barData}
            barWidth={barW}
            spacing={16}
            xAxisLabelTextStyle={styles.xLabel}
            yAxisTextStyle={styles.yLabel}
            noOfSections={4}
            barBorderRadius={6}
            showValuesAsTopLabel
            topLabelTextStyle={styles.topLabelText}
            isAnimated
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor="#e0e0e0"
            rulesColor="#f0f0f0"
          />
        </View>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 14,
  },
  statsGrid: {
    marginBottom: 14,
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
  },
  chartCenter: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  legend: {
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
  },
  xLabel: {
    fontSize: 10,
    color: '#888',
  },
  yLabel: {
    fontSize: 9,
    color: '#aaa',
  },
  topLabelText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '700',
  },
});
