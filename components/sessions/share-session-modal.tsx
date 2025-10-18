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

// Função para Embutir Fontes (mantida como antes)
async function getFontEmbedCSS() {
  // ... (código mantido igual ao fornecido anteriormente)
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

  const cardRef = useRef<HTMLDivElement>(null); // Único ref necessário
  const [fontEmbedCss, setFontEmbedCss] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<"square" | "story" | "story-transparent">("square"); // Estado para tamanho
  const [transparentBg, setTransparentBg] = useState(false); // Estado para fundo transparente

  useEffect(() => {
    if (open) {
      getFontEmbedCSS().then(setFontEmbedCss);
    }
  }, [open]);

  // Atualiza os estados quando a aba muda
  const handleTabChange = (value: string) => {
    const sizeValue = value as "square" | "story" | "story-transparent";
    setSelectedSize(sizeValue);
    setTransparentBg(value === "story-transparent");
  }

  const handleShareOrDownload = async () => {
    if (cardRef.current === null || !session) {
      alert("Erro: Não foi possível encontrar o elemento ou os dados da sessão.");
      return;
    }

    const isTransparent = selectedSize === "story-transparent";
    const height = (selectedSize === "square") ? 1080 : 1920;

    const options = {
      cacheBust: true,
      pixelRatio: 1, // Manter 1 para melhor performance inicial, pode aumentar se necessário
      width: 1080,
      height: height,
      fontEmbedCSS: fontEmbedCss,
      // Aplicar fundo transparente se necessário
      ...(isTransparent && { backgroundColor: 'transparent' }),
      // Tentar forçar o fundo do body para transparente se a opção acima falhar
      // style: isTransparent ? { body: { backgroundColor: 'transparent !important' } } : {},
    };

    try {
      // Forçar re-render com a prop de transparência antes de gerar a imagem
      setTransparentBg(isTransparent);
      // Pequeno delay para garantir que o re-render ocorreu (ajuste se necessário)
      await new Promise(resolve => setTimeout(resolve, 50));

      const dataUrl = await toPng(cardRef.current, options);
      const blob = await dataUrlToBlob(dataUrl);
      if (!blob) throw new Error("Não foi possível converter a imagem para Blob.");

      const fileName = `atlas-workout-${selectedSize.replace('-transparent','')}-${session.id}.png`;
      const file = new File([blob], fileName, { type: blob.type });

      // Verificar se pode compartilhar ARQUIVOS
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
            files: [file],
            title: `Meu treino no Atlas: ${session.package_name}`,
            text: `Confira meu treino de hoje! Feito no Atlas.`,
            });
        } catch (shareError: any) {
            // Se o usuário cancelar o share, não fazer nada. Se for outro erro, logar.
            if (shareError.name !== 'AbortError') {
                console.error("Erro ao tentar compartilhar:", shareError);
                // Fallback para download se o share falhar por outro motivo
                 const link = document.createElement("a");
                 link.download = fileName;
                 link.href = dataUrl;
                 link.click();
            }
        }
      } else {
        // Fallback para download
        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Erro ao gerar/compartilhar/baixar a imagem:", err);
      alert("Erro ao gerar/compartilhar/baixar a imagem. Tente novamente.");
    }
  };

  const isShareApiAvailable = typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Compartilhar Treino
          </DialogTitle>
        </DialogHeader>

        {/* Elemento único para gerar a imagem, posicionado fora da tela */}
        <div className="absolute -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
            {session && (
                 <ShareSessionCard
                    ref={cardRef}
                    session={session}
                    size={selectedSize === "square" ? "square" : "story"}
                    transparentBg={transparentBg} // Passa a prop de transparência
                 />
            )}
        </div>

        {session ? (
          <Tabs defaultValue="square" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3 bg-surface"> {/* Alterado para 3 colunas */}
              <TabsTrigger value="square">Feed (1:1)</TabsTrigger>
              <TabsTrigger value="story">Story (9:16)</TabsTrigger>
              <TabsTrigger value="story-transparent">Story (Transp.)</TabsTrigger> {/* Nova aba */}
            </TabsList>

            {/* Conteúdo unificado para preview */}
            <TabsContent value="square">
              <SharePreview size="square" onAction={handleShareOrDownload} isShareAvailable={isShareApiAvailable} session={session} transparentBg={false} />
            </TabsContent>
            <TabsContent value="story">
              <SharePreview size="story" onAction={handleShareOrDownload} isShareAvailable={isShareApiAvailable} session={session} transparentBg={false} />
            </TabsContent>
             <TabsContent value="story-transparent">
              <SharePreview size="story" onAction={handleShareOrDownload} isShareAvailable={isShareApiAvailable} session={session} transparentBg={true} />
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

// Componente auxiliar para o preview e botão
interface SharePreviewProps {
    size: "square" | "story";
    onAction: () => void;
    isShareAvailable: boolean;
    session: WorkoutSession;
    transparentBg: boolean;
}

function SharePreview({ size, onAction, isShareAvailable, session, transparentBg }: SharePreviewProps) {
    const previewWidth = size === "square" ? "w-[300px]" : "w-[270px]";
    const previewHeight = size === "square" ? "h-[300px]" : "h-[480px]";
    const scale = size === "square" ? 0.277 : 0.25;

    return (
        <div className="flex flex-col items-center gap-4 mt-4">
            <div className={`${previewWidth} ${previewHeight} bg-muted/50 rounded-md overflow-hidden flex justify-center items-center border border-dashed border-border`}>
            {/* O conteúdo do preview é apenas visual, a imagem real é gerada a partir do cardRef */}
             <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
                 <ShareSessionCard session={session} size={size} transparentBg={transparentBg} />
            </div>
            </div>
            <Button onClick={onAction}>
            {isShareAvailable ? <Share2 className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
            {isShareAvailable ? 'Compartilhar' : 'Baixar Imagem'}
            </Button>
      </div>
    );
}