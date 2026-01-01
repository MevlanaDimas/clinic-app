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
import { Supplier } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/supplier";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";

interface SupplierFormProps {
    supplier?: Supplier;
    id?: number;
}

export const SupplierForm = ({ supplier, id }: SupplierFormProps) => {
    const method = supplier ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        name: supplier?.name || '',
        contact_person: supplier?.contact_person || '',
        email: supplier?.email || '',
        phone_number: supplier?.phone_number || '',
        address: supplier?.address || '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`Supplier data has been ${supplier ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${supplier ? 'update' : 'save'} supplier data.`);
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
                toast.success('Supplier data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete supplier data.');
            },
            preserveState: false, // To ensure the page reloads and the deleted item is gone
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {supplier ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add Supplier
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Supplier Form</DialogTitle>
                    <DialogDescription>
                        {supplier ? 'Update supplier information' : 'Fill out the form to add a new supplier'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Name
                            <Input type="text" id="name" name="name" placeholder="Supplier Name" value={data.name} onChange={e => setData('name', e.target.value)} />
                            <InputError message={errors.name} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Contact Person Name
                            <Input type="text" id="contact_person" name="contact_person" placeholder="Contact Person Name" value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} />
                            <InputError message={errors.contact_person} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Email
                            <Input type="email" id="email" name="email" placeholder="example@mail.com" value={data.email} onChange={e => setData('email', e.target.value)} />
                            <InputError message={errors.email} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Phone Number
                            <Input type="text" id="phone_number" name="phone_number" placeholder="08**********" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} />
                            <InputError message={errors.phone_number} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Address
                            <Textarea id="address" name="address" placeholder="Supplier Address" value={data.address} onChange={e => setData('address', e.target.value)} />
                            <InputError message={errors.address} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {supplier && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('supplierData.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the supplier data from the server.</AlertDialogDescription>
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
                                    {Can('supplierData.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {supplier ? 'Update' : 'Save'}
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