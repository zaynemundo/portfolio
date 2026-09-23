import { redirect } from "next/navigation";
import { routes } from "@/app/(admin)/_routes";

export default function HomepagePage() {
  redirect(routes.homepage.hero);
}
