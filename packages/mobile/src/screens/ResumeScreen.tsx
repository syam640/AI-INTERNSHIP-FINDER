import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xvkuzubmgiokcxqjknwt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2a3V6dWJtZ2lva2N4cWprbnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4OTA4NzMsImV4cCI6MjA5NzQ2Njg3M30.0qcXlpcEL_4uldGRiocyyR9nE0RJPz4048tQhiykqFU'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function ResumeScreen() {
  const [uploading, setUploading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      })

      if (result.canceled || !result.assets?.length) return

      setUploading(true)
      const file = result.assets[0]

      const response = await fetch(file.uri)
      const blob = await response.blob()
      const ext = file.name?.split('.').pop() || 'pdf'
      const path = `mobile/${Date.now()}.${ext}`

      const { error } = await supabase.storage.from('resumes').upload(path, blob, {
        contentType: 'application/pdf',
      })

      if (error) {
        alert('Upload failed: ' + error.message)
        return
      }

      const { data: publicUrl } = supabase.storage.from('resumes').getPublicUrl(path)

      // Send to analysis API
      const text = await fetch(file.uri).then(r => r.text())
      const analysisRes = await fetch('https://xvkuzubmgiokcxqjknwt.supabase.co/functions/v1/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text, skills: [] }),
      })
      const data = await analysisRes.json()
      setAnalysis(data)
    } catch (err) {
      console.error(err)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Resume Analyzer</Text>

        <TouchableOpacity
          style={[styles.uploadBtn, uploading && styles.disabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : (
            <>
              <Text style={styles.uploadIcon}>📄</Text>
              <Text style={styles.uploadText}>Upload Resume</Text>
              <Text style={styles.uploadHint}>PDF format</Text>
            </>
          )}
        </TouchableOpacity>

        {analysis ? (
          <View style={styles.results}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>ATS Score</Text>
              <Text style={styles.scoreValue}>{analysis.atsScore}/100</Text>
            </View>
            {analysis.strengths?.map((s: string, i: number) => (
              <Text key={i} style={styles.strength}>✓ {s}</Text>
            ))}
            {analysis.missingSkills?.map((s: string, i: number) => (
              <View key={i} style={styles.missingBadge}>
                <Text style={styles.missingText}>{s}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>AI Analysis Results</Text>
            <Text style={styles.placeholderText}>
              Upload your resume to get ATS scoring, missing skills detection, and
              personalized suggestions.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  uploadBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabled: { opacity: 0.5 },
  uploadIcon: { fontSize: 40, marginBottom: 8 },
  uploadText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  uploadHint: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  placeholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  placeholderText: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  results: { gap: 12 },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  scoreLabel: { fontSize: 14, color: '#6b7280' },
  scoreValue: { fontSize: 32, fontWeight: 'bold', color: '#3b82f6' },
  strength: { fontSize: 14, color: '#059669' },
  missingBadge: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  missingText: { fontSize: 12, color: '#dc2626' },
})
