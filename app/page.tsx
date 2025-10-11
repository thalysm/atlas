import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dumbbell, Calendar, TrendingUp, Users, Package, Clock, Target, Share2, BarChart3, Trophy } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Atlas</span>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" className="text-foreground hover:text-primary">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary-hover">
                <Link href="/register">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Sistema Completo de Treino</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground max-w-4xl mx-auto leading-tight">
              Transforme Seus Treinos com{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                Atlas
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Monte treinos personalizados, acompanhe sua progressão em tempo real e compete com amigos. Tudo em um só
              lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary-hover text-lg px-8 py-6">
                <Link href="/register">
                  Começar Agora
                  <Dumbbell className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border text-lg px-8 py-6 bg-transparent">
                <Link href="#features">Conhecer Recursos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Recursos Poderosos</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para alcançar seus objetivos fitness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Pacotes de Treino</h3>
              <p className="text-muted-foreground leading-relaxed">
                Crie pacotes personalizados com seus exercícios favoritos. Monte treinos de pernas, peito, costas e
                muito mais.
              </p>
            </Card>

            <Card className="p-8 border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Tracking em Tempo Real</h3>
              <p className="text-muted-foreground leading-relaxed">
                Registre pesos, repetições e tempo durante o treino. Os dados são salvos automaticamente enquanto você
                treina.
              </p>
            </Card>

            <Card className="p-8 border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Progressão de Carga</h3>
              <p className="text-muted-foreground leading-relaxed">
                Acompanhe a evolução dos seus pesos em cada exercício com gráficos detalhados e histórico completo.
              </p>
            </Card>

            <Card className="p-8 border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Calendário Visual</h3>
              <p className="text-muted-foreground leading-relaxed">
                Visualize todos os seus treinos em um calendário intuitivo. Veja quantos dias você treinou no mês.
              </p>
            </Card>

            <Card className="p-8 border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Grupos de Competição</h3>
              <p className="text-muted-foreground leading-relaxed">
                Crie grupos com amigos e compete para ver quem treina mais. Rankings em tempo real mantêm a motivação.
              </p>
            </Card>

            <Card className="p-8 border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Share2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Compartilhamento</h3>
              <p className="text-muted-foreground leading-relaxed">
                Compartilhe seus pacotes de treino com outros usuários. Copie treinos públicos para sua conta.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Como Funciona</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Simples, rápido e eficiente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary text-2xl font-bold text-primary">
                1
              </div>
              <h3 className="text-2xl font-bold text-foreground">Monte Seus Pacotes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Escolha exercícios da biblioteca e crie pacotes personalizados para cada grupo muscular
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary text-2xl font-bold text-primary">
                2
              </div>
              <h3 className="text-2xl font-bold text-foreground">Treine e Registre</h3>
              <p className="text-muted-foreground leading-relaxed">
                Inicie um treino e registre pesos, reps e tempo em tempo real. Tudo é salvo automaticamente
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary text-2xl font-bold text-primary">
                3
              </div>
              <h3 className="text-2xl font-bold text-foreground">Acompanhe Progresso</h3>
              <p className="text-muted-foreground leading-relaxed">
                Veja gráficos de evolução, calendário de treinos e compete com amigos em grupos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                <p className="text-5xl font-bold text-foreground">100%</p>
              </div>
              <p className="text-xl text-muted-foreground">Gratuito</p>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-8 w-8 text-primary" />
                <p className="text-5xl font-bold text-foreground">∞</p>
              </div>
              <p className="text-xl text-muted-foreground">Treinos Ilimitados</p>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                <p className="text-5xl font-bold text-foreground">24/7</p>
              </div>
              <p className="text-xl text-muted-foreground">Acesso Total</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-12 border border-primary/20">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">Pronto para Começar?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se ao Atlas hoje e transforme a forma como você treina. Totalmente gratuito, sem limites.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary-hover text-lg px-8 py-6">
              <Link href="/register">
                Criar Conta Grátis
                <Dumbbell className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Atlas</span>
            </div>
            <p className="text-muted-foreground">© 2025 Atlas. Sistema de treino personalizado.</p>
            <div className="flex gap-6">
              <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
                Entrar
              </Link>
              <Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">
                Registrar
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
