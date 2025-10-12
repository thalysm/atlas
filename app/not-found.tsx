"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Lottie from "lottie-react"
import bulkingAnimation from "../public/lottie/bulking-animation.json"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center max-w-4xl mx-auto">
        

        {/* Div 1: Texto e Botão */}
        <div className="text-center md:text-left space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              Essa página ainda está em fase de <span className="text-black">bulking</span>...
            </h1>
            <p className="mt-4 text-lg text-white">
              Volte para o início e confira as que já estão definidas!
            </p>
          </div>
          <Button asChild size="lg" className="bg-background hover:bg-background/90">
            <Link href="/dashboard">Voltar para o início</Link>
          </Button>
        </div>

        {/* Div 2: Animação Lottie */}
        <div className="w-full">
          <Lottie animationData={bulkingAnimation} loop={true} />
        </div>

      </div>
    </div>
  )
}