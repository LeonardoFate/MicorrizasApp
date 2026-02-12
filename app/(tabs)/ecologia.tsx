import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import ScreenContainer from '../../src/components/ui/ScreenContainer';
import SectionCard from '../../src/components/ui/SectionCard';
import { dataset } from '../../src/data/dataset';
import { countByField, averageByGroup } from '../../src/utils/aggregations';
import { FAMILY_COLORS, HABITAT_COLORS, TEXTURE_COLORS } from '../../src/utils/colors';

const PAD = 36;

export default function EcologiaScreen() {
  const { width } = useWindowDimensions();
  const SVG_W = Math.min(width - 48, 340);
  const SVG_H = Math.round(SVG_W * 0.72);

  const habitatCounts = useMemo(() => countByField(dataset, 'Habitat'), []);
  const textureCounts = useMemo(() => countByField(dataset, 'Suelo_Textura'), []);
  const avgPhByFamily = useMemo(() => averageByGroup(dataset, 'Familia_Objetivo', 'Suelo_pH'), []);
  const avgNByHabitat = useMemo(() => averageByGroup(dataset, 'Habitat', 'Suelo_Nitrogeno_perc'), []);

  const habitatPieData = habitatCounts.map((item) => ({
    value: item.value,
    color: HABITAT_COLORS[item.label] || '#ccc',
    text: `${Math.round((item.value / dataset.length) * 100)}%`,
  }));

  const texturePieData = textureCounts.map((item) => ({
    value: item.value,
    color: TEXTURE_COLORS[item.label] || '#ccc',
    text: `${Math.round((item.value / dataset.length) * 100)}%`,
  }));

  const phBarData = avgPhByFamily.map((item) => ({
    value: item.value,
    label: item.label.substring(0, 5),
    frontColor: FAMILY_COLORS[item.label] || '#ccc',
  }));

  const nBarData = avgNByHabitat.map((item) => ({
    value: Math.round(item.value * 100) / 100,
    label: item.label,
    frontColor: HABITAT_COLORS[item.label] || '#ccc',
  }));

  const barW5 = Math.max(Math.floor((width - 120) / 5 - 10), 22);
  const barW3 = Math.max(Math.floor((width - 120) / 3 - 16), 36);
  const pieR = Math.min(width * 0.24, 90);

  const scatterPoints = useMemo(() => {
    const minPh = 3.5, maxPh = 9.0;
    const minD = 0, maxD = 500;
    const sampled = dataset.filter((_, i) => i % 4 === 0);
    return sampled.map((r) => ({
      x: PAD + ((r.Suelo_pH - minPh) / (maxPh - minPh)) * (SVG_W - PAD * 2),
      y: SVG_H - PAD - ((r.Espora_Diametro_um - minD) / (maxD - minD)) * (SVG_H - PAD * 2),
      color: FAMILY_COLORS[r.Familia_Objetivo] || '#ccc',
    }));
  }, [SVG_W, SVG_H]);

  return (
    <ScreenContainer>
      <SectionCard title="Distribucion por Habitat">
        <View style={styles.chartCenter}>
          <PieChart
            data={habitatPieData}
            donut
            radius={pieR}
            innerRadius={pieR / 2}
            textColor="#333"
            textSize={10}
            showTextBackground
            textBackgroundRadius={12}
          />
        </View>
        <View style={styles.legend}>
          {habitatCounts.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: HABITAT_COLORS[item.label] }]} />
              <Text style={styles.legendText}>{item.label} ({item.value})</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="pH del Suelo vs Diametro de Espora">
        <View style={styles.chartCenter}>
          <Svg width={SVG_W} height={SVG_H}>
            <Line x1={PAD} y1={SVG_H - PAD} x2={SVG_W - PAD} y2={SVG_H - PAD} stroke="#ddd" strokeWidth={1} />
            <Line x1={PAD} y1={PAD} x2={PAD} y2={SVG_H - PAD} stroke="#ddd" strokeWidth={1} />
            <SvgText x={SVG_W / 2} y={SVG_H - 6} textAnchor="middle" fontSize={10} fill="#888">pH del Suelo</SvgText>
            <SvgText x={10} y={SVG_H / 2} textAnchor="middle" fontSize={10} fill="#888" rotation={-90} originX={10} originY={SVG_H / 2}>Diametro (um)</SvgText>
            {[4, 5, 6, 7, 8, 9].map((v) => {
              const cx = PAD + ((v - 3.5) / 5.5) * (SVG_W - PAD * 2);
              return (
                <React.Fragment key={`ph-${v}`}>
                  <Line x1={cx} y1={SVG_H - PAD} x2={cx} y2={SVG_H - PAD + 3} stroke="#ccc" strokeWidth={0.5} />
                  <SvgText x={cx} y={SVG_H - PAD + 13} textAnchor="middle" fontSize={8} fill="#aaa">{v}</SvgText>
                </React.Fragment>
              );
            })}
            {[0, 100, 200, 300, 400, 500].map((v) => {
              const cy = SVG_H - PAD - (v / 500) * (SVG_H - PAD * 2);
              return (
                <React.Fragment key={`d-${v}`}>
                  <Line x1={PAD - 3} y1={cy} x2={PAD} y2={cy} stroke="#ccc" strokeWidth={0.5} />
                  <SvgText x={PAD - 6} y={cy + 3} textAnchor="end" fontSize={8} fill="#aaa">{v}</SvgText>
                </React.Fragment>
              );
            })}
            {scatterPoints.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={p.color} opacity={0.55} />
            ))}
          </Svg>
        </View>
        <View style={styles.legendRow}>
          {Object.entries(FAMILY_COLORS).map(([label, color]) => (
            <View key={label} style={styles.legendItemCompact}>
              <View style={[styles.legendDotSmall, { backgroundColor: color }]} />
              <Text style={styles.legendTextSmall} numberOfLines={1}>{label.substring(0, 6)}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="pH Promedio por Familia">
        <View style={styles.chartCenter}>
          <BarChart
            data={phBarData}
            barWidth={barW5}
            spacing={Math.max(Math.floor((width - 120 - barW5 * 5) / 5), 6)}
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

      <SectionCard title="Nitrogeno Promedio por Habitat">
        <View style={styles.chartCenter}>
          <BarChart
            data={nBarData}
            barWidth={barW3}
            spacing={20}
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

      <SectionCard title="Textura del Suelo">
        <View style={styles.chartCenter}>
          <PieChart
            data={texturePieData}
            donut
            radius={pieR}
            innerRadius={pieR / 2}
            textColor="#333"
            textSize={10}
            showTextBackground
            textBackgroundRadius={12}
          />
        </View>
        <View style={styles.legend}>
          {textureCounts.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TEXTURE_COLORS[item.label] }]} />
              <Text style={styles.legendText}>{item.label} ({item.value})</Text>
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
  yLabel: { fontSize: 9, color: '#aaa' },
  topLabelText: { fontSize: 9, color: '#333', fontWeight: '700' },
  legend: { marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 12, color: '#555' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  legendItemCompact: { flexDirection: 'row', alignItems: 'center' },
  legendDotSmall: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendTextSmall: { fontSize: 9, color: '#777' },
});
