import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("mode");
  const body = await request.json().catch(() => ({}));

  const response = await fetch(`${apiBaseUrl}/chatkit/session${mode === "refresh" ? "/refresh" : ""}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({ error: "Unknown error" }));
  return NextResponse.json(data, { status: response.status });
}
