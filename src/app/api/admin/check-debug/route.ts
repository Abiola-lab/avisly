import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ canDebug: false });

        const debugEnabled = process.env.DEBUG_TOOLS_ENABLED === 'true';
        const adminEmail = process.env.ADMIN_EMAIL;

        const canDebug = debugEnabled && user.email === adminEmail;

        return NextResponse.json({ canDebug });
    } catch (err) {
        return NextResponse.json({ canDebug: false });
    }
}
