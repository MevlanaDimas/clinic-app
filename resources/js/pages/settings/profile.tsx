import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { deletePhotoProfile, edit, update } from '@/routes/profile';
import imageCompression from 'browser-image-compression';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile() {
    const { auth } = usePage<SharedData>().props;
    const options = {
        maxSizeMb: 1,
        useWebWorker: true
    }

    const { data, setData, post, patch, processing, errors, recentlySuccessful } = useForm({
        _method: 'PATCH',
        name: auth.user.name,
        email: auth.user.email,
        photo: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(update().url);
    };

    const getPhotoName = (photo_url: string): string => {
        const lastSlashIndex = photo_url.lastIndexOf('/');

        let fileNameWithParams = photo_url.substring(lastSlashIndex + 1);

        const paramIndex = fileNameWithParams.indexOf('?');
        const hashIndex = fileNameWithParams.indexOf('#');

        let endIndex = fileNameWithParams.length;

        if (paramIndex !== -1 && paramIndex < endIndex) {
            endIndex = paramIndex;
        }
        if (hashIndex !== -1 && hashIndex < endIndex) {
            endIndex = hashIndex;
        }

        const fileName = fileNameWithParams.substring(0, endIndex);

        return fileName;
    }

    const defaultPhoto = (photo_name: string) => {
        if (photo_name === 'user.png') {
            return '';
        } else {
            return photo_name;
        }
    }

    const compressAndSetFile = async (file: File) => {
        
        let finaleFile = file;
        
        if (file.type.startsWith('image/')) {
            finaleFile = await imageCompression(file, options);
        }

        setData('photo', finaleFile);
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const files = e.target.files[0];
            await compressAndSetFile(files);
        }
    }

    const handlePhotoProfileDelete = () => {
        const commonCallbacks = {
            onSuccess: () => {
                toast.success('Photo profile deleted successfully');
            },
            onError: () => {
                toast.error('Error deleting photo profile');
            }
        };
        
        patch(deletePhotoProfile().url, commonCallbacks);
    }

    console.log(data);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <form onSubmit={submit} className="space-y-6">
                                <div className='grid gap-2'>
                                    <Label htmlFor='photo'>Photo Profile</Label>
                                    
                                    {defaultPhoto(getPhotoName(auth.user.photo_url)) ? (
                                        <div className='border rounded-md mt-1.5 p-5'>
                                        <div className='flex flex-col justify-center items-center gap-2'>
                                            <img src={auth.user.photo_url} alt="photo profile" className='w-60' />
                                            <span className='text-xs'>{defaultPhoto(getPhotoName(auth.user.photo_url))}</span>
                                        </div>

                                        <div className='flex flex-row justify-center items-center mt-3 gap-5'>
                                            <Input
                                                type='file'
                                                id='photo'
                                                className='flex justify-center w-50 cursor-pointer'
                                                onChange={handleFileUpload}
                                                name='photo'
                                            />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button
                                                        type='button'
                                                        className='bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer h-[34px] w-20'
                                                        disabled={processing}
                                                    >
                                                        Delete
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action will delete yout profile picture.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handlePhotoProfileDelete} className='bg-red-600 hover:bg-red-700 cursor-pointer text-white'>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>

                                        <InputError
                                            className='mt-2'
                                            message={errors.photo}
                                        />
                                    </div>
                                    ) : (
                                        <div className='border rounded-md mt-1.5 p-5'>
                                            <div className='flex flex-col justify-center items-center gap-2'>
                                                <img src={auth.user.photo_url} alt="photo profile" className='w-60' />
                                                <span className='text-xs'>{defaultPhoto(getPhotoName(auth.user.photo_url))}</span>
                                            </div>

                                            <div className='flex justify-center'>
                                                <Input
                                                    type='file'
                                                    id='photo'
                                                    className='flex justify-center mt-3 w-50 cursor-pointer'
                                                    onChange={handleFileUpload}
                                                    name='photo'
                                                />
                                            </div>

                                            <InputError
                                                className='mt-2'
                                                message={errors.photo}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                        className='cursor-pointer'
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
