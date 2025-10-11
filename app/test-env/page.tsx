"use client"

import { useEffect } from "react"

export default function TestEnv() {
  useEffect(() => {
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL)
  }, [])

  return <div>Veja o console do navegador</div>
}
