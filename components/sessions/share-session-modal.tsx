"use client";

import { useRef, useState, useEffect } from "react";
import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import type { WorkoutSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShareSessionCard } from "@/components/sessions/share-session-card";
import { toPng } from "html-to-image";
import { Share2, Download } from "lucide-react";

async function dataUrlToBlob(dataUrl: string): Promise<Blob | null> {
  try {
    const res = await fetch(dataUrl);
    return await res.blob();
  } catch (error) {
    console.error("Error converting data URL to blob:", error);
    return null;
  }
}

// --- Início da Função para Embutir Fontes ---
async function getFontEmbedCSS() {
  try {
    // Busca a folha de estilo da fonte Geist (ajuste o caminho se for diferente)
    const fontCssUrl = "/_next/static/css/app/layout.css"; 
    const cssResponse = await fetch(fontCssUrl);
    if (!cssResponse.ok) return '';

    let cssText = await cssResponse.text();
    
    // Encontra todas as URLs de fontes na folha de estilo
    const fontUrls = cssText.match(/url\(([^)]+)\)/g) || [];

    // Processa cada URL de fonte em paralelo
    await Promise.all(
      fontUrls.map(async (urlString) => {
        const urlMatch = urlString.match(/url\(([^)]+)\)/);
        if (!urlMatch) return;
        
        const originalUrl = urlMatch[1].replace(/['"]/g, '');
        
        try {
          const fontResponse = await fetch(originalUrl);
          if (!fontResponse.ok) return;

          const blob = await fontResponse.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          
          // Substitui a URL original pela versão em Data URL
          cssText = cssText.replace(originalUrl, dataUrl);
        } catch (error) {
          console.error(`Failed to fetch and embed font: ${originalUrl}`, error);
        }
      })
    );
    
    return cssText;
  } catch (error) {
    console.error("Error generating font CSS:", error);
    return '';
  }
}
// --- Fim da Função para Embutir Fontes ---


interface ShareSessionModalProps {
  sessionId: string | null;
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ShareSessionModal({ sessionId, open, onOpenChange }: ShareSessionModalProps) {
  const { data: session } = useSWR<WorkoutSession>(
    sessionId ? `/sessions/${sessionId}` : null,
    (url) => apiClient.get(url)
  );

  const squareRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const [fontEmbedCss, setFontEmbedCss] = useState<string>('');

  // Carrega o CSS da fonte quando o modal é aberto
  useEffect(() => {
    if (open) {
      getFontEmbedCSS().then(setFontEmbedCss);
    }
  }, [open]);

  const handleShareOrDownload = async (size: "square" | "story") => {
    const ref = size === "square" ? squareRef : storyRef;
    if (ref.current === null) {
      alert("Erro: Não foi possível encontrar o elemento para gerar a imagem.");
      return;
    }
    
    const options = {
      cacheBust: true,
      pixelRatio: 1,
      width: 1080,
      height: size === "square" ? 1080 : 1920,
      fontEmbedCSS: fontEmbedCss, // Injeta o CSS da fonte aqui
    };

    try {
      const dataUrl = await toPng(ref.current, options);
      const blob = await dataUrlToBlob(dataUrl);
      if (!blob) throw new Error("Não foi possível converter a imagem para Blob.");

      const file = new File([blob], `atlas-workout-${size}.png`, { type: blob.type });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Meu treino no Atlas: ${session?.package_name}`,
          text: `Confira meu treino de hoje! Feito no Atlas.`,
        });
      } else {
        const link = document.createElement("a");
        link.download = `atlas-workout-${size}-${session?.id}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Erro ao compartilhar ou baixar a imagem:", err);
      alert("Erro ao compartilhar ou baixar a imagem. Tente novamente.");
    }
  };

  const isShareApiAvailable = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Compartilhar Treino
          </DialogTitle>
        </DialogHeader>

        <div className="absolute -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
            {session && (
                <>
                    <ShareSessionCard
                        ref={squareRef}
                        session={session}
                        size="square"
                    />
                    <ShareSessionCard
                        ref={storyRef}
                        session={session}
                        size="story"
                    />
                </>
            )}
        </div>

        {session ? (
          <Tabs defaultValue="square" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-surface">
              <TabsTrigger value="square">Feed (1:1)</TabsTrigger>
              <TabsTrigger value="story">Story (9:16)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="square">
              <div className="flex flex-col items-center gap-4 mt-4">
                <div className="w-[300px] h-[300px] bg-background rounded-md overflow-hidden flex justify-center items-center">
                  <div style={{ transform: 'scale(0.277)', transformOrigin: 'center center' }}>
                    <ShareSessionCard session={session} size="square" />
                  </div>
                </div>
                <Button onClick={() => handleShareOrDownload("square")}>
                  {isShareApiAvailable ? <Share2 className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                  {isShareApiAvailable ? 'Compartilhar' : 'Baixar Imagem'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="story">
              <div className="flex flex-col items-center gap-4 mt-4">
                <div className="w-[270px] h-[480px] bg-background rounded-md overflow-hidden flex justify-center items-center">
                  <div style={{ transform: 'scale(0.25)', transformOrigin: 'center center' }}>
                    <ShareSessionCard session={session} size="story" />
                  </div>
                </div>
                <Button onClick={() => handleShareOrDownload("story")}>
                   {isShareApiAvailable ? <Share2 className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                   {isShareApiAvailable ? 'Compartilhar' : 'Baixar Imagem'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">Carregando dados do treino...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}