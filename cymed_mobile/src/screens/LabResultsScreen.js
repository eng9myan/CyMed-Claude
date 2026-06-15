import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FileText, ChevronRight } from 'lucide-react-native';

const mockLabs = [
  { id: '1', name: 'Complete Blood Count (CBC)', date: 'Oct 12, 2026', status: 'Normal', doctor: 'Dr. Smith' },
  { id: '2', name: 'Lipid Panel', date: 'Sep 25, 2026', status: 'Requires Attention', doctor: 'Dr. Adams' },
  { id: '3', name: 'Metabolic Panel', date: 'Aug 10, 2026', status: 'Normal', doctor: 'Dr. Smith' },
];

export default function LabResultsScreen() {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.iconContainer}>
        <FileText color="#2563eb" size={24} />
      </View>
      <View style={styles.content}>
        <Text style={styles.testName}>{item.name}</Text>
        <Text style={styles.details}>{item.date} • Ordered by {item.doctor}</Text>
        <Text style={[styles.status, item.status === 'Normal' ? styles.statusNormal : styles.statusAttention]}>
          {item.status}
        </Text>
      </View>
      <ChevronRight color="#9ca3af" size={20} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockLabs}
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
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  content: { flex: 1 },
  testName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  details: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  status: { fontSize: 12, fontWeight: 'bold' },
  statusNormal: { color: '#10b981' },
  statusAttention: { color: '#ef4444' }
});
