import React, { useEffect, useState, useRef } from 'react'
import Sidebar from './sidebar'
import Chat from './chat'

export const useOutsideClick = (callback) => {
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchend', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchend', handleClickOutside)
    }
  }, [callback])

  return ref
}

const Body = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)

  useEffect(() => {
    const handleTouchStart = (e) => {
      setTouchStartX(e.touches[0].clientX)
    }

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX
      const swipeDistance = touchEndX - touchStartX

      if (swipeDistance > 100) {
        setIsSidebarOpen(true)
      } else if (swipeDistance < -100) {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [touchStartX])

  return (
    <>
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <Chat />
    </>
  )
}

export default Body
