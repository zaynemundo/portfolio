import { redirect } from "next/navigation";
import { routes } from "@/app/dashboard/routes";

export default function DashboardPage() {
  redirect(routes.blog.list);
}
