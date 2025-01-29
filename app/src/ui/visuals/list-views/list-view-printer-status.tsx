import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PrinterStatus {
  id: string;
  name: string;
  type: string;
  state: string;
  percent: number;
  temps: number[] | null;
  target_temps: number[] | null;
}

const PrinterStatusListView = () => {
  const [printerStatusData, setPrinterStatusData] = useState<PrinterStatus[]>(
    [],
  );

  useEffect(() => {
    // Fetch the printer status data
    const fetchData = async () => {
      try {
        const response = await fetch("/api/3DPOS/printers");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setPrinterStatusData(data);
      } catch (error) {
        console.error("Error fetching printer status data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="p-4">
      <CardHeader className="sticky top-0 z-10 bg-background">
        <CardTitle className="text-lg font-semibold">Printer Status</CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
          {printerStatusData.map((printer) => (
            <Card
            key={printer.id}
            className={cn(
              "p-4 flex justify-between items-center border",
              "transition-colors",
              printer.state === "printing"
                ? "bg-green-50 dark:bg-green-900"
                : "bg-red-50 dark:bg-red-900"
            )}
          >
              <div>
                <p className="text-sm font-medium">
                  {printer.name} ({printer.type})
                </p>
                <p
                  className={cn(
                    "text-sm",
                    printer.state === "printing"
                      ? "text-green-600 dark:text-green-300"
                      : "text-red-600 dark:text-red-300"
                  )}
                >
                  {printer.state.charAt(0).toUpperCase() +
                    printer.state.slice(1)}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Progress: {printer.percent}%</p>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PrinterStatusListView;
