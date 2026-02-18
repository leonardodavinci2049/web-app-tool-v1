"use client";

import { useState, useTransition } from "react";
import {
  type RedirectStep,
  resolveUrlRedirects,
} from "@/app/actions/url-dissection-actions";
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

type PageState = {
  isShortened: boolean;
  redirectChain: RedirectStep[];
  finalUrl: string;
  analysis: UrlAnalysis | null;
};

function analyzeUrlString(urlString: string): UrlAnalysis | null {
  try {
    const urlObj = new URL(urlString);
    const queryParams = Array.from(urlObj.searchParams.entries()).map(
      ([name, value]) => ({
        name,
        value,
        length: value.length,
      }),
    );
    return {
      protocol: urlObj.protocol,
      host: urlObj.hostname,
      path: urlObj.pathname,
      hash: urlObj.hash,
      queryParams,
    };
  } catch {
    return null;
  }
}

function StatusBadge({ code }: { code: number }) {
  const isRedirect = [301, 302, 303, 307, 308].includes(code);
  const isSuccess = code >= 200 && code < 300;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold",
        isRedirect && "bg-amber-100 text-amber-800",
        isSuccess && "bg-green-100 text-green-800",
        !isRedirect && !isSuccess && "bg-red-100 text-red-800",
      )}
    >
      {code}
    </span>
  );
}

export default function DissectionPage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [pageState, setPageState] = useState<PageState | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAnalyze = () => {
    setError("");
    setPageState(null);

    if (!url.trim()) {
      setError("Por favor, insira uma URL");
      return;
    }

    // Valida formato básico antes de enviar ao servidor
    try {
      new URL(url.trim());
    } catch {
      setError("URL inválida. Por favor, verifique e tente novamente.");
      return;
    }

    startTransition(async () => {
      const result = await resolveUrlRedirects(url.trim());

      if (!result.success && result.redirectChain.length === 0) {
        setError(result.error ?? "Erro ao analisar a URL.");
        return;
      }

      if (result.error) {
        setError(result.error);
      }

      const analysis = analyzeUrlString(result.finalUrl);

      setPageState({
        isShortened: result.isShortened,
        redirectChain: result.redirectChain,
        finalUrl: result.finalUrl,
        analysis,
      });
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Dissecar a URL de afiliado</h1>

      <div className="w-full max-w-4xl space-y-6">
        {/* Card de entrada */}
        <Card>
          <CardHeader>
            <CardTitle>Analisar URL</CardTitle>
            <CardDescription>
              Cole a URL de afiliado (encurtada ou completa) para visualizar
              seus componentes e a cadeia de redirecionamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="https://s.shopee.com.br/7pntcUSb82"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                disabled={isPending}
              />
              <Button onClick={handleAnalyze} disabled={isPending}>
                {isPending ? "Analisando..." : "Analisar"}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </CardContent>
        </Card>

        {/* Indicador de carregamento */}
        {isPending && (
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">
                  Rastreando redirecionamentos da URL...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultados */}
        {pageState && !isPending && (
          <>
            {/* Cadeia de redirecionamentos (só exibe se houver redirecionamentos) */}
            {pageState.isShortened && pageState.redirectChain.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Cadeia de Redirecionamentos</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      ({pageState.redirectChain.length}{" "}
                      {pageState.redirectChain.length === 1
                        ? "passo"
                        : "passos"}
                      )
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Sequência de redirecionamentos desde o link encurtado até a
                    URL final
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {pageState.redirectChain.map((step, index) => {
                      const isLast =
                        index === pageState.redirectChain.length - 1;
                      return (
                        <li key={step.step} className="flex gap-3">
                          {/* Linha vertical conectora */}
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                isLast
                                  ? "bg-green-600 text-white"
                                  : "bg-amber-500 text-white",
                              )}
                            >
                              {step.step}
                            </div>
                            {!isLast && (
                              <div className="w-0.5 flex-1 bg-border mt-1 mb-0 min-h-[12px]" />
                            )}
                          </div>

                          {/* Conteúdo do passo */}
                          <div className="flex-1 pb-2">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <StatusBadge code={step.statusCode} />
                              <span className="text-xs text-muted-foreground">
                                {step.statusText}
                              </span>
                              {isLast && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                                  URL Final
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-mono break-all text-foreground bg-muted px-2 py-1.5 rounded">
                              {step.url}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Análise da URL final */}
            {pageState.analysis && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {pageState.isShortened
                      ? "Análise da URL Final"
                      : "Resultado da Análise"}
                  </CardTitle>
                  {pageState.isShortened && (
                    <CardDescription className="break-all font-mono text-xs">
                      {pageState.finalUrl}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* URL Base */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">URL Base</h3>
                    <div className="bg-muted p-3 rounded-md text-sm break-all space-y-1">
                      <p>
                        <strong>Protocolo:</strong>{" "}
                        {pageState.analysis.protocol}
                      </p>
                      <p>
                        <strong>Host:</strong> {pageState.analysis.host}
                      </p>
                      <p>
                        <strong>Caminho:</strong>{" "}
                        {pageState.analysis.path || "/"}
                      </p>
                      {pageState.analysis.hash && (
                        <p>
                          <strong>Hash:</strong> {pageState.analysis.hash}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Parâmetros */}
                  {pageState.analysis.queryParams.length > 0 ? (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">
                        Parâmetros da Query (
                        {pageState.analysis.queryParams.length})
                      </h3>
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-3 font-medium">#</th>
                              <th className="text-left p-3 font-medium">
                                Nome do Parâmetro
                              </th>
                              <th className="text-left p-3 font-medium">
                                Valor
                              </th>
                              <th className="text-right p-3 font-medium">
                                Tamanho
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageState.analysis.queryParams.map(
                              (param, index) => (
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
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total de caracteres em parâmetros:{" "}
                        {pageState.analysis.queryParams.reduce(
                          (sum, p) => sum + p.length,
                          0,
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground text-center">
                      Nenhum parâmetro encontrado nesta URL
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
