import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { SubmitClient } from "./submit-client";

export default async function SubmitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <SubmitClient />;
}
