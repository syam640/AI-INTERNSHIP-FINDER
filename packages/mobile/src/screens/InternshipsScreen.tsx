import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { getInternships } from '@internship/shared/src/firestore-client'

export default function InternshipsScreen() {
  const [internships, setInternships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await getInternships()
      setInternships(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.company}>{item.company}</Text>
      <Text style={styles.location}>{item.location}</Text>
      <View style={styles.skillsRow}>
        {item.skills?.slice(0, 3).map((s: string) => (
          <View key={s} style={styles.skillBadge}>
            <Text style={styles.skillText}>{s}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.stipend}>{item.stipend || 'Unpaid'}</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={internships}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadData}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '600' },
  company: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  location: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  skillsRow: { flexDirection: 'row', marginTop: 8, gap: 6 },
  skillBadge: { backgroundColor: '#eff6ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  skillText: { fontSize: 12, color: '#3b82f6' },
  stipend: { fontSize: 14, fontWeight: '600', color: '#059669', marginTop: 8 },
})
