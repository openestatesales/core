export type OesClientOptions = {
  baseUrl: string;
  apiKey?: string;
};

export function createOesClient(options: OesClientOptions) {
  function url(path: string): string {
    return new URL(path, options.baseUrl).toString();
  }

  async function request<T>(
    path: string,
    init: RequestInit & { json?: unknown } = {},
  ): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    if (init.json !== undefined) headers.set("content-type", "application/json");
    if (options.apiKey) headers.set("authorization", `Bearer ${options.apiKey}`);

    const res = await fetch(url(path), {
      ...init,
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    });

    const text = await res.text();
    const data = text ? (JSON.parse(text) as unknown) : null;
    if (!res.ok) {
      throw new Error(
        `OES API error ${res.status} ${res.statusText}: ${text || "<empty>"}`,
      );
    }
    return data as T;
  }

  return {
    baseUrl: options.baseUrl,
    sales: {
      create(input: {
        title: string;
        city: string;
        state: string;
        start_date: string;
        end_date: string;
        description?: string | null;
      }) {
        return request<{ ok: true; sale: unknown }>("/v1/sales", {
          method: "POST",
          json: input,
        });
      },
    },
  };
}

