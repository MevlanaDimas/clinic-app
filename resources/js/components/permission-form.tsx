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
import { Permission } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/permission";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";

interface PermissionFormProps {
    permission?: Permission;
    id?: number;
}

export const PermissionForm = ({ id, permission }: PermissionFormProps) => {
    const method = permission ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        name: permission?.name || ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`Permission data has been ${permission ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${permission ? 'update' : 'save'} permission data.`);
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
                toast.success('Patient data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete patient data.');
            },
            preserveState: false, // To ensure the page reloads and the deleted item is gone
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {permission ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add Permission
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Permission Form</DialogTitle>
                    <DialogDescription>
                        {permission ? 'Update permission information' : 'Fill out the form to add a new permission'}
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Name
                            <Input type="text" id="name" name="name" placeholder="Permission Name" value={data.name} onChange={e => setData('name', e.target.value)} />
                            <InputError message={errors.name} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {permission && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('permission.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the permission data from the server.</AlertDialogDescription>
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
                                    {Can('permission.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {permission ? 'Update' : 'Save'}
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