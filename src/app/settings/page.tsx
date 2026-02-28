import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("budget_max, city")
    .eq("id", user.id)
    .maybeSingle<{ budget_max: number | null; city: string | null }>();

  return (
    <SettingsClient
      initialBudget={profile?.budget_max ?? 20}
      initialCity={profile?.city ?? ""}
    />
  );
}
