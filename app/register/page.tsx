import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Atlas</h1>
          <p className="mt-2 text-muted-foreground">Crie sua conta</p>
        </div>

        <div className="bg-card p-8 rounded-lg border border-border">
          <RegisterForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
