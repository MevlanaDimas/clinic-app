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
import { Bill } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import InputError from "./input-error";
import { destroy, update } from "@/routes/bills";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

interface BillFormProps {
    bill?: Bill;
    id?: number;
}

export const BillForm = ({ bill, id }: BillFormProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const paidStatus = [
        { label: 'Paid', value: 'paid' },
        { label: 'Unpaid', value: 'unpaid' }
    ]

    const {data, setData, patch, processing, errors, reset, clearErrors} = useForm({
        notes: bill?.notes || '',
        status: bill?.status || '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`Bill data has been ${bill ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${bill ? 'update' : 'save'} bill data.`);
            },
        };

        patch(update(id).url, commonCallbacks);
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
            <DialogTrigger>
                <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                    <View size={16} />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bill Form</DialogTitle>
                    <DialogDescription>
                        Update bill information
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Status
                            <Select value={data.status} onValueChange={value => setData('status', value)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paidStatus.map((status) => (
                                        <SelectItem key={status.value} value={status.value} className='cursor-pointer'>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.notes} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Notes
                            <Textarea id="notes" name="notes" placeholder="Notes" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                            <InputError message={errors.notes} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {bill && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('billData.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the bill data from the server.</AlertDialogDescription>
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
                                    {Can('billData.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        Update
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