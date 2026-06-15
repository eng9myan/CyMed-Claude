import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Pill, RefreshCw } from 'lucide-react-native';

const mockMeds = [
  { id: '1', name: 'Atorvastatin 20mg', instructions: 'Take 1 tablet daily', refills: 2, doctor: 'Dr. Adams' },
  { id: '2', name: 'Lisinopril 10mg', instructions: 'Take 1 tablet daily', refills: 0, doctor: 'Dr. Smith' },
];

export default function MedicationsScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Pill color="#10b981" size={24} />
        </View>
        <View style={styles.content}>
          <Text style={styles.medName}>{item.name}</Text>
          <Text style={styles.instructions}>{item.instructions}</Text>
          <Text style={styles.details}>Refills left: {item.refills}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.refillButton}>
        <RefreshCw color="#ffffff" size={16} style={{ marginRight: 8 }} />
        <Text style={styles.refillText}>Request Refill</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockMeds}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: { flexDirection: 'row', marginBottom: 16 },
  iconContainer: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
    alignSelf: 'flex-start',
  },
  content: { flex: 1 },
  medName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  instructions: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  details: { fontSize: 13, color: '#6b7280' },
  refillButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  refillText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 }
});
