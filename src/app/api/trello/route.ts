import { NextResponse } from 'next/server';

const TRELLO_API_BASE = 'https://api.trello.com/1';

async function trelloRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${TRELLO_API_BASE}${endpoint}`;
  const authParams = `key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`;
  const separator = url.includes('?') ? '&' : '?';
  
  const response = await fetch(`${url}${separator}${authParams}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Trello API error: ${response.statusText}`);
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const { action, boardId, listId, meetingId, tasks, cardName, cardDesc } = await request.json();

    switch (action) {
      case 'create_board':
        // Create a new Trello board for the team
        const board = await trelloRequest('/boards', {
          method: 'POST',
          body: JSON.stringify({
            name: 'IRIS Meeting Tasks',
            defaultLists: true,
            desc: 'Tasks and action items from IRIS meetings'
          })
        });
        return NextResponse.json({ success: true, board });

      case 'create_meeting_list':
        // Create a new list for a specific meeting
        const list = await trelloRequest(`/lists`, {
          method: 'POST',
          body: JSON.stringify({
            name: `Meeting: ${meetingId}`,
            idBoard: boardId,
            pos: 'top'
          })
        });
        return NextResponse.json({ success: true, list });

      case 'create_task_card':
        // Create a new card for a task
        const card = await trelloRequest(`/cards`, {
          method: 'POST',
          body: JSON.stringify({
            name: cardName,
            desc: cardDesc,
            idList: listId,
            pos: 'bottom',
            labels: ['Meeting Task']
          })
        });
        return NextResponse.json({ success: true, card });

      case 'sync_meeting_tasks':
        // Sync all tasks from a meeting to Trello
        const taskCards = await Promise.all(
          tasks.map(async (task: any) => {
            const cardData = await trelloRequest(`/cards`, {
              method: 'POST',
              body: JSON.stringify({
                name: task.title,
                desc: `Assignee: ${task.assignee}\nDue Date: ${task.dueDate}\nPriority: ${task.priority}\n\n${task.description}`,
                idList: listId,
                pos: 'bottom',
                due: task.dueDate
              })
            });
            return cardData;
          })
        );
        return NextResponse.json({ success: true, cards: taskCards });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Trello API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform Trello action', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle Trello OAuth
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      const returnUrl = `${process.env.APP_URL}/dashboard?tab=tasks`;
      // Redirect to Trello authorization page with proper callback URL
      const authUrl = `https://trello.com/1/authorize?` + new URLSearchParams({
        expiration: 'never',
        name: 'IRIS Meeting Assistant',
        scope: 'read,write,account',
        response_type: 'token',
        key: process.env.TRELLO_API_KEY || '',
        return_url: returnUrl,
        callback_method: 'fragment'
      });
      
      return NextResponse.redirect(authUrl);
    }

    // Store the token securely (implement secure token storage)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Trello OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Trello' },
      { status: 500 }
    );
  }
} 