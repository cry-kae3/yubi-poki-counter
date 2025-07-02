import Counter from '../components/Counter';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Counter />
      </div>
    </main>
  );
}