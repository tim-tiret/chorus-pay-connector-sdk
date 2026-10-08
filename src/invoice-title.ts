/**
 * Invoice title built from the purchase-order analysis of a pay link.
 *
 * Shared by the ERP connectors (Pennylane, Dolibarr): before SDK 2.3.0 each
 * connector carried its own copy. `PayLinkDto.purchase_order_analysis` is the
 * stored analysis (parsed JSON or JSON string); without it the title degrades
 * to `"<title> - DEVIS <quote_number>"`.
 */

interface AnalysisPageData {
  numero_engagement?: string | null;
  numero_devis?: string | null;
  code_service?: string | null;
  numero_marche?: string | null;
  confidence_score: number;
}

interface DocumentAnalysisResult {
  success: boolean;
  total_pages: number;
  pages: { page: number; data: AnalysisPageData }[];
}

/** Data of the page with the highest confidence score, null without analysis. */
function getBestAnalysisData(analysis: DocumentAnalysisResult): AnalysisPageData | null {
  if (!analysis.success || analysis.pages.length === 0) return null;
  const bestPage = analysis.pages.reduce((best, current) =>
    current.data.confidence_score > best.data.confidence_score ? current : best
  );
  return bestPage.data;
}

function extractAnalysisDataFromPayLink(payLink: {
  purchase_order_analysis?: unknown;
  quote_number?: string;
}): {
  numeroDevis: string | null;
  numeroEngagement: string | null;
  numeroMarche: string | null;
  codeService: string | null;
} {
  if (!payLink.purchase_order_analysis) {
    return {
      numeroDevis: payLink.quote_number || null,
      numeroEngagement: null,
      numeroMarche: null,
      codeService: null,
    };
  }
  const analysis =
    typeof payLink.purchase_order_analysis === "string"
      ? (JSON.parse(payLink.purchase_order_analysis) as DocumentAnalysisResult)
      : (payLink.purchase_order_analysis as DocumentAnalysisResult);
  const bestData = getBestAnalysisData(analysis);
  return {
    numeroDevis: bestData?.numero_devis || payLink.quote_number || null,
    numeroEngagement: bestData?.numero_engagement || null,
    numeroMarche: bestData?.numero_marche || null,
    codeService: bestData?.code_service || null,
  };
}

/**
 * `"<title> - DEVIS <n> - Engagement : <n> - Marché : <n> - Code service : <code>"`,
 * each part only when known.
 */
export function formatInvoiceTitleWithServiceCode(
  baseTitle: string,
  payLink: { purchase_order_analysis?: unknown; quote_number?: string }
): string {
  const data = extractAnalysisDataFromPayLink(payLink);
  const parts: string[] = [baseTitle];
  if (data.numeroDevis) parts.push(`DEVIS ${data.numeroDevis}`);
  if (data.numeroEngagement) parts.push(`Engagement : ${data.numeroEngagement}`);
  if (data.numeroMarche) parts.push(`Marché : ${data.numeroMarche}`);
  if (data.codeService) parts.push(`Code service : ${data.codeService}`);
  return parts.join(" - ");
}
