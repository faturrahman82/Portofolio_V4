'use client'

import { useEffect } from 'react'

export function ScrollReset() {
  useEffect(() => {
    // Mematikan fungsionalitas scroll restoration otomatis browser
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    
    // Paksa pindahkan scroll ke paling atas (X: 0, Y: 0) saat awal load halaman
    window.scrollTo(0, 0)
  }, [])

  return null
}
