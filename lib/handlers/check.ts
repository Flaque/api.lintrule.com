// import openai
import { createChatCompletion } from "../openai.ts";

export interface RequestBody {
  document: string;
  rule: string;
}

export interface ResponseBody {
  pass: boolean;
}

type ResponseType =
  | {
      pass: true;
    }
  | {
      pass: false;
      message: string;
    };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RETRIES = 5;
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    if (retries > 0) {
      // exponential backoff
      // with random jitter
      const jitter = Math.random() * 500;
      await sleep(2 ** (3 - retries) * 300 + jitter);

      return await withRetry(fn, retries - 1);
    } else {
      throw e;
    }
  }
};

export const handleCheck = async (req: Request): Promise<Response> => {
  const { document, rule } = (await req.json()) as RequestBody;

  const msgs = [
    {
      role: "system",
      content: `You are a linter. You are given first a rule and then document. You must decide whether the document passes the rule.`,
    },
    {
      role: "user",
      content: `<|RULE|>\n\n\n${rule}\n\n\n<|ENDRULE|>`,
    },
    {
      role: "user",
      content: `<|DOCUMENT|>\n\n\n${document}\n\n\n<|ENDDOCUMENT|>`,
    },
    {
      role: "system",
      content: `Respond in json this type.
type Response = {
pass: true;
} | {
pass: false;
message: string;
}
      `,
    },
  ];

  const completion = await withRetry(() =>
    createChatCompletion({
      model: "gpt-4",
      messages: msgs,
    })
  );

  const result = completion.choices[0].message?.content;

  if (!result) throw new Error("No result from OpenAI");

  const r = JSON.parse(result) as ResponseType;

  return new Response(JSON.stringify(r), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
};
