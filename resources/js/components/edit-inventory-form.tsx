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
import { Inventory } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import InputError from "./input-error";
import { destroy, update } from "@/routes/inventory";
import { toast } from "sonner";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface EditInventoryFormProps {
    item?: Inventory;
    id?: number;
}

export const EditInventoryForm = ({ item, id }: EditInventoryFormProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const itemType = [
        {label: 'Medicine', value: 'medicine'},
        {label: 'Equipment', value: 'equipment'}
    ]

    const getSupplier = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);

        try {
            const { data } = await axios.get('supplier/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch supplier data.');
        }
    }

    const {data, setData, patch, processing, errors, reset, clearErrors} = useForm({
        id: item?.id || '',
        name: item?.name || '',
        supplier_id: item?.supplier_id || '',
        type: item?.type || '',
        quantity: item?.quantity || ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`Inventory data has been updated successfully.`);
            },
            onError: () => {
                toast.error(`Failed to update inventory data.`);
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
                toast.success('Inventory data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete inventory data.');
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
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Inventory Form</DialogTitle>
                    <DialogDescription>
                        Update inventory information.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Name
                            <Input type="text" id="name" name="name" placeholder="Name" value={data.name} onChange={e => setData('name', e.target.value)} />
                            <InputError message={errors.name} />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div className="flex flex-col gap-1">
                                <h6>Supplier</h6>
                                <span className="text-xs font-bold">
                                ( if supplier not listed, please make a new supplier data in supplier page )
                                </span>    
                            </div>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                defaultValue={
                                    item ? { label: `${item.supplier_name} (${item.supplier_contact_person})`, value: item.supplier_id } : null
                                }
                                loadOptions={getSupplier}
                                isClearable
                                placeholder="Select supplier..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Supplier not found'}
                                loadingMessage={() => 'Loading supplier data...'}
                                onChange={(selectedOption: any) => {
                                    setData('supplier_id', selectedOption.value)
                                }}
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
                            <Select value={item?.type} onValueChange={value => setData('type', value)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {itemType.map((type) => (
                                        <SelectItem key={type.value} value={type.value} className="cursor-pointer">{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.type} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Quantity
                            <Input type="number" id="quantity" name="quantity" placeholder="Quantity" value={data.quantity} onChange={e => setData('quantity', e.target.value)} />
                            <InputError message={errors.quantity} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {item && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('inventories.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the inventory data from the server.</AlertDialogDescription>
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
                                    {Can('inventories.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
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