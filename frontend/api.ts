export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  subCategory?: string;
}

interface TrpcResponse<T> {
  result?: { data: T };
  error?: { message: string };
}

const queryProcedures = new Set(["getItems", "getItemById", "getSettings"]);

async function trpc<T>(procedure: string, input?: unknown): Promise<T> {
  const isQuery = queryProcedures.has(procedure);
  const url = new URL(`/trpc/${procedure}`, window.location.origin);

  if (isQuery && input !== undefined) {
    url.searchParams.set("input", JSON.stringify(input));
  }

  const response = await fetch(url, isQuery
    ? { method: "GET" }
    : {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: input === undefined ? undefined : JSON.stringify(input),
      });
  const payload = (await response.json()) as TrpcResponse<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message || "API request failed");
  }
  return payload.result?.data as T;
}

export async function fetchProducts(): Promise<Product[]> {
  const items = await trpc<Array<Omit<Product, "price"> & { price: string | number }>>("getItems");
  return items.map((item) => ({
    ...item,
    price: Number(item.price || 0),
  }));
}

export async function createOrder(input: {
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  totalAmount: string;
  items: Array<{ id: string; name: string; quantity: number; price: number }>;
}) {
  return trpc("createOrder", input);
}
