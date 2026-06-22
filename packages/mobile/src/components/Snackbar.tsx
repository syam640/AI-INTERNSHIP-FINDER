import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { Animated, Text, StyleSheet, Dimensions } from 'react-native'

export type SnackbarType = 'success' | 'error' | 'warning' | 'info'

interface SnackbarMessage {
  message: string
  type: SnackbarType
  id: number
}

interface SnackbarContextValue {
  showSnackbar: (message: string, type?: SnackbarType) => void
}

const SnackbarContext = createContext<SnackbarContextValue>({ showSnackbar: () => {} })

export function useSnackbar() {
  return useContext(SnackbarContext)
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snacks, setSnacks] = useState<SnackbarMessage[]>([])
  const nextId = useRef(0)

  const showSnackbar = useCallback((message: string, type: SnackbarType = 'info') => {
    const id = nextId.current++
    setSnacks((prev) => [...prev, { message, type, id }])
    setTimeout(() => {
      setSnacks((prev) => prev.filter((s) => s.id !== id))
    }, 3500)
  }, [])

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <SnackbarContainer snacks={snacks} />
    </SnackbarContext.Provider>
  )
}

function SnackbarContainer({ snacks }: { snacks: SnackbarMessage[] }) {
  return (
    <>
      {snacks.map((s, i) => (
        <SnackbarItem key={s.id} snack={s} index={i} />
      ))}
    </>
  )
}

function SnackbarItem({ snack, index }: { snack: SnackbarMessage; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(50)).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start()
  }, [])

  const bgColor =
    snack.type === 'success' ? '#059669' :
    snack.type === 'error' ? '#dc2626' :
    snack.type === 'warning' ? '#d97706' :
    '#2563eb'

  const icon =
    snack.type === 'success' ? '✓ ' :
    snack.type === 'error' ? '✗ ' :
    snack.type === 'warning' ? '⚠ ' :
    'ℹ '

  return (
    <Animated.View
      style={[
        styles.snackbar,
        { backgroundColor: bgColor, opacity, transform: [{ translateY }], bottom: 60 + index * 60 },
      ]}
    >
      <Text style={styles.snackbarText}>{icon}{snack.message}</Text>
    </Animated.View>
  )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    width: width - 32,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  snackbarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
})
