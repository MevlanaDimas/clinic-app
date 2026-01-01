import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SharedData } from '@/types';

export default function TwoFactorAuthentication() {
    const { auth } = usePage<SharedData>().props;
    const [enabling, setEnabling] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [disabling, setDisabling] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [confirmationCode, setConfirmationCode] = useState('');
    const [errors, setErrors] = useState<{ code?: string }>({});

    const twoFactorEnabled = auth.user.two_factor_enabled;
    const confirmingTwoFactor = auth.user.two_factor_confirmed;

    const enableTwoFactorAuthentication = () => {
        setEnabling(true);
        router.post(
            '/user/two-factor-authentication',
            {},
            {
                preserveScroll: true,
                onSuccess: () => Promise.all([showQrCode(), showRecoveryCodes()]),
                onFinish: () => {
                    setEnabling(false);
                    setConfirming(true);
                },
            },
        );
    };

    const confirmTwoFactorAuthentication = () => {
        router.post(
            '/user/confirmed-two-factor-authentication',
            {
                code: confirmationCode,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirming(false);
                    setQrCode(null);
                },
                onError: (err) => {
                    setErrors(err);
                },
            },
        );
    };

    const regenerateRecoveryCodes = () => {
        axios.post('/user/two-factor-recovery-codes').then(() => showRecoveryCodes());
    };

    const showQrCode = () => {
        return axios.get('/user/two-factor-qr-code').then((response) => {
            setQrCode(response.data.svg);
        });
    };

    const showRecoveryCodes = () => {
        return axios.get('/user/two-factor-recovery-codes').then((response) => {
            setRecoveryCodes(response.data);
        });
    };

    const disableTwoFactorAuthentication = () => {
        setDisabling(true);
        router.delete('/user/two-factor-authentication', {
            preserveScroll: true,
            onSuccess: () => {
                setDisabling(false);
                setConfirming(false);
            },
        });
    };

    return (
        <div className="space-y-6">
            <HeadingSmall
                title="Two-factor authentication"
                description="Add an additional layer of security to your account by enabling two-factor authentication."
            />

            <h3 className="text-lg font-medium text-foreground">
                {twoFactorEnabled && !confirmingTwoFactor
                    ? 'You have enabled two-factor authentication.'
                    : twoFactorEnabled && confirmingTwoFactor
                      ? 'You have not finished enabling two-factor authentication.'
                      : 'You have not enabled two-factor authentication.'}
            </h3>

            <div className="max-w-xl text-sm text-muted-foreground">
                <p>
                    When two factor authentication is enabled, you will be prompted for a secure, random token
                    during authentication. You may retrieve this token from your phone's Google Authenticator
                    application.
                </p>
            </div>

            {twoFactorEnabled && (
                <>
                    {qrCode && (
                        <>
                            <div className="max-w-xl text-sm text-muted-foreground">
                                <p className="font-semibold">
                                    To finish enabling two factor authentication, scan the following QR code using
                                    your phone's authenticator application or enter the setup key and provide the
                                    generated OTP code.
                                </p>
                            </div>

                            <div
                                className="mt-4 inline-block bg-white p-2"
                                dangerouslySetInnerHTML={{ __html: qrCode }}
                            />

                            <div className="mt-4 grid max-w-xl gap-2">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    name="code"
                                    className="block w-1/2"
                                    value={confirmationCode}
                                    onChange={(e) => setConfirmationCode(e.target.value)}
                                    autoFocus
                                    autoComplete="one-time-code"
                                    onKeyDown={(e) => e.key === 'Enter' && confirmTwoFactorAuthentication()}
                                />
                                <InputError message={errors.code} className="mt-2" />
                            </div>
                        </>
                    )}

                    {recoveryCodes.length > 0 && !confirmingTwoFactor && (
                        <>
                            <div className="max-w-xl text-sm text-muted-foreground">
                                <p className="font-semibold">
                                    Store these recovery codes in a secure password manager. They can be used to
                                    recover access to your account if your two factor authentication device is lost.
                                </p>
                            </div>

                            <div className="mt-4 grid max-w-xl gap-1 rounded-lg bg-neutral-100 p-4 font-mono text-sm dark:bg-neutral-900">
                                {recoveryCodes.map((code) => (
                                    <div key={code}>{code}</div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            <div className="mt-5">
                {!twoFactorEnabled && (
                    <Button onClick={enableTwoFactorAuthentication} disabled={enabling} className='cursor-pointer'>
                        Enable
                    </Button>
                )}

                {twoFactorEnabled && (
                    <div className="flex items-center gap-x-4">
                        {confirmingTwoFactor && (
                            <Button onClick={confirmTwoFactorAuthentication} disabled={enabling} className='cursor-pointer'>
                                Confirm
                            </Button>
                        )}
                        {recoveryCodes.length > 0 && !confirmingTwoFactor && (
                            <Button onClick={regenerateRecoveryCodes} className="mr-3 cursor-pointer">
                                Regenerate Recovery Codes
                            </Button>
                        )}
                        {recoveryCodes.length === 0 && !confirmingTwoFactor && (
                            <Button onClick={showRecoveryCodes} className="mr-3 cursor-pointer">
                                Show Recovery Codes
                            </Button>
                        )}
                        {confirmingTwoFactor && (
                            <Button
                                variant="secondary"
                                onClick={disableTwoFactorAuthentication}
                                disabled={disabling}
                                className='cursor-pointer'
                            >
                                Cancel
                            </Button>
                        )}
                        {!confirmingTwoFactor && (
                            <Button
                                variant="destructive"
                                onClick={disableTwoFactorAuthentication}
                                disabled={disabling}
                                className='cursor-pointer'
                            >
                                Disable
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
