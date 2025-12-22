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
    receipts: [],
    warehouses: [],
    emergencyReports: [] // New field
  })
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user")
    const storedToken = sessionStorage.getItem("token")

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }

    setLoading(false)
  }, [])

  const login = (userData, authToken) => {
    sessionStorage.setItem("user", JSON.stringify(userData))
    sessionStorage.setItem("token", authToken)
    setUser(userData)
    setToken(authToken)
  }

  const logout = () => {
    sessionStorage.removeItem("user")
    sessionStorage.removeItem("token")
    setUser(null)
    setToken(null)
    setData({ stock: [], requests: [], dispatches: [], receipts: [], warehouses: [], emergencyReports: [] })
    window.location.href = "/"
  }

  // Manual Fetch Trigger
  const fetchDashboardData = async () => {
    if (!token) return

    setLoadingData(true)
    try {
      // Parallel Fetch
      const [stockRes, requestsRes, dispatchesRes, warehousesRes, emergencyRes] = await Promise.allSettled([
        api.get(`/materials/stock?v=${Date.now()}`),
        api.get("/requests"),
        api.get("/dispatch"),
        api.get("/warehouses"),
        api.get("/requests/emergency") // New fetch
      ])
      
      const newStock = stockRes.status === 'fulfilled' ? stockRes.value.data.materials : []
      const newRequests = requestsRes.status === 'fulfilled' ? requestsRes.value.data.requests : []
      const newDispatches = dispatchesRes.status === 'fulfilled' ? dispatchesRes.value.data.dispatches : []
      const newWarehouses = warehousesRes.status === 'fulfilled' ? warehousesRes.value.data.warehouses || warehousesRes.value.data : []
      const newReports = emergencyRes.status === 'fulfilled' ? emergencyRes.value.data : []

      // Derive Receipts from Stock (as backend has no list receipts endpoint, it's embedded in Materials)
      // Flatten all receipts from all materials
      const derivedReceipts = newStock.flatMap(mat => 
        (mat.receipts || []).map(r => ({
          ...r,
          materialName: mat.name,
          warehouse: mat.warehouse,
          date: r.receivedAt // Schema uses receivedAt
        }))
      ).sort((a, b) => new Date(b.date) - new Date(a.date))

      setData({
        stock: newStock,
        requests: newRequests,
        dispatches: newDispatches,
        receipts: derivedReceipts,
        warehouses: newWarehouses,
        emergencyReports: newReports
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
        setUser,
        setToken,
        login,
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
