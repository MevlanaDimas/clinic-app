import { Link } from '@inertiajs/react';
import logo from '@/../../public/2.svg';
import clinicImage from '@/../../public/clinical-reception-with-waiting-room-facility-lobby-registration-counter-used-patients-with-medical-appointments-empty-reception-desk-health-center-checkup-visits.jpg';
import { type PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div
            className="flex min-h-svh w-full items-center justify-center bg-cover bg-center p-6"
            style={{ backgroundImage: `url(${clinicImage})` }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-2xl shadow-gray-200/60 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80 dark:shadow-black/40"
            >
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            className="flex flex-col items-center gap-2 font-medium"
                            href="/"
                        >
                            <div className="mb-1 flex w-28 items-center justify-center rounded-md">
                                <img src={logo} alt="Logo" />
                            </div> 
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">{title}</h1>
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
