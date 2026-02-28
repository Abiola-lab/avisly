import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ canDebug: false });

        const { isAdmin } = await import('@/lib/admin');
        const canDebug = isAdmin(user.email);

        return NextResponse.json({ canDebug });
    } catch (err) {
        return NextResponse.json({ canDebug: false });
    }
}
