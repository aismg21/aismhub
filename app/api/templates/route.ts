import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // STEP 1 — List files inside templates/
    const { data: files, error } = await supabase.storage
      .from("aismhub")
      .list("templates/", {
        limit: 200,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // STEP 2 — PUBLIC URL generate (no signing)
    const publicUrlBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/aismhub/templates`;

    const response = files.map((file) => ({
      name: file.name,
      url: `${publicUrlBase}/${file.name}`, // behaves like /public/templates/...
    }));

    return NextResponse.json({ templates: response });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
