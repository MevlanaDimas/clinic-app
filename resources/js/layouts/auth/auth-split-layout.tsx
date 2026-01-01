import { type SharedData } from '@/types';
import logo from '@/../../public/2.svg';
import clinicImage from '@/../../public/clinical-reception-with-waiting-room-facility-lobby-registration-counter-used-patients-with-medical-appointments-empty-reception-desk-health-center-checkup-visits.jpg';
import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div
                className="relative hidden h-full flex-col bg-cover bg-center p-10 text-black lg:flex dark:border-r"
                style={{
                    backgroundImage: `url(${clinicImage})`,
                }}
            >
                <img src={logo} alt="Logo" className="mr-2 size-8" />
                {name}
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">
                                &ldquo;{quote.message}&rdquo;
                            </p>
                            <footer className="text-sm">
                                {quote.author}
                            </footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="flex h-full w-full items-center justify-center bg-[#FCF9EA]/80 lg:p-8"
            >
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <img src={logo} alt="Logo" className="h-30 sm:h-32" />
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium text-black">{title}</h1>
                        <p className="text-sm text-balance text-black">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
