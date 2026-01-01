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
import { PurchaseRequestItem } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import InputError from "./input-error";
import { 
    storeRequestItem,
    updateRequestItem,
    destroyRequestItem
} from "@/routes/purchase/requestItems";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface RequestedItemFormProps {
    requestItem?: PurchaseRequestItem | null;
    purchaseRequestId?: number ;
}

export const RequestItemForm = ({ requestItem, purchaseRequestId }: RequestedItemFormProps) => {
    const newPurchaseRequestId = purchaseRequestId?.toString();
    const method = requestItem ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const itemsType = [
        {label: 'Medicine', value: 'medicine'},
        {label: 'Equipment', value: 'equipment'}
    ]

    const getSupplier = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);

        try {
            const {data } = await axios.get('/supplier/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch supplier data');
        }
    }

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        id: requestItem?.id || '',
        item_name: requestItem?.item_name || '',
        supplier_id: requestItem?.supplier_id || '',
        type: requestItem?.type || '',
        supplier: requestItem ? { value: requestItem.supplier_id, label: `${requestItem.supplier_name} (${requestItem.supplier_contact_person})` } : null,
        reason: requestItem?.reason || '',
        quantity: requestItem?.quantity || '',
        price_per_unit: requestItem?.price_per_unit || '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                router.reload({ only: ['requestItems'] });
                toast.success(`Requested data item has been ${requestItem ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${requestItem ? 'update' : 'save'} requested data item.`);
            },
        };

        if (method === 'post') {
            post(storeRequestItem({id: newPurchaseRequestId}).url, commonCallbacks);
        } else {
            // console.log(newPurchaseRequestId);
            patch(updateRequestItem({id: newPurchaseRequestId, requestItemId: data.id.toString()}).url, commonCallbacks);
        }
    }

    const handleDelete = () => {
        if (!data.id) return;

        // console.log(destroyHealthData({id: data.patient_id, healthDataId: data.id}));

        router.delete(destroyRequestItem({id: newPurchaseRequestId, requestItemId: data.id.toString()}).url, {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                router.reload({ only: ['requestItems'] });
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
            <DialogTrigger asChild>
                {requestItem ? (
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
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Requested Data Item Form</DialogTitle>
                    <DialogDescription className="mb-2">
                        {requestItem ? 'Update requested data item' : 'Fill out the form to add a new requested data item'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Item Name
                            <Input type="text" id="item_name" name="item_name" placeholder="Item Name" max={255} value={data.item_name} onChange={e => setData('item_name', e.target.value)} />
                            <InputError message={errors.item_name} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div className="flex flex-col gap-1">
                                <h6>Supplier</h6>
                                <span className="text-xs font-bold">( if Supplier not listed, please make a new supplier data in supplier page )</span>
                            </div>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                value={data.supplier}
                                loadOptions={getSupplier}
                                isClearable
                                placeholder="Select supplier..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Supplier not found'}
                                loadingMessage={() => 'Loading suppliers data...'}
                                onChange={(selectedOption: any) => setData({ ...data, supplier_id: selectedOption?.value || '', supplier: selectedOption })}
                                id="async-select-supplier"
                                className="text-black"
                                styles={{ 
                                    option: (base) => ({
                                        ...base,
                                        cursor: 'pointer'
                                    }),
                                    control: (base, state) => ({
                                        ...base,
                                        cursor: state.isLoading ? 'progress' : 'text'
                                    })
                                }}
                            />
                            <InputError message={errors.supplier_id} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Type
                            <Select value={data.type} onValueChange={value => setData('type', value)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder="Select Type"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {itemsType.map((type) => (
                                        <SelectItem key={type.value} value={type.value} className="cursor-pointer">{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.type} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Reason
                            <Textarea id="reason" name="reason" placeholder="Reason" value={data.reason} onChange={e => setData('reason', e.target.value)} />
                            <InputError message={errors.reason} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Quantity
                            <Input id="quantity" name="quantity" min={0} placeholder="Quantity" value={data.quantity} onChange={e => setData('quantity', e.target.value)} />
                            <InputError message={errors.quantity} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Price/Unit
                            <Input type="number" id="price_per_unit" name="price_per_unit" min={0} placeholder="Price/Unit" value={data.price_per_unit} onChange={e => setData('price_per_unit', e.target.value)} />
                            <InputError message={errors.price_per_unit} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {requestItem && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('requestItem.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete this requested data item.</AlertDialogDescription>
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
                                    {Can('requestItem.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {requestItem ? 'Update' : 'Save'}
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