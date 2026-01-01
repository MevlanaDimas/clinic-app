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
import { Utility } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import InputError from "./input-error";
import { 
    storeUtilityCost,
    updateUtilityCost,
    destroyUtilityCost
} from "@/routes/utilityCost/utilities";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";

interface UtilityItemFormProps {
    utilityItem?: Utility | null;
    totalUtilitiesId?: number;
}

export const UtilityForm = ({utilityItem, totalUtilitiesId }: UtilityItemFormProps) => {
    const method = utilityItem ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        id: utilityItem?.id || '',
        name: utilityItem?.name || '',
        amount: utilityItem?.amount || '',
        description: utilityItem?.description || ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                router.reload({ only: ['utilityItem'] });
                toast.success(`Utility data item has been ${utilityItem ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${utilityItem ? 'update' : 'save'} utility data item.`);
            },
        };

        if (method === 'post') {
            post(storeUtilityCost({id: totalUtilitiesId?.toString()}).url, commonCallbacks);
        } else {
            patch(updateUtilityCost({id: totalUtilitiesId?.toString(), utilityId: data.id.toString()}).url, commonCallbacks);
        }
    }

    const handleDelete = () => {
        if (!data.id) return;

        // console.log(destroyHealthData({id: data.patient_id, healthDataId: data.id}));

        router.delete(destroyUtilityCost({id: totalUtilitiesId?.toString(), utilityId: data.id.toString()}).url, {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                router.reload({ only: ['utilityItem'] });
                toast.success('Utility data item has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete utility data item.');
            },
            preserveState: false, // To ensure the page reloads and the deleted item is gone
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {utilityItem ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add New Item
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Requested Data Item Form</DialogTitle>
                    <DialogDescription className="mb-2">
                        {utilityItem ? 'Update utility data item' : 'Fill out the form to add a new utility data item'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Name
                            <Input type="text" id="name" name="name" placeholder="Name" max={255} value={data.name} onChange={e => setData('name', e.target.value)} />
                            <InputError message={errors.name} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Price
                            <Input type="number" id="amount" name="amount" min={0} placeholder="Price" value={data.amount} onChange={e => setData('amount', e.target.value)} />
                            <InputError message={errors.amount} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div className="flex flex-row gap-1">
                                Description<span className="text-xs font-bold">(optional)</span>
                            </div>
                            <Textarea id="description" name="description" placeholder="Description" value={data.description} onChange={e => setData('description', e.target.value)} />
                            <InputError message={errors.description} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {utilityItem && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('utilitiesData.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete this utility data item.</AlertDialogDescription>
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
                                    {Can('utilitiesData.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {utilityItem ? 'Update' : 'Save'}
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