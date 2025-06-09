interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q ?? '';
  const res = await fetch(
    `https://example.com/api/search?q=${encodeURIComponent(query)}`
  );
  const results = await res.json();

  return (
    <main className="p-6">
      <h1 className="text-xl mb-4">「{query}」の検索結果</h1>
      {results.items.map((item: any) => (
        <div key={item.id} className="mb-4 border-b pb-2">
          <h2 className="text-lg">{item.title}</h2>
          <p>{item.summary}</p>
        </div>
      ))}
    </main>
  );
}
