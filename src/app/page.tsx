import dynamic from 'next/dynamic';

const TicTacToe = dynamic(() => import('./components/TicTacToe'), {
  ssr: false
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <TicTacToe />
    </main>
  );
}
