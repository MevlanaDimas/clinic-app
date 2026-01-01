import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof Link>;

export default function TextLink({
    className = '',
    children,
    ...props
}: LinkProps) {
    return (
        <Link
            className={cn(
                'text-black underline decoration-black underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current!',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
