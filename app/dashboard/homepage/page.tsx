import { redirect } from "next/navigation";
import { routes } from "@/app/dashboard/routes";

export default function HomepagePage() {
  redirect(routes.homepage.hero);
}
