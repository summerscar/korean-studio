import { healthCheck } from "@/service/papago-health-check";

export async function GET() {
  try {
    const result = await healthCheck();
    return new Response(JSON.stringify({ status: "ok", result }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: "error", error: error?.message }), { status: 500 });
  }
}
