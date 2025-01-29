// app/api/3DPOS/printers/route.ts
import { NextRequest, NextResponse } from "next/server";

// Interface for printer data
interface Printer {
  id: string;
  name: string;
  type: string;
  state: string;
  temps: number[] | null;
  target_temps: number[] | null;
  percent: number;
}

// Function to get organization printers using session
export async function getOrganizationPrinters(session: string) {
  const printerUrl =
    "https://cloud.3dprinteros.com/apiglobal/get_organization_printers_list";
  const response = await fetch(printerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      session: session,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch printers");
  }

  // Filter out Virtual and notconnected printers
  const filteredPrinters = (data.message as Printer[]).filter(
    (printer) =>
      printer.state !== "Virtual" && printer.state !== "notconnected",
  );

  return filteredPrinters;
}

export const dynamic = "force-dynamic"; // Required because we're using headers
export const runtime = "edge"; // Optional: Choose edge or nodejs runtime

// GET request handler
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate and get session
    const session = request.headers.get("x-printer-session");
    if (!session) {
      throw new Error("Session is not provided");
    }

    // Step 2: Fetch and filter printers using session
    const printers = await getOrganizationPrinters(session);

    // Return filtered printers as JSON
    return NextResponse.json(printers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
