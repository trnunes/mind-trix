export async function generateChildrenUsingGPT(
  parentTitle,
  existingTitles,
  apiKey
) {
  if (!apiKey) {
    console.error("OpenAI API key is missing. Please provide a valid API key.");
    return []; // Return an empty array if the API key is missing
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`, // Use the API key passed as a parameter
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that generates unique subtopics for a mind map. Ensure that your responses are in the form of a JSON array of strings.",
          },
          {
            role: "user",
            content: `Generate 3 unique subtopics related to "${parentTitle}". Do not include the following subtopics: ${existingTitles.join(
              ", "
            )}. Respond only with a JSON array of strings.`,
          },
        ],
        max_tokens: 100,
      }),
    });

    const data = await response.json();

    console.log("GPT API Response:", data); // Debugging

    const childrenTitles = JSON.parse(data.choices[0].message.content.trim());

    return childrenTitles;
  } catch (error) {
    console.error("Error generating children using GPT:", error);
    return []; // Return an empty array if there's an error
  }
}
