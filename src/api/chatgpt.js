const OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.REACT_APP_OPENAI_MODEL || "gpt-5-mini";
const ORGANIZATION_ID = process.env.REACT_APP_OPENAI_ORG_ID;
const PROJECT_ID = process.env.REACT_APP_OPENAI_PROJECT_ID;

function buildHeaders(apiKey) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  if (ORGANIZATION_ID) {
    headers["OpenAI-Organization"] = ORGANIZATION_ID;
  }

  if (PROJECT_ID) {
    headers["OpenAI-Project"] = PROJECT_ID;
  }

  return headers;
}

function extractTextPayload(data) {
  const message = data?.output?.find((item) => item.type === "message");
  if (!message) {
    return "";
  }
  const contentPart = message.content?.find((part) => part.type === "output_text");
  return contentPart?.text ?? "";
}

async function callResponsesApi({ apiKey, input, temperature = 0.6, maxOutputTokens = 600, responseFormat }) {
  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: buildHeaders(apiKey),
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input,
      temperature,
      max_output_tokens: maxOutputTokens,
      ...(responseFormat ? { response_format: responseFormat } : {}),
    }),
  });

  if (!response.ok) {
    let errorPayload = null;
    try {
      errorPayload = await response.json();
    } catch (error) {
      // Ignore JSON parsing errors for error payloads
    }
    const retryHeader = response.headers.get("retry-after");
    const retryAfter = retryHeader ? parseInt(retryHeader, 10) : undefined;
    const error = new Error(
      errorPayload?.error?.message || `OpenAI request failed with status ${response.status}`
    );
    error.status = response.status;
    error.type = errorPayload?.error?.type;
    error.retryAfter = Number.isNaN(retryAfter) ? undefined : retryAfter;
    error.payload = errorPayload;
    throw error;
  }

  const data = await response.json();
  const text = extractTextPayload(data);
  return { data, text, usage: data.usage };
}

export async function generateChildrenUsingGPT(
  parentContext,
  existingTitles,
  apiKey,
  desiredCount = 5
) {
  const existingList = existingTitles?.length
    ? existingTitles.join(", ")
    : "(none)";

  const { data, text, usage } = await callResponsesApi({
    apiKey,
    input: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text:
              "You generate concise mind map branch titles. Always respond with valid JSON following the requested schema.",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Provide ${desiredCount} unique child topics for the mind map path "${parentContext}". Avoid these titles: ${existingList}. Return a JSON object with a \"children\" array of title strings and nothing else.`,
          },
        ],
      },
    ],
    responseFormat: { type: "json_object" },
    maxOutputTokens: 400,
  });

  let parsed;
  try {
    parsed = JSON.parse(text || "{}");
  } catch (error) {
    throw new Error("OpenAI returned an unexpected response format.");
  }

  if (!Array.isArray(parsed.children)) {
    throw new Error("OpenAI response did not include a children array.");
  }

  return {
    items: parsed.children,
    usage,
    raw: data,
  };
}

export async function generateMindMapFromDescription(description, apiKey, options = {}) {
  const branchCount = options.desiredCount ?? 5;
  const depth = options.desiredDepth ?? 2;

  const { data, text, usage } = await callResponsesApi({
    apiKey,
    input: [
      {
        role: "system",
        content: [
          {
            type: "text",
            text:
              "You produce structured JSON mind maps with nested children arrays. Titles must be short noun phrases.",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Create a mind map for: "${description}". Target ${branchCount} immediate children and depth ${depth}. Return a JSON object {\n  \"title\": string,\n  \"children\": [{\n    \"title\": string,\n    \"children\": [...]\n  }]\n}.`,
          },
        ],
      },
    ],
    responseFormat: { type: "json_object" },
    maxOutputTokens: 600,
  });

  let parsed;
  try {
    parsed = JSON.parse(text || "{}");
  } catch (error) {
    throw new Error("OpenAI returned an unexpected response format.");
  }

  return {
    map: parsed,
    usage,
    raw: data,
  };
}
