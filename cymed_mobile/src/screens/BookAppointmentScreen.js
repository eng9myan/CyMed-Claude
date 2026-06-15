import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserPlus, Calendar as CalendarIcon, Clock } from 'lucide-react-native';

const mockDoctors = [
  { id: '1', name: 'Dr. Sarah Smith', specialty: 'Cardiology' },
  { id: '2', name: 'Dr. John Adams', specialty: 'General Practice' },
  { id: '3', name: 'Dr. Emily Chen', specialty: 'Dermatology' },
];

export default function BookAppointmentScreen() {
  const navigation = useNavigation();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleBook = () => {
    if (!selectedDoctor || !selectedTime) {
      Alert.alert('Incomplete', 'Please select a doctor and time slot.');
      return;
    }
    Alert.alert('Success', 'Appointment request sent!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>1. Select Doctor</Text>
      {mockDoctors.map(doc => (
        <TouchableOpacity 
          key={doc.id} 
          style={[styles.card, selectedDoctor === doc.id && styles.cardSelected]}
          onPress={() => setSelectedDoctor(doc.id)}
        >
          <View style={styles.iconContainer}>
            <UserPlus color={selectedDoctor === doc.id ? '#ffffff' : '#2563eb'} size={24} />
          </View>
          <View>
            <Text style={[styles.name, selectedDoctor === doc.id && styles.textWhite]}>{doc.name}</Text>
            <Text style={[styles.specialty, selectedDoctor === doc.id && styles.textWhite]}>{doc.specialty}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>2. Select Time (Tomorrow)</Text>
      <View style={styles.timeGrid}>
        {['09:00 AM', '10:30 AM', '01:00 PM', '03:15 PM'].map(time => (
          <TouchableOpacity 
            key={time} 
            style={[styles.timeChip, selectedTime === time && styles.timeChipSelected]}
            onPress={() => setSelectedTime(time)}
          >
            <Clock color={selectedTime === time ? '#ffffff' : '#4b5563'} size={16} style={{ marginRight: 6 }} />
            <Text style={[styles.timeText, selectedTime === time && styles.textWhite]}>{time}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleBook}>
        <Text style={styles.submitText}>Request Appointment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  specialty: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  textWhite: { color: '#ffffff' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '48%',
  },
  timeChipSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  timeText: { fontSize: 14, fontWeight: 'bold', color: '#4b5563' },
  submitButton: {
    backgroundColor: '#1e40af',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  submitText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});
