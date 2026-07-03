import { useState } from "react";
import {
  FileText,
  Search,
  FileJson,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
  Info,
} from "lucide-react";
import {
  extractInvoiceData,
  mapHsnCodes,
  isDemoMode,
} from "../lib/api";
import type { InvoiceData, LineItem, ProcessingStep } from "../lib/types";

const SAMPLE_INVOICE = `TAX INVOICE
Invoice No: INV-2024-0042
Date: 15/06/2024

From:
TechParts India Pvt Ltd
GSTIN: 27AABCT1234F1Z5
Maharashtra (27)

To:
Digital Solutions LLP
GSTIN: 29AAACD5678G1ZK
Karnataka (29)

Place of Supply: Karnataka (29)

Item 1: USB-C Hub Adapter 7-in-1
HSN: 8471
Qty: 50 NOS @ ₹850.00
Taxable: ₹42,500.00
IGST 18%: ₹7,650.00
Total: ₹50,150.00

Item 2: Wireless Mouse Ergonomic
HSN: 8471
Qty: 100 NOS @ ₹450.00
Taxable: ₹45,000.00
IGST 18%: ₹8,100.00
Total: ₹53,100.00

Item 3: Laptop Stand Aluminum
HSN: 9403
Qty: 25 NOS @ ₹1,200.00
Taxable: ₹30,000.00
IGST 18%: ₹5,400.00
Total: ₹35,400.00

Total Taxable Amount: ₹1,17,500.00
Total IGST: ₹21,150.00
Grand Total: ₹1,38,650.00`;

const STEPS: { key: ProcessingStep; label: string; icon: typeof FileText }[] = [
  { key: "extracting", label: "Extracting Invoice Data", icon: FileText },
  { key: "mapping", label: "Mapping HSN Codes", icon: Search },
  { key: "generating", label: "Generating GSTR-1 JSON", icon: FileJson },
];

interface ResultState {
  invoiceData: InvoiceData;
  gstr1Json: string;
  hsnSummary: Array<{
    hsnCode: string;
    description: string;
    uqc: string;
    qty: number;
    taxableValue: number;
    totalTax: number;
  }>;
}

function DemoPage() {
  const [invoiceText, setInvoiceText] = useState("");
  const [step, setStep] = useState<ProcessingStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [activeTab, setActiveTab] = useState<"invoice" | "hsn" | "gstr1">("invoice");

  const demo = isDemoMode();

  const loadSample = () => setInvoiceText(SAMPLE_INVOICE);

  const handleProcess = async () => {
    if (!invoiceText.trim()) {
      setError("Please paste invoice text or load the sample invoice.");
      return;
    }

    setError(null);
    setResult(null);

    try {
      // Step 1: Extract
      setStep("extracting");
      await new Promise((r) => setTimeout(r, 800)); // visual delay
      const invoiceData = await extractInvoiceData(invoiceText);

      // Step 2: Map HSN
      setStep("mapping");
      await new Promise((r) => setTimeout(r, 600));
      const hsnMapped = await mapHsnCodes(invoiceData.lineItems);

      // Build HSN summary
      const hsnSummary = hsnMapped.map((item) => ({
        ...item,
        qty: invoiceData.lineItems.find((li) => li.description === item.description)?.quantity ?? 0,
      }));

      // Step 3: Generate GSTR-1 JSON
      setStep("generating");
      await new Promise((r) => setTimeout(r, 500));
      const gstr1 = buildGstr1Json(invoiceData);

      setResult({
        invoiceData,
        gstr1Json: JSON.stringify(gstr1, null, 2),
        hsnSummary,
      });
      setStep("complete");
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    }
  };

  const buildGstr1Json = (data: InvoiceData) => {
    const isInterState = data.supplierState !== data.buyerState;
    const items = data.lineItems.map((item, i) => ({
      num: i + 1,
      itm_det: {
        rt: isInterState ? item.igstRate : item.cgstRate,
        txval: item.taxableAmount,
        iamt: isInterState ? item.igstAmount : 0,
        camt: isInterState ? 0 : item.cgstAmount,
        samt: isInterState ? 0 : item.sgstAmount,
      },
    }));

    return {
      version: "GSTPortal v1.0.4",
      gtdata: {
        gstin: data.supplierGstin,
        fp: "062024",
        version: "1.0",
      },
      b2b: [
        {
          gstin: data.buyerGstin,
          inv: [
            {
              inum: data.invoiceNumber,
              idt: data.invoiceDate,
              val: data.grandTotal,
              pos: data.placeOfSupply,
              typ: isInterState ? "OE" : "OE",
              itms: items.map((item) => ({
                num: item.num,
                itm_det: item.itm_det,
              })),
            },
          ],
        },
      ],
    };
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([result.gstr1Json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GSTR1_${result.invoiceData.invoiceNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GST Invoice Processing Demo
          </h1>
          <p className="text-gray-600">
            Paste your invoice text below and let our AI extract, map, and generate GSTR-1 data automatically.
          </p>
          {demo && (
            <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-2 text-sm">
              <Info className="w-4 h-4" />
              Running in demo mode (no API key). Set{" "}
              <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">
                VITE_OPENROUTER_API_KEY
              </code>{" "}
              in your{" "}
              <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">
                .env
              </code>{" "}
              for full functionality.
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Invoice Text
            </label>
            <button
              onClick={loadSample}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
            >
              Load Sample Invoice
            </button>
          </div>
          <textarea
            value={invoiceText}
            onChange={(e) => setInvoiceText(e.target.value)}
            placeholder="Paste your invoice text here... (GST invoice, purchase order, or any billing document)"
            className="w-full h-64 p-4 border border-gray-200 rounded-xl text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              {invoiceText.length > 0
                ? `${invoiceText.split("\n").length} lines, ${invoiceText.length} characters`
                : "No text entered"}
            </span>
            <button
              onClick={handleProcess}
              disabled={step !== "idle" && step !== "complete" && step !== "error"}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {step !== "idle" && step !== "complete" && step !== "error" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Extract & Process
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step Progress */}
        {(step !== "idle" || result || error) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isComplete =
                  step === "complete" ||
                  (step === "mapping" && i === 0) ||
                  (step === "generating" && i <= 1);
                const isActive = step === s.key;

                return (
                  <div key={s.key} className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isComplete
                          ? "bg-green-100 text-green-600"
                          : isActive
                            ? "bg-primary-100 text-primary-600"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          isActive ? "text-primary-600" : isComplete ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {s.label}
                      </p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`hidden sm:block h-0.5 flex-1 rounded ${
                          isComplete ? "bg-green-300" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Processing Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
              {(
                [
                  { key: "invoice", label: "Invoice Data", icon: FileText },
                  { key: "hsn", label: "HSN Summary", icon: Search },
                  { key: "gstr1", label: "GSTR-1 JSON", icon: FileJson },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      activeTab === tab.key
                        ? "bg-white text-primary-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Invoice Data Tab */}
            {activeTab === "invoice" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Extracted Invoice Data</h3>

                {/* Header info */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Supplier</h4>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                      <p className="font-semibold text-gray-900">{result.invoiceData.supplierName}</p>
                      <p className="text-sm text-gray-600">GSTIN: {result.invoiceData.supplierGstin}</p>
                      <p className="text-sm text-gray-600">State: {result.invoiceData.supplierState}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Buyer</h4>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                      <p className="font-semibold text-gray-900">{result.invoiceData.buyerName}</p>
                      <p className="text-sm text-gray-600">GSTIN: {result.invoiceData.buyerGstin || "N/A"}</p>
                      <p className="text-sm text-gray-600">State: {result.invoiceData.buyerState}</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-primary-50 rounded-xl p-4">
                    <p className="text-xs text-primary-600 font-medium mb-1">Invoice No</p>
                    <p className="font-bold text-primary-900">{result.invoiceData.invoiceNumber}</p>
                  </div>
                  <div className="bg-primary-50 rounded-xl p-4">
                    <p className="text-xs text-primary-600 font-medium mb-1">Invoice Date</p>
                    <p className="font-bold text-primary-900">{result.invoiceData.invoiceDate}</p>
                  </div>
                  <div className="bg-primary-50 rounded-xl p-4">
                    <p className="text-xs text-primary-600 font-medium mb-1">Place of Supply</p>
                    <p className="font-bold text-primary-900">{result.invoiceData.placeOfSupply}</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">#</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Item</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">HSN</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-600">Qty</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-600">Rate</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-600">Taxable</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-600">Tax</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.invoiceData.lineItems.map((item: LineItem, i: number) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 text-gray-500">{i + 1}</td>
                          <td className="py-3 px-2 font-medium text-gray-900">{item.description}</td>
                          <td className="py-3 px-2 text-gray-600 font-mono">{item.hsnCode}</td>
                          <td className="py-3 px-2 text-right text-gray-600">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-3 px-2 text-right text-gray-600">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                          <td className="py-3 px-2 text-right text-gray-600">₹{item.taxableAmount.toLocaleString("en-IN")}</td>
                          <td className="py-3 px-2 text-right text-gray-600">
                            ₹{(item.cgstAmount + item.sgstAmount + item.igstAmount).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-2 text-right font-semibold text-gray-900">
                            ₹{item.totalAmount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300 font-bold">
                        <td colSpan={5} className="py-3 px-2 text-right text-gray-900">
                          Grand Total
                        </td>
                        <td className="py-3 px-2 text-right text-gray-900">
                          ₹{result.invoiceData.totalTaxableAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-2 text-right text-gray-900">
                          ₹{(result.invoiceData.totalCgst + result.invoiceData.totalSgst + result.invoiceData.totalIgst).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-2 text-right text-primary-600 text-base">
                          ₹{result.invoiceData.grandTotal.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* HSN Summary Tab */}
            {activeTab === "hsn" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">HSN Code Mapping Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">HSN Code</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Description</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">UQC</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-600">Qty</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-600">Taxable Value</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-600">Total Tax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.hsnSummary.map((item, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 font-mono font-semibold text-primary-700">{item.hsnCode}</td>
                          <td className="py-3 px-2 text-gray-900">{item.description}</td>
                          <td className="py-3 px-2 text-gray-600 font-mono">{item.uqc}</td>
                          <td className="py-3 px-2 text-right text-gray-600">{item.qty}</td>
                          <td className="py-3 px-2 text-right text-gray-600">
                            ₹{item.taxableValue.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-2 text-right text-gray-600">
                            ₹{item.totalTax.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GSTR-1 JSON Tab */}
            {activeTab === "gstr1" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">GSTR-1 JSON Preview</h3>
                  <button
                    onClick={downloadJson}
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download JSON
                  </button>
                </div>
                <pre className="bg-gray-900 text-green-400 rounded-xl p-6 overflow-x-auto text-sm font-mono leading-relaxed">
                  {result.gstr1Json}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DemoPage;
