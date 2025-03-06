import { NextResponse } from 'next/server';
import { WebClient } from '@slack/web-api';

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function POST(request: Request) {
  try {
    const { action, channelId, message, meetingId } = await request.json();

    switch (action) {
      case 'share_meeting':
        // Share meeting insights to a Slack channel
        const result = await slack.chat.postMessage({
          channel: channelId,
          text: message,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "📊 Meeting Insights",
                emoji: true
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: message
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `Shared from IRIS • Meeting ID: ${meetingId}`
                }
              ]
            }
          ]
        });

        return NextResponse.json({ success: true, result });

      case 'share_tasks':
        // Share tasks to a Slack channel
        const tasksResult = await slack.chat.postMessage({
          channel: channelId,
          text: "New tasks from meeting",
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "📋 Action Items",
                emoji: true
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: message
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `Shared from IRIS • Meeting ID: ${meetingId}`
                }
              ]
            }
          ]
        });

        return NextResponse.json({ success: true, result: tasksResult });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Slack API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform Slack action' },
      { status: 500 }
    );
  }
}

// Handle Slack OAuth
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'No code provided' },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const result = await slack.oauth.v2.access({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code
    });

    // Store tokens securely (you should implement secure token storage)
    // For now, we'll just return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Slack OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Slack' },
      { status: 500 }
    );
  }
} 