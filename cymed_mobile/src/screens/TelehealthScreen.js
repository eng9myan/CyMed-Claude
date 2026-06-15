import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react-native';

export default function TelehealthScreen({ navigation }) {
  const doctorName = "Dr. Sarah Jenkins";
  const specialty = "Cardiologist";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
        {/* Placeholder for actual WebRTC Video Stream */}
        <View style={styles.remoteVideoPlaceholder}>
          <Text style={styles.placeholderText}>Waiting for {doctorName}...</Text>
        </View>

        <View style={styles.localVideoPlaceholder}>
          <Text style={styles.placeholderTextSmall}>You</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.doctorName}>{doctorName}</Text>
        <Text style={styles.specialty}>{specialty}</Text>
        <Text style={styles.duration}>02:45</Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton}>
          <Mic color="#ffffff" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton}>
          <Video color="#ffffff" size={24} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, styles.endCallButton]}
          onPress={() => navigation.goBack()}
        >
          <PhoneOff color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // Dark background for video call
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
  },
  remoteVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  localVideoPlaceholder: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 100,
    height: 140,
    backgroundColor: '#374151',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  placeholderTextSmall: {
    color: '#9ca3af',
    fontSize: 14,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  specialty: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 4,
  },
  duration: {
    fontSize: 14,
    color: '#2563eb',
    marginTop: 8,
    fontWeight: 'bold',
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallButton: {
    backgroundColor: '#ef4444', // Red for end call
  },
});
