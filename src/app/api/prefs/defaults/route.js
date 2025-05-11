import { NextResponse } from 'next/server';

// This is just an example - replace with your actual data storage solution
let defaultPrefs = {
    theme: 'light',
    language: 'en',
    notifications: true,
    // ... other default preferences
};

export async function GET() {
    return NextResponse.json(defaultPrefs);
}

export async function POST(request) {
    try {
        const data = await request.json();
        defaultPrefs = { ...defaultPrefs, ...data };
        return NextResponse.json({ success: true, data: defaultPrefs });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update preferences' },
            { status: 500 }
        );
    }
}