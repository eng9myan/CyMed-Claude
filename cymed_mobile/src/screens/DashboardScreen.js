import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FileText, Calendar, Clock, Pill, CalendarPlus } from 'lucide-react-native';

export default function DashboardScreen({ navigation }) {
  const patientName = "John Doe";

  const QuickActionCard = ({ icon, title, subtitle, onPress, color }) => (
    <TouchableOpacity style={styles.quickCard} onPress={onPress}>
      <View style={[styles.quickIconContainer, { backgroundColor: color + '1a' }]}>
        {icon}
      </View>
      <Text style={styles.quickCardTitle}>{title}</Text>
      <Text style={styles.quickCardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.name}>{patientName}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Health Hub</Text>
        <View style={styles.grid}>
          <QuickActionCard 
            icon={<FileText color="#2563eb" size={24} />} 
            title="Lab Results" 
            subtitle="2 new" 
            color="#2563eb"
            onPress={() => navigation.navigate('LabResults')} 
          />
          <QuickActionCard 
            icon={<Pill color="#10b981" size={24} />} 
            title="Medications" 
            subtitle="1 refill due" 
            color="#10b981"
            onPress={() => navigation.navigate('Medications')} 
          />
          <QuickActionCard 
            icon={<Calendar color="#8b5cf6" size={24} />} 
            title="Appointments" 
            subtitle="1 upcoming" 
            color="#8b5cf6"
            onPress={() => navigation.navigate('Appointments')} 
          />
          <QuickActionCard 
            icon={<CalendarPlus color="#f59e0b" size={24} />} 
            title="Book Visit" 
            subtitle="In-person/Telehealth" 
            color="#f59e0b"
            onPress={() => navigation.navigate('BookAppointment')} 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Next Appointment</Text>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Calendar color="#2563eb" size={24} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Cardiology Follow-up</Text>
              <Text style={styles.cardSubtitle}>Dr. Sarah Jenkins</Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.timeTag}>
              <Clock color="#4b5563" size={14} />
              <Text style={styles.timeText}>Tomorrow, 10:00 AM</Text>
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Telehealth')}>
              <Text style={styles.actionButtonText}>Join Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#1e40af',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: { color: '#bfdbfe', fontSize: 16 },
  name: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  avatar: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickCard: {
    backgroundColor: '#ffffff',
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  quickCardSubtitle: { fontSize: 12, color: '#6b7280' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#6b7280' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeText: { marginLeft: 6, fontSize: 12, fontWeight: '600', color: '#4b5563' },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 }
});
