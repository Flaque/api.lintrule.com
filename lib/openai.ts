// read $OPENAI_API_KEY from environment variables
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

if (!OPENAI_API_KEY) {
  throw new Error("$OPENAI_API_KEY not found in environment variables.");
}

type ChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  choices: {
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export async function createChatCompletion(args: {
  messages: Array<{
    role: string;
    content: string;
  }>;
  model: "gpt-3.5-turbo" | "gpt-4";
}): Promise<ChatCompletionResponse> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: args.model,
        messages: args.messages,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error("OpenAI API error: " + text);
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
