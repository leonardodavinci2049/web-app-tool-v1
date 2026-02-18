"use server";

import axios from "axios";

export interface RedirectStep {
  step: number;
  url: string;
  statusCode: number;
  statusText: string;
}

export interface ResolveUrlResult {
  success: boolean;
  isShortened: boolean;
  redirectChain: RedirectStep[];
  finalUrl: string;
  error?: string;
}

const MAX_REDIRECTS = 15;

/**
 * Resolve a cadeia de redirecionamentos de uma URL encurtada.
 * Faz requisições HEAD sem seguir redirecionamentos automaticamente,
 * capturando cada passo até chegar na URL final.
 */
export async function resolveUrlRedirects(
  inputUrl: string,
): Promise<ResolveUrlResult> {
  if (!inputUrl?.trim()) {
    return {
      success: false,
      isShortened: false,
      redirectChain: [],
      finalUrl: inputUrl,
      error: "Por favor, insira uma URL válida.",
    };
  }

  const redirectChain: RedirectStep[] = [];
  let currentUrl = inputUrl.trim();
  let stepCount = 0;

  try {
    // Valida se é uma URL válida antes de começar
    new URL(currentUrl);
  } catch {
    return {
      success: false,
      isShortened: false,
      redirectChain: [],
      finalUrl: inputUrl,
      error: "URL inválida. Por favor, verifique e tente novamente.",
    };
  }

  try {
    while (stepCount < MAX_REDIRECTS) {
      stepCount++;

      let statusCode: number;
      let statusText: string;
      let locationHeader: string | undefined;

      try {
        // Tenta HEAD primeiro (mais leve)
        const response = await axios.head(currentUrl, {
          maxRedirects: 0,
          timeout: 10000,
          validateStatus: (status) => status < 400 || status === 405,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; URL-Dissector/1.0; +https://web-app-tool)",
            Accept: "*/*",
          },
        });

        statusCode = response.status;
        statusText = response.statusText || getStatusText(statusCode);
        locationHeader = response.headers.location as string | undefined;
      } catch (headError) {
        // Se HEAD falhar com 405 (Method Not Allowed), tenta GET
        if (
          axios.isAxiosError(headError) &&
          headError.response?.status === 405
        ) {
          const getResponse = await axios.get(currentUrl, {
            maxRedirects: 0,
            timeout: 10000,
            validateStatus: (status) => status < 400,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (compatible; URL-Dissector/1.0; +https://web-app-tool)",
              Accept: "*/*",
            },
          });
          statusCode = getResponse.status;
          statusText = getResponse.statusText || getStatusText(statusCode);
          locationHeader = getResponse.headers.location as string | undefined;
        } else if (
          axios.isAxiosError(headError) &&
          headError.response &&
          [301, 302, 303, 307, 308].includes(headError.response.status)
        ) {
          // Axios lança erro para redirecionamentos quando maxRedirects=0
          statusCode = headError.response.status;
          statusText =
            headError.response.statusText || getStatusText(statusCode);
          locationHeader = headError.response.headers.location as
            | string
            | undefined;
        } else {
          throw headError;
        }
      }

      redirectChain.push({
        step: stepCount,
        url: currentUrl,
        statusCode,
        statusText,
      });

      // Se não é redirecionamento, chegamos ao destino final
      const isRedirect = [301, 302, 303, 307, 308].includes(statusCode);
      if (!isRedirect || !locationHeader) {
        break;
      }

      // Resolve URL relativa se necessário
      try {
        currentUrl = new URL(locationHeader, currentUrl).href;
      } catch {
        currentUrl = locationHeader;
      }
    }

    const finalUrl = redirectChain[redirectChain.length - 1]?.url ?? inputUrl;
    const isShortened = redirectChain.length > 1;

    return {
      success: true,
      isShortened,
      redirectChain,
      finalUrl,
    };
  } catch (error) {
    const errorMessage = axios.isAxiosError(error)
      ? `Erro ao acessar a URL: ${error.message}`
      : error instanceof Error
        ? error.message
        : "Erro desconhecido ao resolver a URL.";

    // Retorna o que conseguiu até agora, mesmo com erro
    const finalUrl =
      redirectChain.length > 0
        ? redirectChain[redirectChain.length - 1].url
        : inputUrl;

    return {
      success: redirectChain.length > 0,
      isShortened: redirectChain.length > 1,
      redirectChain,
      finalUrl,
      error: errorMessage,
    };
  }
}

function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };
  return statusTexts[status] ?? "Unknown";
}
