import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import ScreenContainer from '../../src/components/ui/ScreenContainer';
import SectionCard from '../../src/components/ui/SectionCard';
import { dataset } from '../../src/data/dataset';
import { countByField } from '../../src/utils/aggregations';
import { FAMILY_COLORS } from '../../src/utils/colors';

const SPECIES_COLORS = [
  '#2196F3', '#FF9800', '#4CAF50', '#9C27B0', '#F44336', '#00BCD4', '#795548',
];

export default function TaxonomiaScreen() {
  const { width } = useWindowDimensions();
  const familyCounts = useMemo(() => countByField(dataset, 'Familia_Objetivo'), []);
  const speciesCounts = useMemo(() => countByField(dataset, 'Especie'), []);

  const familyBarData = familyCounts.map((item) => ({
    value: item.value,
    label: item.label.substring(0, 6),
    frontColor: FAMILY_COLORS[item.label] || '#ccc',
  }));

  const speciesBarData = speciesCounts.map((item, i) => ({
    value: item.value,
    label: (item.label.split(' ')[1] || item.label).substring(0, 6),
    frontColor: SPECIES_COLORS[i % SPECIES_COLORS.length],
  }));

  const donutData = familyCounts.map((item) => ({
    value: item.value,
    color: FAMILY_COLORS[item.label] || '#ccc',
    text: `${Math.round((item.value / dataset.length) * 100)}%`,
  }));

  const barW5 = Math.max(Math.floor((width - 120) / 5 - 10), 24);
  const barW7 = Math.max(Math.floor((width - 120) / 7 - 8), 20);

  return (
    <ScreenContainer>
      <SectionCard title="Registros por Familia">
        <View style={styles.chartCenter}>
          <BarChart
            data={familyBarData}
            barWidth={barW5}
            spacing={Math.max(Math.floor((width - 120 - barW5 * 5) / 5), 8)}
            xAxisLabelTextStyle={styles.xLabel}
            yAxisTextStyle={styles.yLabel}
            noOfSections={4}
            barBorderRadius={5}
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

      <SectionCard title="Registros por Especie">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartCenter}>
            <BarChart
              data={speciesBarData}
              barWidth={barW7}
              spacing={10}
              xAxisLabelTextStyle={styles.xLabelSmall}
              yAxisTextStyle={styles.yLabel}
              noOfSections={4}
              barBorderRadius={5}
              showValuesAsTopLabel
              topLabelTextStyle={styles.topLabelText}
              isAnimated
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor="#e0e0e0"
              rulesColor="#f0f0f0"
            />
          </View>
        </ScrollView>
        <View style={styles.legend}>
          {speciesCounts.map((item, i) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: SPECIES_COLORS[i % SPECIES_COLORS.length] }]} />
              <Text style={styles.legendText} numberOfLines={1}>
                {item.label} ({item.value})
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Proporciones de Familia">
        <View style={styles.chartCenter}>
          <PieChart
            data={donutData}
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
                {item.label} ({item.value} - {Math.round((item.value / dataset.length) * 100)}%)
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chartCenter: { alignItems: 'center', paddingVertical: 8 },
  xLabel: { fontSize: 8, color: '#888' },
  xLabelSmall: { fontSize: 7, color: '#888' },
  yLabel: { fontSize: 9, color: '#aaa' },
  topLabelText: { fontSize: 9, color: '#333', fontWeight: '700' },
  legend: { marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 12, color: '#555', flex: 1 },
});
