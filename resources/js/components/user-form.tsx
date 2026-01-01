import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { User } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/user";
import { toast } from "sonner";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";

interface UserFormProps {
    user?: User;
    id?: number;
}

export const UserForm = ({ user, id }: UserFormProps) => {
    const method = user ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const getRoles = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);
        try {
            const { data } = await axios.get('/roles/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch roles');
        }
    }

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        name: user?.name || '',
        email: user?.email || '',
        roles: user?.roles?.map(role => role.value) || [],
        password: user?.password || '',
        password_confirmation: user?.password_confirmation || '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`User data has been ${user ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${user ? 'update' : 'save'} user data.`);
            },
        };

        if (method === 'post') {
            // console.log(data);
            post(store().url, commonCallbacks);
        } else {
            patch(update(id).url, commonCallbacks);
        }
    }

    const handleDelete = () => {
        if (!id) return;
        router.delete(destroy(id).url, {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success('User data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete user data.');
            },
            preserveState: false, // To ensure the page reloads and the deleted item is gone
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {user ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add User
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>User Form</DialogTitle>
                    <DialogDescription>
                        {user ? 'Update user information' : 'Fill out the form to add a new user'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <form className="flex flex-col space-y-3" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Name
                            <Input type="text" id="name" name="name" placeholder="User Name" value={data.name} onChange={e => setData('name', e.target.value)} />
                            <InputError message={errors.name} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Email
                            <Input type="email" id="email" name="email" placeholder="example@mail.com" value={data.email} onChange={e => setData('email', e.target.value)} />
                            <InputError message={errors.email} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Role
                            <AsyncSelect 
                                cacheOptions
                                isMulti
                                defaultOptions
                                defaultValue={user?.roles}
                                loadOptions={getRoles}
                                isClearable
                                placeholder="Select role..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Role not found'}
                                loadingMessage={() => 'Loading roles data...'}
                                onChange={(selectedOptions:any) => {
                                    setData('roles', selectedOptions.map((option: any) => option.value));
                                }}
                                id="async-select-role"
                                className="text-black"
                                styles={{
                                            option: (base) => ({
                                                ...base,
                                                cursor: 'pointer',
                                            }),
                                            control: (base, state) => ({
                                                ...base,
                                                cursor: state.isLoading ? 'progress' : 'text',
                                            }),
                                        }}
                            />
                            <InputError message={errors.roles} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Password
                            <Input type="password" id="password" name="password" placeholder="User Password" value={data.password} onChange={e => setData('password', e.target.value)} />
                            <InputError message={errors.password} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Password Confirmation
                            <Input type="password" id="password_confirmation" name="password_confirmation" placeholder="Confirm User Password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                            <InputError message={errors.password_confirmation} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {user && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('user.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the user data from the server.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary" className="cursor-pointer">Cancel</Button>
                                    </DialogClose>
                                    {Can('user.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {user ? 'Update' : 'Save'}
                                    </Button>}
                                </div>
                            </div>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};