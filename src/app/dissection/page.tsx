"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type UrlAnalysis = {
  protocol: string;
  host: string;
  path: string;
  hash: string;
  queryParams: Array<{ name: string; value: string; length: number }>;
};

export default function DissectionPage() {
  const [url, setUrl] = useState("");
  const [analysis, setAnalysis] = useState<UrlAnalysis | null>(null);
  const [error, setError] = useState("");

  const analyzeUrl = () => {
    setError("");
    setAnalysis(null);

    if (!url.trim()) {
      setError("Por favor, insira uma URL");
      return;
    }

    try {
      const urlObj = new URL(url);

      const queryParams = Array.from(urlObj.searchParams.entries()).map(
        ([name, value]) => ({
          name,
          value,
          length: value.length,
        }),
      );

      setAnalysis({
        protocol: urlObj.protocol,
        host: urlObj.hostname,
        path: urlObj.pathname,
        hash: urlObj.hash,
        queryParams,
      });
    } catch {
      setError("URL inválida. Por favor, verifique e tente novamente.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      analyzeUrl();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Dissecar a url de afiliado</h1>

      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Analisar URL</CardTitle>
            <CardDescription>
              Cole a URL de afiliado para visualizar seus componentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="https://exemplo.com/caminho?param1=valor1&param2=valor2"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={analyzeUrl}>Analisar</Button>
            </div>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </CardContent>
        </Card>

        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Análise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">URL Base</h3>
                <div className="bg-muted p-3 rounded-md text-sm break-all">
                  <p>
                    <strong>Protocolo:</strong> {analysis.protocol}
                  </p>
                  <p>
                    <strong>Host:</strong> {analysis.host}
                  </p>
                  <p>
                    <strong>Caminho:</strong> {analysis.path || "/"}
                  </p>
                  {analysis.hash && (
                    <p>
                      <strong>Hash:</strong> {analysis.hash}
                    </p>
                  )}
                </div>
              </div>

              {analysis.queryParams.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">
                    Parâmetros da Query ({analysis.queryParams.length})
                  </h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-medium">#</th>
                          <th className="text-left p-3 font-medium">
                            Nome do Parâmetro
                          </th>
                          <th className="text-left p-3 font-medium">Valor</th>
                          <th className="text-right p-3 font-medium">
                            Tamanho
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.queryParams.map((param, index) => (
                          <tr
                            key={param.name}
                            className={cn(
                              "border-t",
                              index % 2 === 0 && "bg-muted/50",
                            )}
                          >
                            <td className="p-3">{index + 1}</td>
                            <td className="p-3 font-mono text-xs">
                              {param.name}
                            </td>
                            <td className="p-3 break-all max-w-md font-mono text-xs">
                              {param.value}
                            </td>
                            <td className="p-3 text-right font-mono">
                              {param.length}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total de caracteres em parâmetros:{" "}
                    {analysis.queryParams.reduce((sum, p) => sum + p.length, 0)}
                  </p>
                </div>
              )}

              {analysis.queryParams.length === 0 && (
                <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground text-center">
                  Nenhum parâmetro encontrado nesta URL
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
