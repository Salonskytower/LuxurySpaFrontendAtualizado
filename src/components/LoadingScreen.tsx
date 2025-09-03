import Image from "next/image";
import Spinner from "./ui/spinner";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 flex flex-col items-center justify-center">
      <div className="mb-8">
        <Image
          src="/Logo LE PRIVE - white.png"
          alt="Le Privê Logo"
          width={400}
          height={160}
          className="h-32 md:h-40 w-auto"
          priority
        />
      </div>

      <Spinner size="lg" />
    </div>
  );
}
