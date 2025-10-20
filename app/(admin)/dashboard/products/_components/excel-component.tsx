import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";

export type QuoteItem = {
  quoteId: string;
  productId: string | null;
  sku: string;
  name: string;
  price: string;
  qty: number;
  image: string | null;
  position: number;
};

export type Quote = {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  company: string | null;
  cnpj: string | null;
  address: string | null;
  variant: "ready" | "imported";
  note: string | null;
  items: QuoteItem[];
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("pt-BR");

const ExportToExcelButton = ({
  quote,
  fileName,
}: {
  quote: Quote;
  fileName: string;
}) => {

const handleExport = () => {
  const formattedData = quote.items.map(item => ({
    'SKU do Item': item.sku,
    'Nome do Item': item.name,
    'Quantidade': item.qty,
    'Preço Unitário': Number(item.price),
    'Subtotal do Item': Number(item.price) * item.qty,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);


  worksheet['!cols'] = [
    { wch: 20 },
    { wch: 40 }, 
    { wch: 12 },
    { wch: 15 }, 
    { wch: 15 }, 
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Pedido_${quote.id}`);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

  return (
    <Button className="flex items-center gap-2" onClick={handleExport}>
      <Upload />
      Exportar para Excel
    </Button>
  );
};

export default ExportToExcelButton;
