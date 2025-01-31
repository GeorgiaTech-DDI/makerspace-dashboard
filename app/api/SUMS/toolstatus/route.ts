import { NextRequest, NextResponse } from "next/server";

// Define excluded items
const EXCLUDE_KEYWORDS = ["[TEST]", "[Test]"];
const EXCLUDE_EXACT_NAMES = [
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
];

async function getToolStatus(token: string) {
  const [egKey, egId] = token.split(":");
  const toolStatusUrl = `https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/ToolStatus?EGKey=${egKey}&EGId=${egId}`;
  const response = await fetch(toolStatusUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch tool status");
  }
  return response.json();
}

function processToolStatus(tools: any[]) {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return tools
    .filter((tool) => {
      // Filter out tools based on keywords and exact names
      const hasExcludedKeyword = EXCLUDE_KEYWORDS.some((keyword) =>
        tool.ToolName.includes(keyword),
      );
      const isExcludedExactName = EXCLUDE_EXACT_NAMES.includes(tool.ToolName);

      // If tool is excluded by name/keyword, filter it out
      if (hasExcludedKeyword || isExcludedExactName) {
        return false;
      }

      // Filter out old marked down items
      if (tool.Status.startsWith("Marked down")) {
        const dateMatch = tool.Status.match(
          /(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2})/,
        );
        if (!dateMatch) return true;

        const markedDownDate = new Date(dateMatch[1].replace(/-/g, "/"));
        return markedDownDate > oneMonthAgo;
      }

      return true;
    })
    .map((tool) => ({
      ...tool,
      Status: tool.Status.startsWith("Marked down")
        ? `Marked down on ${tool.Status.match(/(\d{2}-\d{2}-\d{4})/)[1]}`
        : tool.Status,
    }));
}

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-sums-token");
    if (!token) {
      throw new Error("SUMS token is not provided");
    }

    const toolStatus = await getToolStatus(token);
    const processedStatus = processToolStatus(toolStatus);

    return NextResponse.json(processedStatus);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
