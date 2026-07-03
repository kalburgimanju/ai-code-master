export interface LineItem {
  description: string;
  hsnCode: string;
  hsnDescription: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  supplierName: string;
  supplierGstin: string;
  supplierState: string;
  buyerName: string;
  buyerGstin: string;
  buyerState: string;
  placeOfSupply: string;
  lineItems: LineItem[];
  totalTaxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  grandTotal: number;
}

export interface GSTR1Item {
  num: number;
  gstin: string;
  trdnm: string;
  pos: string;
  ty: string;
  itms: Array<{
    num: number;
    itm_det: {
      rt: number;
      txval: number;
      iamt: number;
      camt: number;
      samt: number;
    };
  }>;
}

export interface ProcessingResult {
  invoiceData: InvoiceData;
  gstr1Json: GSTR1Item[];
  hsnSummary: Array<{
    hsnCode: string;
    description: string;
    uqc: string;
    qty: number;
    taxableValue: number;
    totalTax: number;
  }>;
}

export type ProcessingStep = "idle" | "extracting" | "mapping" | "generating" | "complete" | "error";
