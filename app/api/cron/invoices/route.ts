import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { makeDueRepeats } from "@/app/lib/invoice-repeat";

/* Run daily by Vercel Cron (vercel.json): makes the month's draft of every
 * monthly invoice that's due. Vercel sends CRON_SECRET as a bearer token;
 * without it set, the route refuses everyone. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const made = await makeDueRepeats();
  if (made > 0) {
    revalidateTag(CACHE_TAGS.invoices, "max");
    revalidateTag(CACHE_TAGS.freelance, "max");
  }
  return Response.json({ made });
}
