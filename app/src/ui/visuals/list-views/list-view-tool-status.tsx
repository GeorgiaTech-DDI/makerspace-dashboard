import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ToolStatus {
  Status: string;
  ToolName: string;
}

const getStateStyles = (status: string) => {
  const isAvailable = status.includes("Available");
  return {
    container: cn(
      "p-4 flex justify-between items-center border transition-colors",
      isAvailable
        ? "bg-green-50 dark:bg-green-900"
        : "bg-red-50 dark:bg-red-900",
    ),
    status: cn(
      "text-sm",
      isAvailable
        ? "text-green-600 dark:text-green-300"
        : "text-red-600 dark:text-red-300",
    ),
  };
};

const ToolStatusListView = () => {
  const [toolStatusData, setToolStatusData] = useState<ToolStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/SUMS/toolstatus");
        if (!response.ok) {
          throw new Error("Failed to fetch tool status");
        }
        const data = await response.json();
        setToolStatusData(data);
      } catch (error) {
        console.error("Error fetching tool status data:", error);
        setError("Failed to load tool status. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <Card className="p-4">
      <CardHeader className="sticky top-0 z-10 bg-background">
        <CardTitle className="text-lg font-semibold">Tool Status</CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
          {toolStatusData.map((tool, index) => {
            const styles = getStateStyles(tool.Status);
            return (
              <Card
                key={index}
                className={styles.container}
                aria-label={`Tool: ${tool.ToolName}, Status: ${tool.Status}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{tool.ToolName}</p>
                </div>
                <div>
                  <p className={styles.status}>{tool.Status}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolStatusListView;
