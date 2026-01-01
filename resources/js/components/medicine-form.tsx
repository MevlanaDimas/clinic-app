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
import { Medicine } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/medicine";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import axios from "axios";
import AsyncSelect from "react-select/async";

interface MedicineFormProps {
    medicine?: Medicine;
    id?: number;
}

export const MedicineForm = ({ medicine, id }: MedicineFormProps) => {
    const method = medicine ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const medicineForms = [
        { label: 'Tablets', value: 'Tablets' },
        { label: 'Capsules', value: 'Capsules' },
        { label: 'Powders and Granules', value: 'Powders and Granules' },
        { label: 'Lozenges', value: 'Lozenges' },
        { label: 'Suppositories', value: 'Suppositories' },
        { label: 'Solutions', value: 'Solutions' },
        { label: 'Elixirs', value: 'Elixirs' },
        { label: 'Suspensions', value: 'Suspensions' },
        { label: 'Drops', value: 'Drops' },
        { label: 'Ointments', value: 'Ointments' },
        { label: 'Creams', value: 'Creams' },
        { label: 'Gels', value: 'Gels' },
        { label: 'Pastes', value: 'Pastes' },
        { label: 'Inhalers', value: 'Inhalers' },
        { label: 'Aerosols', value: 'Aerosols' },
        { label: 'Nebulizers', value: 'Nebulizers' },
        { label: 'Implants', value: 'Implants' },
        { label: 'Transdemal Pathces', value: 'Transdemal Pathces' },
        { label: 'Oral Films', value: 'Oral Films' },
        { label: 'Other', value: 'Other' }
    ];
    const deliverySystems = [
        { label: 'Oral', value: 'Oral' },
        { label: 'Parenteral', value: 'Parenteral' },
        { label: 'Topical', value: 'Topical' },
        { label: 'Inhalation', value: 'Inhalation' },
        { label: 'Transdermal', value: 'Transdermal' },
    ];
    const strengthUnits = [
        { label: 'mg', value: 'mg' },
        { label: 'ml', value: 'ml' },
        { label: 'µg', value: 'µg' },
        { label: 'g', value: 'g' }
    ];

    const getItemInInventory = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);

        try {
            const { data } = await axios.get('inventory/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch item data from inventory.');
        }
    }

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        inventory_id: medicine?.inventory_id || '',
        form: medicine?.form || '',
        delivery_system: medicine?.delivery_systems || '',
        strength: medicine?.strength || '',
        strength_unit: medicine?.strength_units || '',
        batch_number: medicine?.batch_number || '',
        expiry_date: medicine?.expiry_date || '',
        quantity_in_stock: medicine?.quantity_in_stock || '',
        sell_price_per_unit: medicine?.sell_price_per_unit || ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`Medicine data has been ${medicine ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${medicine ? 'update' : 'save'} medicine data.`);
            },
        };

        if (method === 'post') {
            // console.log(store().url);
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
                toast.success('Medicine data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete medicine data.');
            },
            preserveState: false, // To ensure the page reloads and the deleted item is gone
        });
    }

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const todayDate = getTodayDate();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {medicine ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add New Medicine
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Medicine Form</DialogTitle>
                    <DialogDescription>
                        {medicine ? 'Update medicine information' : 'Fill out the form to create a new medicine data'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Medicine in Inventory
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                defaultValue={
                                    medicine ? { label: `${medicine.name} (${medicine.manufacturer})`, value: medicine.inventory_id } : null
                                }
                                loadOptions={getItemInInventory}
                                isClearable
                                placeholder="Select item from inventory..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Item not found in inventory'}
                                loadingMessage={() => 'Loading item data from inventory...'}
                                onChange={(selectedOption: any) => {
                                    setData('inventory_id', selectedOption.value)
                                }}
                                id="async-select-inventory"
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
                            <InputError message={errors.inventory_id} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Form
                            <Select value={data.form} onValueChange={value => setData('form', value)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder="Select Form Type" />
                                </SelectTrigger>
                                <SelectContent className="max-h-50">
                                    {medicineForms.map((type) => (
                                        <SelectItem key={type.value} value={type.value} className="cursor-pointer">{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.form} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Delivery System
                            <Select value={data.delivery_system} onValueChange={value => setData('delivery_system', value)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder="Select Delivery System" />
                                </SelectTrigger>
                                <SelectContent className="max-h-43">
                                    {deliverySystems.map((type) => (
                                        <SelectItem key={type.value} value={type.value}className="cursor-pointer">{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.delivery_system} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Strength
                            <Input type="number" min={0} id="strength" name="strength" placeholder="Medicine Strength" value={data.strength} onChange={e => setData('strength', e.target.value)} className="cursor-text" />
                            <InputError message={errors.strength} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-3 cursor-pointer">
                            Strength Unit
                            <div className="flex gap-10">
                                {strengthUnits.map((s) => (
                                    <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="strength_unit"
                                            value={s.value}
                                            checked={data.strength_unit === s.value}
                                            onChange={(e) => setData('strength_unit', e.target.value)}
                                            className="cursor-pointer"
                                        />
                                        {s.label}
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.strength_unit} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Batch Number
                            <Input type="string"  id="batch_number" name="batch_number" placeholder="Batch Number" value={data.batch_number} onChange={e => setData('batch_number', e.target.value)} className="cursor-text" />
                            <InputError message={errors.batch_number} className="mt-1" />
                        </Label>
                        { method === 'patch' ? (
                            <Label className="flex flex-col gap-1 cursor-text">
                                Quantity
                                <Input type="number" id="quantity_in_stock" name="quantity_in_stock" value={data.quantity_in_stock} onChange={e => setData('quantity_in_stock', e.target.value)} />
                                <InputError message={errors.quantity_in_stock} className="mt-1" />
                            </Label>
                        ) : (null)}
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Expiry Date
                            <Input type="date" id="expiry_date" name="expiry_date" min={todayDate} value={data.expiry_date} onChange={e => setData('expiry_date', e.target.value)} className="cursor-pointer" />
                            <InputError message={errors.expiry_date} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Sell Price/Unit
                            <Input type="number" min={0} id="sell_price_per_unit" name="sell_price_per_unit" placeholder="Purchase Price" value={data.sell_price_per_unit} onChange={e => setData('sell_price_per_unit', e.target.value)} className="cursor-text" />
                            <InputError message={errors.sell_price_per_unit} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {medicine && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('medicineData.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the medicine data from the server.</AlertDialogDescription>
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
                                    {Can('medicineData.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {medicine ? 'Update' : 'Save'}
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