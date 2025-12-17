import { NextRequest, NextResponse } from 'next/server'

const AGENT_ID = '6942a7744f5531c6f3c71038'
const AGENT_ENDPOINT = 'https://api.anthropic.com/agents'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      )
    }

    // Call the agent API
    const response = await fetch(`${AGENT_ENDPOINT}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      },
      body: JSON.stringify({
        agent_id: AGENT_ID,
        message: message,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Agent API error:', error)
      return NextResponse.json(
        { error: 'Failed to get response from agent' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
