export async function validateRemark(remark, hasAttachment) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":         "application/json",
        "x-api-key":            process.env.ANTHROPIC_API_KEY,
        "anthropic-version":    "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [
          {
            role:    "user",
            content: `You are validating a work task submission remark.

Remark: "${remark}"
Has attachment: ${hasAttachment ? "Yes" : "No"}

Rules:
- Remark must be meaningful and describe actual work done
- Remark must NOT be garbage, random text, or just "done/complete/ok"
- Remark should be at least 2 sentences or 20 words
- If no attachment and remark is vague, flag it

Respond ONLY with valid JSON like this:
{"valid": true, "reason": ""}
or
{"valid": false, "reason": "Your remark is too vague. Please describe what was actually done."}`,
          }
        ],
      }),
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || '{"valid": true, "reason": ""}'
    const clean = text.replace(/```json|```/g, "").trim()
    return JSON.parse(clean)

  } catch (err) {
    console.error("AI validation error:", err)
    return { valid: true, reason: "" }
  }
}