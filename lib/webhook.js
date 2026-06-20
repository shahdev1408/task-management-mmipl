/**
 * Dispatches task status changes to external automation platforms.
 * Configure WEBHOOK_URL in your .env file.
 */
export async function dispatchTaskEvent(eventType, payload) {
  const webhookUrl = process.env.AUTOMATION_WEBHOOK_URL
  
  if (!webhookUrl) return

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-system-source': 'TaskFlow-Engine'
      },
      body: JSON.stringify({
        event: eventType, // e.g., 'SUBTASK_DELAYED', 'SUBTASK_COMPLETED'
        timestamp: new Date().toISOString(),
        data: payload
      })
    })
  } catch (error) {
    console.error(`Failed to dispatch ${eventType} webhook:`, error)
  }
}