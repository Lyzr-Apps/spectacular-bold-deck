import { NextRequest, NextResponse } from 'next/server'

const AGENT_ID = '6942a7744f5531c6f3c71038'
const LYZR_API_URL = 'https://api.lyzr.ai/v1/agents'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      )
    }

    // Call the Lyzr agent API
    const response = await fetch(`${LYZR_API_URL}/${AGENT_ID}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LYZR_API_KEY || ''}`,
      },
      body: JSON.stringify({
        user_message: message,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Agent API error:', error, 'Status:', response.status)
      return NextResponse.json(
        { error: 'Failed to get response from agent' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      message: data.response || data.message || data.data,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
