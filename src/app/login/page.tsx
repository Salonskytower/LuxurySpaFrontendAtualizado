'use client';

import { useSearchParams } from 'next/navigation';
// Ajuste o caminho para onde está seu AuthModal real:
import AuthModal from '@/components/AuthModal'; // ajuste conforme a localização real do seu arquivo
import { useEffect, useState } from 'react';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const confirmed = searchParams.get('confirmed');
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        if (confirmed === 'true') {
            setShowConfirmation(true);
        }
    }, [confirmed]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {showConfirmation ? (
                <div className="flex flex-col items-center gap-6 bg-white shadow-md p-8 rounded-xl border border-green-400">
                    <span className="text-green-700 text-xl font-semibold">
                        Your email has been successfully confirmed!
                    </span>
                    <span className="text-gray-600">
                        You can now log in normally.
                    </span>
                    {/* NÃO coloque botão, NÃO coloque link! */}
                </div>
            ) : (
                // Aqui aparece o AuthModal normalmente
                <AuthModal isOpen={true} onClose={() => { }} language="en" />
            )}
        </div>
    );
}
