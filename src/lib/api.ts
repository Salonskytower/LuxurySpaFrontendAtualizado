const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.leprive.fun";

export async function fetchFromStrapi(endpoint: string) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 }, // Revalida a cada 60 segundos (ISR)
    });

    if (!res.ok) throw new Error(`Erro ao buscar: ${endpoint}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function fetchFromStrapiList(endpoint: string) {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) throw new Error("Erro ao buscar " + endpoint);
  const json = await res.json();
  return json.data || [];
}
