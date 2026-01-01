import { useEffect, useState } from 'react';
import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { CircleAlert, LoaderCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showDialog, setShowDialog] = useState(true);
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (!showDialog) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setShowDialog(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [showDialog]);

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Form
                {...AuthenticatedSessionController.store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <div className="space-y-4">
                        <div className="grid gap-6 ">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className="placeholder:text-muted-foreground/80"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="placeholder:text-muted-foreground/80"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember" className="text-sm text-black dark:text-white">
                                    Remember me
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full cursor-pointer"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}
                                Log in
                            </Button>
                        </div>
                    </div>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            {showDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
                    <div className="w-full max-w-md rounded-lg bg-white/75 p-6 shadow-lg dark:bg-zinc-900/75">
                        <div className='flex flex-row justify-between items-center'>
                            <h3 className="text-lg font-semibold text-black dark:text-white">Notice</h3>
                            <CircleAlert className='size-8 text-yellow-500' />
                        </div>
                        <div className='flex flex-col mt-2 gap-1'>
                            <p className='text-sm font-normal'>You can log in using:</p>
                            <div className='bg-yellow-500/75 w-43 mt-2 mx-4 px-2 shadow-lg py-0.5 rounded-md'>
                                <p className='text-sm font-bold'>admin_2@example.com</p>
                            </div>
                            <div className='bg-yellow-500/75 w-43 mt-2 mx-4 px-2 py-0.5 shadow-lg rounded-md'>
                                <p className='text-sm font-bold'>admin123</p>
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            This dialog will close automatically in {timeLeft} seconds.
                        </p>
                        <div className="mt-4 flex justify-end">
                            <Button type="button" onClick={() => setShowDialog(false)} className='cursor-pointer'>
                                Dismiss
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}
