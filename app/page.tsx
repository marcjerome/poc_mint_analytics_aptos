"use client"

import { useEffect, useState } from "react"
import { Clock, Loader2 } from "lucide-react"

export default function NFTMintingStatus() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progressWidth, setProgressWidth] = useState(0)
  const [mintData, setMintData] = useState<{
    currentSupply: number
    maxSupply: number
    totalMinted: number
    percentage: number
  } | null>(null)

  const fetchMintStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/mint-status")
      if (!response.ok) throw new Error("Failed to fetch mint status")
      const data = await response.json()

      const currentSupply = data.current_collection_ownership_v2_view[0].current_collection.current_supply
      const maxSupply = data.current_collection_ownership_v2_view[0].current_collection.max_supply
      const totalMinted = data.current_collection_ownership_v2_view[0].current_collection.total_minted_v2
      const percentage = (totalMinted / currentSupply) * 100

      setMintData({ currentSupply, maxSupply, totalMinted, percentage })
    } catch (err) {
      console.error("Error fetching mint status:", err)
      setError("Failed to fetch minting status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let progress = 0
    let interval: NodeJS.Timeout
    let fetchInterval: NodeJS.Timeout

    const startProgress = async () => {
      // Clear any existing interval
      if (interval) {
        clearInterval(interval)
      }
      
      // Reset progress
      progress = 0
      setProgressWidth(0)
      
      // Start new progress animation
      interval = setInterval(() => {
        progress += 2
        setProgressWidth(progress)
        if (progress >= 100) {
          clearInterval(interval)
          fetchMintStatus()
        }
      }, 100)
    }

    // Initial fetch and progress setup
    fetchMintStatus().then(() => {
      startProgress()
      fetchInterval = setInterval(startProgress, 8000)
    })

    return () => {
      if (interval) clearInterval(interval)
      if (fetchInterval) clearInterval(fetchInterval)
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-lg border-2 border-black bg-yellow-300 shadow-lg">
          {/* Top progress bar */}
          <div className="absolute left-0 top-0 h-1 bg-yellow-600 transition-all duration-100 ease-linear" style={{ width: `${progressWidth}%` }} />

          <div className="p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-yellow-400 px-2 py-1 text-xs font-bold text-black">PUBLIC</span>
              <span className="rounded-md bg-green-500 px-2 py-1 text-xs font-bold text-white">LIVE</span>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg font-bold">25:15:40:50</span>
              </div>
              <span className="font-mono text-lg font-bold">2.10 APT</span>
            </div>

            {error ? (
              <div className="mt-6 text-red-600">{error}</div>
            ) : loading || !mintData ? (
              <div className="mt-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
              </div>
            ) : (
              <>
                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {mintData.totalMinted}/{mintData.currentSupply}
                    </span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full bg-blue-500" style={{ width: `${mintData.percentage}%` }} />
                  </div>

                  <div className="mt-4 flex justify-between">
                    <span className="text-sm font-medium">{mintData.percentage.toFixed(0)}% Minted</span>
                    <span className="text-sm font-medium">0/1 mint left</span>
                  </div>
                </div>

                <button className="mt-6 w-full rounded-lg bg-red-600 py-3 text-center font-bold text-white transition-colors hover:bg-red-700">
                  Mint
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
