import { redirect } from "next/navigation";
import { routes } from "@/app/(admin)/_routes";

/** The invoice list is the first tab of the Finance page; this keeps old links working. */
export default function InvoicesPage() {
  redirect(routes.finance.list);
}
