import { useState} from 'react';

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <section className="bg-gray-100 text-gray-700 p-8">
      <h1 className="text-2xl font-bold">Home</h1>
      <p className="mt-4">This is the home page.</p>

      <div className="flex items-center space-x-2">
        <button
          className="border rounded-lg px-2 border-gray-900"
          onClick={() => setCount(count - 1)}
        >
          -
        </button>

        <output className="p-10px">Count: {count}</output>

        <button
          className="border rounded-lg px-2 border-gray-900"
          onClick={() => setCount(count + 1)}
        >
          +
        </button>
      </div>
    </section>
  );
}
