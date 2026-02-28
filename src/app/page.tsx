import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { HomeClient } from "./home-client";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("city, home_latitude, home_longitude")
      .eq("id", user.id)
      .maybeSingle<{
        city: string | null;
        home_latitude: number | null;
        home_longitude: number | null;
      }>();

    if (!profile?.city || profile.home_latitude == null || profile.home_longitude == null) {
      redirect("/onboarding");
    }
  }

  return <HomeClient />;
}
