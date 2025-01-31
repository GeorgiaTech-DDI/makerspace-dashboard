import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";

// define the interface (or type) for the tool status data
// this helps ensure that each tool object has a 'Status' and 'ToolName' field
interface ToolStatus {
  Status: string;
  ToolName: string;
}

const ToolStatusListView = () => {
  // useState is a React hook that allows you to add state to functional components
  // `toolStatusData` stores the tool status information, initialized as an empty array
  const [toolStatusData, setToolStatusData] = useState<ToolStatus[]>([]);

  // state to manage loading and error
  // these will help show loading indicators or error messages to the user
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // dynamic adjustments based on light or dark mode.
  const { theme } = useTheme();

  // useEffect is a hook that lets you run side effects in your component
  // in this case, it fetches data when the component mounts (first renders)
  useEffect(() => {
    const fetchData = async () => {
      // set loading to true when the data fetch starts
      setLoading(true);
      setError(null); // reset any previous error
      try {
        const response = await fetch("/api/SUMS/toolstatus");
        if (!response.ok) {
          throw new Error("Failed to fetch tool status");
        }
        const data = await response.json();
        // Define lists for filtering
        const excludeKeywords = ["[TEST]", "[Test]"];
        const excludeExactNames = [
          "EcoMake Login",
          "Hub Login",
          "Metal Room Login",
          "Wood Room Login",
          "Shift Time Clock",
          "SUMS Environment",
          "Request Replacement PI",
          "Test Inventory Tool",
          "CAE Helpdesk",
          "SUMS Environment",
          // Add any other exact names to exclude
        ];

        // Filter out unwanted entries
        const filteredData = data.filter((tool) => {
          const hasExcludedKeyword = excludeKeywords.some((keyword) =>
            tool.ToolName.includes(keyword),
          );
          const isExcludedExactName = excludeExactNames.includes(tool.ToolName);
          return !hasExcludedKeyword && !isExcludedExactName;
        });

        setToolStatusData(filteredData);
      } catch (error) {
        console.error("Error fetching tool status data:", error);
        setError("Failed to load tool status. Please try again later.");
      } finally {
        setLoading(false); // set loading to false when the data fetch completes
      }
    };
    fetchData();
  }, []); // the empty array ensures this effect runs only once when the component loads

  // if the data is still loading, show a "Loading..." message
  if (loading) {
    return <p>Loading...</p>;
  }

  // if there was an error during fetching, display it in red text
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // return the JSX (HTML-like syntax) for rendering the component
  // this part creates the UI for displaying the tool status data
  return (
    <div className="p-4 border rounded-lg shadow">
      {/* the header for the tool status section */}
      <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-background z-10">
        Tool Status
      </h3>

      {/* a scrollable container for the tool list */}
      <div className="max-h-96 overflow-y-auto">
        {/* a grid container to display each tool in a separate card */}
        <div className="grid grid-cols-1 gap-4">
          {/* loop over the toolStatusData array and create a "card" for each tool */}
          {toolStatusData.map((tool, index) => (
            <Card
            key={index}
            className="border border-border shadow-lg rounded-xl" // Added border and shadow
            aria-label={`Tool: ${tool.ToolName}, Status: ${tool.Status}`}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{tool.ToolName}</p>
                <p
                  className={`text-sm ${
                    tool.Status.includes("Available") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tool.Status}
                </p>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// export the component so it can be used in other parts of the application
export default ToolStatusListView;
