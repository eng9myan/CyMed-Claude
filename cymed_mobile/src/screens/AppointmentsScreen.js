import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Calendar, Video, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const mockAppointments = [
  { id: '1', doctor: 'Dr. Sarah Smith', specialty: 'Cardiology', date: 'Tomorrow, 10:00 AM', type: 'Telehealth', upcoming: true },
  { id: '2', doctor: 'Dr. John Adams', specialty: 'General Practice', date: 'Oct 10, 2026', type: 'In-person', upcoming: false },
];

export default function AppointmentsScreen() {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Calendar color="#8b5cf6" size={24} />
        </View>
        <View style={styles.content}>
          <Text style={styles.doctorName}>{item.doctor}</Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
          <View style={styles.timeRow}>
            <Clock color="#6b7280" size={14} style={{ marginRight: 4 }} />
            <Text style={styles.details}>{item.date}</Text>
          </View>
        </View>
      </View>
      {item.upcoming && item.type === 'Telehealth' && (
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Telehealth' })}
        >
          <Video color="#ffffff" size={16} style={{ marginRight: 8 }} />
          <Text style={styles.joinText}>Join Video Call</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockAppointments}
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
  header: { flexDirection: 'row', marginBottom: 12 },
  iconContainer: {
    backgroundColor: '#f3e8ff',
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
    alignSelf: 'flex-start',
  },
  content: { flex: 1, justifyContent: 'center' },
  doctorName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 2 },
  specialty: { fontSize: 14, color: '#4b5563', marginBottom: 6 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  details: { fontSize: 13, color: '#6b7280' },
  joinButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  joinText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 }
});
