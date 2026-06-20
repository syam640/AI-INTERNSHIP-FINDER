import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { logout } from '../lib/auth'

export default function DashboardScreen({ navigation }: any) {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Welcome back!</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Applied</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>75</Text>
            <Text style={styles.statLabel}>ATS Score</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 24 },
  greeting: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#3b82f6' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  logoutBtn: { backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})
