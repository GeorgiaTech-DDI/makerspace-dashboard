import { useEffect, useState } from "react";

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
    <div className="p-4 border rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 top-0 bg-white z-10">
        Printer Status
      </h3>
      <div className="max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 gap-2">
          {printerStatusData.map((printer) => (
            <div
              key={printer.id}
              className="bg-white p-2 rounded-lg shadow-md border flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-medium">
                  {printer.name} ({printer.type})
                </p>
                <p
                  className={`text-sm ${printer.state === "printing" ? "text-green-600" : "text-red-600"}`}
                >
                  {printer.state.charAt(0).toUpperCase() +
                    printer.state.slice(1)}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                <p>Progress: {printer.percent}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrinterStatusListView;
