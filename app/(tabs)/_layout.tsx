import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={20} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          paddingBottom: 6,
          paddingTop: 4,
          height: 58,
          borderTopWidth: 0.5,
          borderTopColor: '#ddd',
        },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '600' },
        headerStyle: { backgroundColor: '#2196F3' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="taxonomia"
        options={{
          title: 'Taxon.',
          headerTitle: 'Taxonomia',
          tabBarIcon: ({ color }) => <TabBarIcon name="sitemap" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ecologia"
        options={{
          title: 'Ecolog.',
          headerTitle: 'Ecologia',
          tabBarIcon: ({ color }) => <TabBarIcon name="leaf" color={color} />,
        }}
      />
      <Tabs.Screen
        name="morfologia"
        options={{
          title: 'Morf.',
          headerTitle: 'Morfologia',
          tabBarIcon: ({ color }) => <TabBarIcon name="circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="datos"
        options={{
          title: 'Datos',
          tabBarIcon: ({ color }) => <TabBarIcon name="table" color={color} />,
        }}
      />
    </Tabs>
  );
}
