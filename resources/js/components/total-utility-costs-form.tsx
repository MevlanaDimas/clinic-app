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
import { Utility, UtilityCosts } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Minus, Plus, UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/utilityCost";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { Textarea } from "./ui/textarea";

interface UtilitiesCostsFormProps {
    utilities_cost?: UtilityCosts;
    id?: number;
}

export const UtilitiesCostsForm = ({ utilities_cost, id }: UtilitiesCostsFormProps) => {
    const method = utilities_cost ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

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
        bill_id: utilities_cost?.bill_id || '',
        request_items: utilities_cost?.request_items?.length > 0 ? utilities_cost.request_items.map(i => ({
            id: i.id, // Add purchase ID
            name: i.name,
            amount: i.amount,
            description: i.description,
        })) : [{ id: null, name: '', amount: '', description: '' }],
        notes: utilities_cost?.notes || ''
    });

    const handleAddItem = () => {
        setData('request_items', [...data.request_items, { id: null, name: '', amount: '', description: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...data.request_items];
        newItems.splice(index, 1);
        setData('request_items', newItems);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...data.request_items];
        let parsedValue = value;

        if (field === 'amount' ) {
            parsedValue = value === '' ? 0 : parseFloat(value);
        }

        newItems[index] = { ...newItems[index], [field]: parsedValue };
        setData('request_items', newItems);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonOptions = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                router.reload();
                toast.success(`Utilties data has been ${utilities_cost ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${utilities_cost ? 'update' : 'save'} utilities data.`);
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
                toast.success('Utilities data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete utiities data.');
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {utilities_cost ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add Utility Data
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Utilities Form</DialogTitle>
                    <DialogDescription>
                        {utilities_cost ? 'Update utilities information' : 'Fill out the form to add a new utilities'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div>
                                Bill Number <span className="text-xs font-bold">(optional)</span>
                            </div>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                defaultValue={
                                    utilities_cost? { label: utilities_cost.bill_number, value: utilities_cost.bill_number } : null
                                }
                                loadOptions={getBills}
                                isClearable
                                placeholder="Select bill..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Bill not found'}
                                loadingMessage={() => 'Loading bills data...'}
                                onChange={(selectedOption: any) => {
                                    setData('bill_id', selectedOption.value ? selectedOption.value : null);
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
                            {data.request_items.map((request_item: Utility, index: number) => (
                                <div key={index} className="space-y-2 mt-2 border p-3 rounded-md mb-3 relative">
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        <h6>Item Name</h6>
                                        <Input type="text" id="text" name="name" placeholder="Item Name" value={request_item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} />
                                        <InputError message={errors[`request_items.${index}.name`]} className="mt-1" />
                                    </Label>
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        <h6>Price</h6>
                                        <Input type="number" id="amount" name="amount" min={0} placeholder="Price Per Unit" value={request_item.amount} onChange={e => handleItemChange(index, 'amount', e.target.value)} />
                                        <InputError message={errors[`request_items.${index}.amount`]} className="mt-1" />
                                    </Label>
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        <div className="flex flex-row gap-1">
                                            <h6>Description</h6> <span className="text-xs font-bold">(optional)</span>
                                        </div>
                                        <Textarea id="description" name="description" placeholder="Description" value={request_item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} />
                                        <InputError message={errors[`request_items.${index}.description`]} className="mt-1" />
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
                                    {utilities_cost && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('utilityCost.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the utiities data from the server.</AlertDialogDescription>
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
                                    {Can('utilityCost.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {utilities_cost ? 'Update' : 'Save'}
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