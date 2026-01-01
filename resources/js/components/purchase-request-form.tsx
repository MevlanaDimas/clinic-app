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
import { PurchaseRequest, PurchaseRequestItem } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Minus, Plus, UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/purchase";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface PurchaseRequestFormProps {
    purchase_request?: PurchaseRequest;
    id?: number;
}

export const PurchaseForm = ({ purchase_request, id }: PurchaseRequestFormProps) => {
    const method = purchase_request ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const itemsType = [
        {label: 'Medicine', value: 'medicine'},
        {label: 'Equipment', value: 'equipment'}
    ]

    const getRequester = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);

        try {
            const { data } = await axios.get('/users/get-json', {
                params: {
                    search: inputValue,
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch requester data');
        }
    }

    const getSupplier = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);

        try {
            const { data } = await axios.get('/supplier/get-json', {
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

    const getBills = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);

        try {
            const { data } = await axios.get('/bills/get-json', {
                params: {
                    search: inputValue,
                    statuses: 'unpaid'
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch bills data');
        }
    }

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        user_id: purchase_request?.user_id || '',
        bill_id: purchase_request?.bill_id || '',
        request_items: purchase_request?.request_items?.length > 0 ? purchase_request.request_items.map(i => ({
            id: i.id, // Add purchase ID
            item_name: i.item_name,
            supplier_id: i.supplier_id,
            type: i.type,
            supplier: { value: i.supplier_id, label: `${i.supplier_name} (${i.supplier_contact_person})` },
            reason: i.reason,
            quantity: i.quantity,
            price_per_unit: i.price_per_unit
        })) : [{ id: null, item_name: '', supplier_id: '', type: '', reason: '', quantity: '', price_per_unit: '', supplier: null }],
        required_by_date: purchase_request?.required_by_date || '',
        notes: purchase_request?.notes || ''
    });

    const handleAddItem = () => {
        setData('request_items', [...data.request_items, { id: null, item_name: '', supplier_id: '', type: '', reason: '', quantity: '', price_per_unit: '', supplier: null }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...data.request_items];
        newItems.splice(index, 1);
        setData('request_items', newItems);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...data.request_items];
        let parsedValue = value;

        if (field === 'quantity' || field === 'price_per_unit') {
            parsedValue = value === '' ? 0 : parseFloat(value);
        }

        newItems[index] = { ...newItems[index], [field]: parsedValue };
        setData('request_items', newItems);
    };

    const handleSupplierChange = (index: number, selectedOption: any) => {
        const newItems = [...data.request_items];
        newItems[index] = { ...newItems[index], supplier: selectedOption, supplier_id: selectedOption?.value || '' };
        setData('request_items', newItems);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonOptions = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                router.reload();
                toast.success(`Purchase request data has been ${purchase_request ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${purchase_request ? 'update' : 'save'} purchase request data.`);
            },
        };
        
        if (method === 'post') {
            // console.log(data);
            post(store().url, commonOptions);
        } else {
            // console.log(data);
            patch(update(id).url, commonOptions);
        }
    }

    const handleDelete = () => {
        if (!id) return;
        router.delete(destroy(id).url, { // Also apply preserveScroll here for consistency
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                router.reload();
                toast.success('Purchase request data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete purchase request data.');
            },
        });
    }

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    const todayDate = getTodayDate();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {purchase_request ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add Purchase Request
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Purchase Request Form</DialogTitle>
                    <DialogDescription>
                        {purchase_request ? 'Update purchase request information' : 'Fill out the form to add a new purchase request'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Requester
                            <AsyncSelect 
                                cacheOptions
                                defaultOptions
                                defaultValue={
                                    purchase_request ? { label: `${purchase_request.requester_name}`, value: purchase_request.requester_id } : null
                                }
                                loadOptions={getRequester}
                                isClearable
                                placeholder="Select requester..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Requester not found'}
                                loadingMessage={() => 'Loading requesters data...'}
                                onChange={(selectedOption: any) => {
                                    setData('user_id', selectedOption.value)
                                }}
                                id="async-select-requester"
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
                            <InputError message={errors.user_id} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div className="flex flex-row gap-1">
                            Bill Number<span className="text-xs font-bold">(optional)</span>
                            </div>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                defaultValue={
                                    purchase_request ? { label: `${purchase_request.bill_number}`, value: purchase_request.bill_id } : null
                                }
                                loadOptions={getBills}
                                isClearable
                                placeholder="Select bill..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Bill not found'}
                                loadingMessage={() => 'Loading bills data...'}
                                onChange={(selectedOption: any) => {
                                    setData('bill_id', selectedOption.value)
                                }}
                                id="async-select-bill"
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
                            <InputError message={errors.bill_id} className="mt-1" />
                        </Label>
                        <div className="flex flex-col">
                            <h5 className="text-[14.3px] -mb-2">Items</h5>
                            {data.request_items.map((request_item: PurchaseRequestItem, index: number) => (
                                <div key={index} className="space-y-2 mt-2 border p-3 rounded-md mb-3 relative">
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        Item Name
                                        <Input type="text" placeholder="Item Name" value={request_item.item_name} onChange={e => handleItemChange(index, 'item_name', e.target.value)} />
                                        <InputError message={errors[`request_items.${index}.item_name`]} className="mt-1" />
                                    </Label>
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        Supplier
                                        <h6 className="text-xs mb-1">
                                            ( if supplier not listed, please make a new supplier data in supplier page )
                                        </h6>
                                        <AsyncSelect
                                            cacheOptions
                                            defaultOptions
                                            value={request_item.supplier}
                                            loadOptions={getSupplier}
                                            isClearable
                                            placeholder="Select supplier..."
                                            isLoading={loading}
                                            noOptionsMessage={() => 'Supplier not found'}
                                            loadingMessage={() => 'Loading suppliers data...'}
                                            onChange={(selectedOption: any) => handleSupplierChange(index, selectedOption)}
                                            id={`async-select-supplier-${index}`}
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
                                        <InputError message={errors[`request_items.${index}.supplier_id`]} className="mt-1" />
                                    </Label>
                                    <Label className="flex flex-col gap-1 cursor-pointer">
                                        Type
                                        <Select value={request_item.type} onValueChange={value => handleItemChange(index, 'type', value)}>
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {itemsType.map((type) => (
                                                    <SelectItem key={type.value} value={type.value} className="cursor-pointer">{type.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors[`request_items.${index}.type`]} className="mt-1" />
                                    </Label>
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        Reason
                                        <Textarea placeholder="Reason" value={request_item.reason} onChange={e => handleItemChange(index, 'reason', e.target.value)} />
                                        <InputError message={errors[`request_items.${index}.reason`]} className="mt-1" />
                                    </Label>
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        Quantity
                                        <Input type="number" min={0} placeholder="Quantity" value={request_item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} />
                                        <InputError message={errors[`request_items.${index}.quantity`]} className="mt-1" />
                                    </Label>
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        Price Per Unit
                                        <Input type="number" min={0} placeholder="Price Per Unit" value={request_item.price_per_unit} onChange={e => handleItemChange(index, 'price_per_unit', e.target.value)} />
                                        <InputError message={errors[`request_items.${index}.price_per_unit`]} className="mt-1" />
                                    </Label>
                                    {data.request_items.length > 1 && (
                                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(index)} className="absolute top-1 right-1 -mt-3 -mr-3 size-6 rounded-full hover:!bg-red-900 cursor-pointer">
                                            <Minus size={14} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <div>
                                <Button type="button" variant="outline" className="w-full cursor-pointer" onClick={handleAddItem}>
                                    <Plus className="mr-2 size-4" /> Add Item
                                </Button>
                            </div>
                            <Label className="flex flex-col mt-4 gap-1 cursor-pointer">
                                Required by Date
                                <Input type="date" id="required_by_date" name="required_by_date" min={todayDate} placeholder="Date Required" value={data.required_by_date} onChange={e => setData('required_by_date', e.target.value)} className="cursor-pointer" />
                                <InputError message={errors.required_by_date} className="mt-1" />
                            </Label>
                            <Label className="flex flex-col mt-4 gap-1 cursor-text">
                                <div className="flex flex-row gap-1">
                                    <h5>Notes</h5><span className="text-xs font-bold">(optional)</span>
                                </div>
                                <Textarea id="notes" name="notes" placeholder="Notes (optional)" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                                <InputError message={errors.notes} className="mt-1" />
                            </Label>
                        </div>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {purchase_request && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('purchaseData.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the purchase request data from the server.</AlertDialogDescription>
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
                                    {Can('purchaseData.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {purchase_request ? 'Update' : 'Save'}
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