import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { command } = await request.json();

    if (!command) {
      return NextResponse.json(
        { error: 'Missing command parameter' },
        { status: 400 }
      );
    }

    // Process voice commands
    switch (command.toLowerCase()) {
      case 'read_aloud':
        return NextResponse.json({
          action: 'speak',
          text: 'Reading text aloud'
        });

      case 'dictation':
        return NextResponse.json({
          action: 'navigate',
          route: '/dictation-test'
        });

      case 'reading':
        return NextResponse.json({
          action: 'navigate',
          route: '/reading-test'
        });

      case 'contrast':
        return NextResponse.json({
          action: 'navigate',
          route: '/contrast-test'
        });

      case 'help':
        return NextResponse.json({
          action: 'speak',
          text: 'Available commands: reading test, dictation test, contrast test, and help'
        });

      default:
        return NextResponse.json({
          action: 'speak',
          text: 'Command not recognized'
        });
    }
  } catch (error) {
    console.error('Error processing voice command:', error);
    return NextResponse.json(
      { error: 'Failed to process voice command' },
      { status: 500 }
    );
  }
}