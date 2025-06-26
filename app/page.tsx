import Chat from '@/components/Chat';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1c2938] flex flex-col items-center pt-12 px-4">
      <img
        src="/logo.png"
        alt="LCW OneSearch Logo"
        className="w-[280px] h-auto object-contain mb-8"
      />

      <Chat />
    </div>
  );
}
