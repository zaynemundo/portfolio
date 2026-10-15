"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { catchUpRepeats } from "@/app/actions/invoices";

/** Once per visit: makes any monthly drafts that are due, and refreshes the list if it made some. */
export function RepeatCatchUp() {
  const router = useRouter();
  useEffect(() => {
    catchUpRepeats()
      .then((made) => {
        if (made > 0) router.refresh();
      })
      .catch(() => {});
  }, [router]);
  return null;
}
