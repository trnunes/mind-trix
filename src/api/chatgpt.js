export async function generateChildrenUsingGPT(
  parentTitle,
  existingTitles,
  apiKey
) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`, // Use the passed API key here
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
            content: `Generate 5 unique subtopics related to "${parentTitle}". Exclude the following subtopics: ${existingTitles.join(
              ", "
            )}. Respond only with a JSON array of strings.`,
          },
        ],
        max_tokens: 150,
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

export async function generateMindMapFromDescription(description, apiKey) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`, // Use the passed API key here
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that generates mind map structures. Respond with a JSON object containing a title and a list of children, where each child has a title and potentially its own list of children.",
          },
          {
            role: "user",
            content: `Create a mind map structure based on this description: "${description}". The response should be in JSON format with a structure like: { "title": "Main Topic", "children": [{ "title": "Subtopic 1", "children": [] }, { "title": "Subtopic 2", "children": [] }] }.`,
          },
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();

    console.log("GPT API Response:", data); // Debugging

    const mindMapStructure = JSON.parse(data.choices[0].message.content.trim());

    return mindMapStructure;
  } catch (error) {
    console.error("Error generating mind map from description:", error);
    return { title: "Error", children: [] }; // Return a basic structure if there's an error
  }
}
