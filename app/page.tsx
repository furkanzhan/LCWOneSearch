import Image from 'next/image';
import Chat from '@/components/Chat';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1c2938] flex flex-col items-center pt-12 px-4">
      <Image
        src="/logo.png"
        alt="LCW OneSearch Logo"
        width={400}
        height={160}
        className="object-contain mb-8"
        priority
      />

      <Chat />
    </div>
  );
}
