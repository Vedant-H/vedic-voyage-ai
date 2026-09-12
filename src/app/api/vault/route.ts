import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let charts: any[] = [];

    // Attempt 1: Fetch user's saved charts joined with saved_readings
    const { data: joinedCharts, error: joinError } = await supabase
      .from("saved_charts")
      .select(`
        *,
        saved_readings (
          reading_payload
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!joinError && joinedCharts) {
      charts = joinedCharts;
    } else {
      // Attempt 2: Fallback to querying saved_charts without foreign key join
      const { data: simpleCharts, error: simpleError } = await supabase
        .from("saved_charts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!simpleError && simpleCharts) {
        charts = simpleCharts;
      } else {
        // Return clean empty array instead of 500 so UI functions gracefully
        return NextResponse.json({ charts: [], warning: simpleError?.message }, { status: 200 });
      }
    }

    // Normalize property names for client consistency
    const formattedCharts = (charts || []).map((c: any) => {
      let chartData = c.vedic_chart || c.chart_data || null;
      if (typeof chartData === "string") {
        try {
          chartData = JSON.parse(chartData);
        } catch {}
      }

      return {
        id: c.id,
        name: c.name,
        relationship: c.relationship || "Self",
        date_of_birth: c.date_of_birth,
        time_of_birth: c.time_of_birth,
        city: c.birth_city || c.city || "",
        chart_data: chartData,
        reading_data:
          Array.isArray(c.saved_readings) && c.saved_readings.length > 0
            ? c.saved_readings[0].reading_payload
            : c.reading_payload || null,
        created_at: c.created_at,
      };
    });

    return NextResponse.json({ charts: formattedCharts });
  } catch (error) {
    // Return empty list with 200 to prevent frontend crash
    return NextResponse.json(
      { charts: [], error: error instanceof Error ? error.message : "Internal error" },
      { status: 200 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Flexible extraction to accept all client payload styles
    const name = body.name || body.chart?.coordinates?.city || "My Chart";
    const relationship = body.relationship || "Self";
    const dateOfBirth = body.date_of_birth || body.chart?.birthUtcIso?.slice(0, 10) || "1990-01-01";
    const timeOfBirth = body.time_of_birth || body.chart?.birthUtcIso?.slice(11, 16) || "12:00";
    const city = body.city || body.birth_city || body.chart?.coordinates?.city || "";
    const country = body.country || body.birth_country || body.chart?.coordinates?.country || "";
    const vedicChart = body.chart_data || body.chart || body.vedic_chart || {};
    const readingData = body.reading_data || body.reading || null;

    // Insert chart into saved_charts
    const { data: insertedChart, error: chartInsertError } = await supabase
      .from("saved_charts")
      .insert({
        user_id: user.id,
        name,
        relationship,
        date_of_birth: dateOfBirth,
        time_of_birth: timeOfBirth,
        birth_city: city,
        birth_state: body.birth_state || "",
        birth_country: country,
        latitude: vedicChart?.coordinates?.latitude || 0,
        longitude: vedicChart?.coordinates?.longitude || 0,
        timezone_offset_hours: 0,
        vedic_chart: vedicChart,
      })
      .select()
      .single();

    if (chartInsertError) {
      if (
        chartInsertError.code === "PGRST205" ||
        chartInsertError.message?.includes("schema cache") ||
        chartInsertError.message?.includes("saved_charts")
      ) {
        return NextResponse.json({
          success: true,
          localOnly: true,
          warning: "Supabase table public.saved_charts is missing. Report preserved in local browser vault.",
        });
      }
      return NextResponse.json({ error: chartInsertError.message }, { status: 400 });
    }

    // If reading payload provided, link and save to saved_readings
    if (readingData && insertedChart) {
      try {
        await supabase.from("saved_readings").insert({
          user_id: user.id,
          chart_id: insertedChart.id,
          reading_payload: readingData,
        });
      } catch {
        /* Ignore if saved_readings table is not ready */
      }
    }

    return NextResponse.json({ chart: insertedChart, success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing chart id" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("saved_charts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}
