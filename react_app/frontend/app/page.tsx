export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-xl mb-4">論文検索</h1>
      <form action="/search" method="get">
        <input
          type="text"
          name="q"
          placeholder="キーワードを入力"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-3 py-2">
          検索
        </button>
      </form>
    </main>
  );
}
