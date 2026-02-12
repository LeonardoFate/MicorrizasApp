import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import ScreenContainer from '../../src/components/ui/ScreenContainer';
import SectionCard from '../../src/components/ui/SectionCard';
import { dataset } from '../../src/data/dataset';
import { countByField, averageByGroup, rangeByGroup } from '../../src/utils/aggregations';
import { FAMILY_COLORS, SPORE_COLOR_MAP } from '../../src/utils/colors';

// Short labels for families
const SHORT_NAMES: Record<string, string> = {
  'Glomeraceae': 'Glomer.',
  'Gigasporaceae': 'Gigas.',
  'Acaulosporaceae': 'Acaul.',
  'Diversisporaceae': 'Divers.',
  'Claroideoglomeraceae': 'Claroid.',
};

export default function MorfologiaScreen() {
  const { width } = useWindowDimensions();
  const colorCounts = useMemo(() => countByField(dataset, 'Espora_Color'), []);
  const avgDiameterByFamily = useMemo(
    () => averageByGroup(dataset, 'Familia_Objetivo', 'Espora_Diametro_um'),
    []
  );
  const avgThicknessByFamily = useMemo(
    () => averageByGroup(dataset, 'Familia_Objetivo', 'Espora_Grosor_Pared_um'),
    []
  );
  const diameterRanges = useMemo(
    () => rangeByGroup(dataset, 'Familia_Objetivo', 'Espora_Diametro_um'),
    []
  );

  const barW5 = Math.max(Math.floor((width - 120) / 5 - 10), 22);
  const pieR = Math.min(width * 0.26, 100);

  const diameterBarData = avgDiameterByFamily.map((item) => ({
    value: Math.round(item.value),
    label: SHORT_NAMES[item.label] || item.label.substring(0, 6),
    frontColor: FAMILY_COLORS[item.label] || '#ccc',
  }));

  const thicknessBarData = avgThicknessByFamily.map((item) => ({
    value: item.value,
    label: SHORT_NAMES[item.label] || item.label.substring(0, 6),
    frontColor: FAMILY_COLORS[item.label] || '#ccc',
  }));

  const colorPieData = colorCounts.map((item) => ({
    value: item.value,
    color: SPORE_COLOR_MAP[item.label] || '#ccc',
    text: `${Math.round((item.value / dataset.length) * 100)}%`,
  }));

  return (
    <ScreenContainer>
      <SectionCard title="Diametro Promedio de Espora (um)">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartCenter}>
            <BarChart
              data={diameterBarData}
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
        </ScrollView>

        <View style={styles.rangeTable}>
          <View style={styles.rangeHeader}>
            <Text style={[styles.rangeCell, styles.rangeHeaderText]}>Familia</Text>
            <Text style={[styles.rangeCellNum, styles.rangeHeaderText]}>Min</Text>
            <Text style={[styles.rangeCellNum, styles.rangeHeaderText]}>Prom</Text>
            <Text style={[styles.rangeCellNum, styles.rangeHeaderText]}>Max</Text>
          </View>
          {diameterRanges
            .sort((a, b) => b.avg - a.avg)
            .map((item) => (
              <View key={item.label} style={styles.rangeRow}>
                <View style={styles.rangeCellWithDot}>
                  <View style={[styles.rangeDot, { backgroundColor: FAMILY_COLORS[item.label] }]} />
                  <Text style={styles.rangeCellText} numberOfLines={1}>
                    {SHORT_NAMES[item.label] || item.label.substring(0, 10)}
                  </Text>
                </View>
                <Text style={styles.rangeCellNum}>{Math.round(item.min)}</Text>
                <Text style={[styles.rangeCellNum, { fontWeight: '700', color: '#333' }]}>
                  {Math.round(item.avg)}
                </Text>
                <Text style={styles.rangeCellNum}>{Math.round(item.max)}</Text>
              </View>
            ))}
        </View>
      </SectionCard>

      <SectionCard title="Distribucion de Color de Espora">
        <View style={styles.chartCenter}>
          <PieChart
            data={colorPieData}
            donut
            radius={pieR}
            innerRadius={pieR / 2}
            textColor="#333"
            textSize={9}
            showTextBackground
            textBackgroundRadius={11}
          />
        </View>
        <View style={styles.legend}>
          {colorCounts.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  {
                    backgroundColor: SPORE_COLOR_MAP[item.label] || '#ccc',
                    borderWidth: item.label === 'Blanco-Amarillento' || item.label === 'Hialino' ? 1 : 0,
                    borderColor: '#ccc',
                  },
                ]}
              />
              <Text style={styles.legendText}>
                {item.label} ({item.value})
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Grosor de Pared Promedio (um)">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chartCenter}>
            <BarChart
              data={thicknessBarData}
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
        </ScrollView>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chartCenter: { alignItems: 'center', paddingVertical: 8 },
  xLabel: { fontSize: 7, color: '#888' },
  yLabel: { fontSize: 9, color: '#aaa' },
  topLabelText: { fontSize: 9, color: '#333', fontWeight: '700' },
  legend: { marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 12, color: '#555' },
  rangeTable: { marginTop: 14 },
  rangeHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 6,
    marginBottom: 2,
    alignItems: 'center',
  },
  rangeHeaderText: { fontWeight: '700', color: '#444', fontSize: 11 },
  rangeRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  rangeCell: { flex: 2.5, fontSize: 11, color: '#555' },
  rangeCellWithDot: { flex: 2.5, flexDirection: 'row', alignItems: 'center' },
  rangeDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  rangeCellText: { fontSize: 11, color: '#555', flex: 1 },
  rangeCellNum: { flex: 1, fontSize: 11, color: '#777', textAlign: 'center' },
});
