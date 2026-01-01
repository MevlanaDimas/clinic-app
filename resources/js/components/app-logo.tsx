import logo from '@/../../public/1.png';

export default function AppLogo({ className }: { className?: string }) {
    return (
        <div className={`group relative flex w-full items-center justify-center overflow-hidden rounded-lg p-2 transition-all duration-300 ${className}`}>
            <img 
                src={logo} 
                alt="Clinic Logo" 
                className="relative h-10 w-auto object-contain transition-transform duration-300 will-change-transform group-hover:scale-105" 
            />
        </div>
    );
}
