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
import { Role } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/role";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import AsyncSelect from "react-select/async";
import axios from "axios";

interface RoleFormProps {
    role?: Role;
    id?: number;
}

export const RoleForm = ({ role, id, }: RoleFormProps) => {
    const method = role ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const getPermissions = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);
        try {
            const { data } = await axios.get('/permissions/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch (error) {
            setLoading(false);
            toast.error('Failed to fetch permissions');
        }
    }

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        name: role?.name || '',
        permissions: role?.permissions || [],
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`Role data has been ${role ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${role ? 'update' : 'save'} role data.`);
            },
        };

        if (method === 'post') {
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
                toast.success('Role data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete role data.');
            },
            preserveState: false, // To ensure the page reloads and the deleted item is gone
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {role ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add Role
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Role Form</DialogTitle>
                    <DialogDescription>
                        {role ? 'Update role information' : 'Fill out the form to add a new role'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Name
                            <Input type="text" id="name" name="name" placeholder="Role Name" value={data.name} onChange={e => setData('name', e.target.value)} />
                            <InputError message={errors.name} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Permissions 
                            <AsyncSelect
                                cacheOptions
                                isMulti
                                defaultOptions
                                defaultValue={data.permissions.map(permission => ({ value: permission, label: permission }))}
                                loadOptions={getPermissions}
                                isClearable
                                placeholder="Select permission..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Permission not found'}
                                loadingMessage={() => 'Loading permissions data...'}
                                onChange={(selectedOptions:any) => {
                                    setData('permissions', selectedOptions.map((option: any) => option.value));
                                }}
                                id="async-select-permission"
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
                            <InputError message={errors.permissions} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {role && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('role.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the role data from the server.</AlertDialogDescription>
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
                                    {Can('role.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {role ? 'Update' : 'Save'}
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