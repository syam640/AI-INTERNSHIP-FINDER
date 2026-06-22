import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { loginWithGoogle } from '../lib/auth'
import { useToast } from '../components/Toast'

export default function HomeScreen({ navigation }: any) {
  const { showToast } = useToast()

  const handleGoogle = async () => {
    try {
      await loginWithGoogle()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Intern<Text style={styles.highlight}>AI</Text>
        </Text>
        <Text style={styles.subtitle}>
          Find your dream internship with AI-powered matching
        </Text>

        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle}>
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emailBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.emailBtnText}>Sign in with Email</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 48, fontWeight: 'bold', marginBottom: 12 },
  highlight: { color: '#3b82f6' },
  subtitle: { fontSize: 18, color: '#6b7280', textAlign: 'center', marginBottom: 48 },
  googleBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  googleBtnText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emailBtn: { backgroundColor: '#3b82f6', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center' },
  emailBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
})
