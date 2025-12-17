"use client"

import { createContext, useContext, useEffect, useState } from "react"
import api from "../api/axios"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Global Dashboard Data
  const [data, setData] = useState({
    stock: [],
    requests: [],
    dispatches: [],
    receipts: []
  })
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }

    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    setUser(null)
    setToken(null)
    setData({ stock: [], requests: [], dispatches: [], receipts: [] })
  }

  // Manual Fetch Trigger
  const fetchDashboardData = async () => {
    if (!token) return

    setLoadingData(true)
    try {
      // Parallel Fetch
      const [stockRes, requestsRes, dispatchesRes] = await Promise.allSettled([
        api.get("/materials/stock"),
        api.get("/requests"),
        api.get("/dispatch")
      ])

      const newStock = stockRes.status === 'fulfilled' ? stockRes.value.data.materials : []
      const newRequests = requestsRes.status === 'fulfilled' ? requestsRes.value.data.requests : []
      const newDispatches = dispatchesRes.status === 'fulfilled' ? dispatchesRes.value.data.dispatches : []

      // Derive Receipts from Stock (as backend has no list receipts endpoint, it's embedded in Materials)
      // Flatten all receipts from all materials
      const derivedReceipts = newStock.flatMap(mat => 
        (mat.receipts || []).map(r => ({
          ...r,
          materialName: mat.name,
          date: r.receivedAt // Schema uses receivedAt
        }))
      ).sort((a, b) => new Date(b.date) - new Date(a.date))

      setData({
        stock: newStock,
        requests: newRequests,
        dispatches: newDispatches,
        receipts: derivedReceipts
      })

    } catch (error) {
      console.error("Dashboard Data Fetch Error:", error)
    } finally {
      setLoadingData(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        setToken,
        logout,
        loading,
        data,
        loadingData,
        fetchDashboardData
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
