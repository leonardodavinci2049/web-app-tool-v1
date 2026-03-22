"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type {
  ItemFeed,
  ItemFeedDataConnection,
} from "@/services/api-shopee-affiliate";
import type {
  GetItemFeedDataResult,
  ListItemFeedsResult,
} from "../actions/item-feeds-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  fetchItemFeedData,
  fetchItemFeeds,
} from "../actions/item-feeds-actions";

export default function ListItemFeedsPage() {
  const [feedMode, setFeedMode] = useState<string>("FULL");
  const [feeds, setFeeds] = useState<ItemFeed[]>([]);
  const [rawResponse, setRawResponse] = useState<
    ListItemFeedsResult | GetItemFeedDataResult | null
  >(null);
  const [feedData, setFeedData] = useState<ItemFeedDataConnection | null>(null);
  const [selectedFeed, setSelectedFeed] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [isLoadingData, startDataTransition] = useTransition();

  const handleFetchFeeds = () => {
    const formData = new FormData();
    formData.append("feedMode", feedMode);

    startTransition(async () => {
      const result = await fetchItemFeeds(formData);
      setRawResponse(result);
      setFeedData(null);
      setSelectedFeed("");

      if (result.success && result.feeds) {
        setFeeds(result.feeds);
        toast.success(
          `${result.feeds.length} feed(s) carregado(s) com sucesso!`,
        );
      } else {
        toast.error(result.error || "Erro ao carregar feeds");
        setFeeds([]);
      }
    });
  };

  const handleFetchFeedData = (datafeedId: string) => {
    setSelectedFeed(datafeedId);

    const formData = new FormData();
    formData.append("datafeedId", datafeedId);
    formData.append("offset", "0");
    formData.append("limit", "50");

    startDataTransition(async () => {
      const result = await fetchItemFeedData(formData);
      setRawResponse(result);

      if (result.success && result.data) {
        setFeedData(result.data);
        toast.success(
          `${result.data.rows.length} produto(s) carregado(s) de ${result.data.pageInfo.totalCount} total`,
        );
      } else {
        toast.error(result.error || "Erro ao carregar dados do feed");
        setFeedData(null);
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-gray-900 p-4 pt-20">
      <div className="w-full max-w-6xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Feed de Ofertas Shopee</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Selecione o modo do feed e carregue a lista de catálogos de produtos
          </p>
        </div>

        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <label
              htmlFor="feedMode"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Modo do Feed
            </label>
            <Select value={feedMode} onValueChange={setFeedMode}>
              <SelectTrigger id="feedMode">
                <SelectValue placeholder="Selecione o modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL">FULL - Catálogo completo</SelectItem>
                <SelectItem value="DELTA">
                  DELTA - Atualizações desde ontem
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleFetchFeeds} disabled={isPending}>
            {isPending ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                <span>Carregando...</span>
              </div>
            ) : (
              "Carregar Feeds"
            )}
          </Button>
        </div>

        {feeds.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {feeds.length} feed(s) encontrado(s)
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {feeds.map((feed) => (
                <Card key={feed.datafeedId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug">
                        {feed.datafeedName}
                      </CardTitle>
                      <Badge
                        variant={
                          feed.feedMode === "FULL" ? "default" : "secondary"
                        }
                      >
                        {feed.feedMode}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {feed.description && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {feed.description}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-gray-700 dark:text-gray-300">
                      <div>
                        <span className="font-medium">Produtos:</span>{" "}
                        {feed.totalCount.toLocaleString("pt-BR")}
                      </div>
                      <div>
                        <span className="font-medium">Data:</span> {feed.date}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">ID:</span>{" "}
                        <span className="text-xs break-all">
                          {feed.datafeedId}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Referência:</span>{" "}
                        <span className="text-xs break-all">
                          {feed.referenceId}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={
                        isLoadingData && selectedFeed === feed.datafeedId
                      }
                      onClick={() => handleFetchFeedData(feed.datafeedId)}
                    >
                      {isLoadingData && selectedFeed === feed.datafeedId ? (
                        <div className="flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          <span>Carregando produtos...</span>
                        </div>
                      ) : (
                        "Ver Produtos"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {feedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Produtos do Feed</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Exibindo {feedData.rows.length} de{" "}
                {feedData.pageInfo.totalCount.toLocaleString("pt-BR")}{" "}
                produto(s)
              </p>
            </div>

            <div className="grid gap-3">
              {feedData.rows.map((row, index) => {
                let parsed: Record<string, unknown> = {};
                try {
                  parsed = JSON.parse(row.columns);
                } catch {
                  parsed = { raw: row.columns };
                }
 

                const productName =
                  (parsed.product_name as string) ||
                  (parsed.productName as string) ||
                  `Produto ${index + 1}`;
       
                return (
                  <Card key={`${row.columns.slice(0, 30)}-${index}`}>
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <p className="font-medium text-sm">{productName}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                            {parsed.price !== undefined && (
                              <span>Preço: {String(parsed.price)}</span>
                            )}
                            {parsed.commission_rate !== undefined && (
                              <span>
                                Comissão: {String(parsed.commission_rate)}%
                              </span>
                            )}
                            {parsed.sales !== undefined && (
                              <span>Vendas: {String(parsed.sales)}</span>
                            )}
                          </div>
                        </div>
                        {row.updateType && (
                          <Badge
                            variant={
                              row.updateType === "NEW"
                                ? "default"
                                : row.updateType === "DELETE"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {row.updateType}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {rawResponse && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              JSON Response
            </p>
            <pre className="rounded-md bg-white dark:bg-gray-800 p-4 shadow text-xs overflow-auto max-h-96">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
