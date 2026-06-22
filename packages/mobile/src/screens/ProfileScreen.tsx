import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { updateUserProfile } from '@internship/shared/src/firestore-client'
import { auth } from '../lib/auth'
import { useSnackbar } from '../hooks/useSnackbar'

const SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'Flutter', 'Firebase', 'Machine Learning', 'Java', 'Go', 'AWS',
]

export default function ProfileScreen() {
  const [skills, setSkills] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const user = auth.currentUser
  const { showSnackbar } = useSnackbar()

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const handleSave = async () => {
    if (!user) return
    try {
      await updateUserProfile(user.uid, { skills, location })
      showSnackbar('Profile saved!', 'success')
    } catch {
      showSnackbar('Failed to save', 'error')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Your Skills</Text>
        <View style={styles.skillsGrid}>
          {SKILLS.map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[styles.skillBtn, skills.includes(skill) && styles.skillActive]}
              onPress={() => toggleSkill(skill)}
            >
              <Text style={[styles.skillBtnText, skills.includes(skill) && styles.skillActiveText]}>
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Mumbai, India"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 24 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  skillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skillActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  skillBtnText: { fontSize: 14, color: '#6b7280' },
  skillActiveText: { color: '#3b82f6', fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 24,
  },
  saveBtn: { backgroundColor: '#3b82f6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})
