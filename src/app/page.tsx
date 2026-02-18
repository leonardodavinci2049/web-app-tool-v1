"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { generateAffiliateLink } from "./actions/shopee-actions";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [shortLink, setShortLink] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    if (!url.trim()) {
      toast.error("Por favor, insira uma URL");
      return;
    }

    const formData = new FormData();
    formData.append("originUrl", url);

    startTransition(async () => {
      const result = await generateAffiliateLink(formData);

      if (result.success && result.shortLink) {
        setShortLink(result.shortLink);
        toast.success("Link de afiliado gerado com sucesso!");
      } else {
        toast.error(result.error || "Erro ao gerar link de afiliado");
        setShortLink("");
      }
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortLink);
    toast.success("Link copiado para a área de transferência");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            Gerador de Link de Afiliado Shopee
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cole o link do produto Shopee e gere seu link de afiliado
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Cole o link do produto Shopee aqui"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isPending}
          />

          <Button
            onClick={handleGenerate}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                <span>Gerando...</span>
              </div>
            ) : (
              "Gerar Link de Afiliado"
            )}
          </Button>
        </div>

        {shortLink && (
          <div className="space-y-3">
            <div className="rounded-md bg-white dark:bg-gray-800 p-4 shadow">
              <p className="text-sm font-medium mb-2">
                Link de Afiliado Gerado:
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={shortLink}
                  readOnly
                  className="text-sm"
                />
                <Button onClick={handleCopy} size="sm">
                  Copiar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
