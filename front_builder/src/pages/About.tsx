import {Suspense} from 'react';

export default function About() {

  return (
    <section className="bg-green-100 text-gray-700 p-8">
      <h1 className="text-2xl font-bold">About</h1>

      <p className="mt-4">A page all about this website.</p>

      <p>
        <span>We love</span>
        <Suspense fallback={<span>...</span>}>
          <span>&nbsp;{"Etienne"}</span>
        </Suspense>
      </p>
    </section>
  );
}
