import { useState, useCallback } from 'react'

export function useModalState(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen)
  const [searchTerm, setSearchTerm] = useState('')

  const openModal = useCallback(() => setOpen(true), [])
  const closeModal = useCallback(() => {
    setOpen(false)
    setSearchTerm('')
  }, [])

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  return {
    open,
    searchTerm,
    openModal,
    closeModal,
    updateSearchTerm,
    setOpen,
  }
}