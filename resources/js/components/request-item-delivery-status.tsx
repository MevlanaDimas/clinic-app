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
import { PurchaseRequestItem, RequestedItemDeliveryStatus } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import InputError from "./input-error";
import { update, destroy } from "@/routes/purchaseDeliveryStatus"
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface RegistrationFormProps {
    item: PurchaseRequestItem | null;
    delivery_status?: RequestedItemDeliveryStatus | null;
    requestedItemId: number;
}

export const RequestedItemDeliveryStatusForm = ({ item, requestedItemId }: RegistrationFormProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const statuses = [
        {label: 'Pending', value: 'pending'},
        {label: 'On Delivery', value: 'on_delivery'},
        {label: 'Delivered', value: 'delivered'},
        {label: 'Rejected', value: 'rejected'},
        {label: 'Returned', value: 'returned'}
    ];

    const {data, setData, patch, processing, errors, reset, clearErrors} = useForm({
        status: item?.delivery_status?.status || '',
        delivery_service: item?.delivery_status?.delivery_service || '',
        tracking_number: item?.delivery_status?.tracking_number || '',
        estimated_delivery_time_in_days: item?.delivery_status?.estimated_delivery_time_in_days || '',
        rejected_reason: item?.delivery_status?.rejected_reason || '',
        returned_reason: item?.delivery_status?.returned_reason || ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                router.reload();
                toast.success(`Delivery data of requested item has been ${item ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${item ? 'update' : 'save'} delivery data of requested item.`);
            },
        };

        if(!requestedItemId) return;

        patch(update(requestedItemId).url, commonCallbacks);
    }

    const handleDelete = () => {
        if (!item?.delivery_status?.id) return;

        // console.log(destroy(item?.delivery_status?.id).url);

        router.delete(destroy(item?.delivery_status?.id).url, {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                router.reload();
                toast.success('Requested data item has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete requested data item.');
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
                    <DialogTitle>Delivery Data of The Requested Item Form</DialogTitle>
                    <DialogDescription className="mb-2">
                        Update delivery data of the requested item
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Status
                            <Select value={data.status} onValueChange={value => setData('status', value)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((statuses) => (
                                        <SelectItem key={statuses.value} value={statuses.value} className="cursor-pointer">{statuses.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div className="flex flex-row gap-1">
                                Delivery Service
                                <span className="text-xs font-bold">(Optional)</span>
                            </div>
                            <Input type="text" id="delivery_service" name="delivery_service" placeholder="Delivery Service" max={255} value={data.delivery_service} onChange={e => setData('delivery_service', e.target.value)} />
                            <InputError message={errors.delivery_service} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div className="flex flex-row gap-1">
                                Tracking Number
                                <span className="text-xs font-bold">(Optional)</span>
                            </div>
                            <Input type="text" id="tracking_number" name="tracking_number" placeholder="Tracking Number" max={255} value={data.tracking_number} onChange={e => setData('tracking_number', e.target.value)} />
                            <InputError message={errors.tracking_number} className="mt-1" />
                        </Label>
                        <div className="flex flex-row items-center gap-3">
                            <Label className="flex flex-col gap-1 cursor-text">
                                <div className="flex flex-row gap-1">
                                    Estimated Delivery Time
                                    <span className="text-xs font-bold">(Optional)</span>
                                </div>
                                <Input type="number" id="estimated_delivery_time" name="estimated_delivery_time" placeholder="Estimated Delivery Time" min={0} className="w-100" value={data.estimated_delivery_time_in_days} onChange={e => setData('estimated_delivery_time_in_days', e.target.value)} />
                                <InputError message={errors.estimated_delivery_time_in_days} className="mt-1" />
                            </Label>
                            <span className="mt-5 text-sm">days</span>
                        </div>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div className="flex flex-row gap-1">
                                Rejected Reason
                                <span className="text-xs font-bold">(Optional)</span>
                            </div>
                            <Textarea id="rejected_reason" name="rejected_reason" placeholder="Rejected Reason" value={data.rejected_reason} onChange={e => setData('rejected_reason', e.target.value)} />
                            <InputError message={errors.rejected_reason} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div className="flex flex-row gap-1">
                                Returned Reason
                                <span className="text-xs font-bold">(Optional)</span>
                            </div>
                            <Textarea id="returned_reason" name="returned_reason" placeholder="Returned Reason" value={data.returned_reason} onChange={e => setData('returned_reason', e.target.value)} />
                            <InputError message={errors.returned_reason} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {item && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('purchaseDeliveryStatus.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete this delivery data of the requested item.</AlertDialogDescription>
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
                                    {Can('purchaseDeliveryStatus.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
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