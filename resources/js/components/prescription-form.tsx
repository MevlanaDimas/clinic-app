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
import { Prescription } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import InputError from "./input-error";
import { store, update, destroy } from "@/routes/prescription";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface PrescriptionFormProps {
    prescription?: Prescription;
    id?: number ;
}

export const PrescriptionForm = ({ prescription, id }: PrescriptionFormProps) => {
    const method = prescription ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const statusType = [
        {label: 'Done', value: 'done'},
        {label: 'On Process', value: 'on_process'},
        {label: 'Cancelled', value: 'cancelled'}
    ]

    const getMedicine = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);

        try {
            const {data } = await axios.get('/medicine/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch medicines data');
        }
    }

    const getDiagnosis = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);

        try {
            const { data } = await axios.get('/diagnose/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch diagnoses data');
        }
    }

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        id: prescription?.id || '',
        medicines_id: prescription?.medicines_id || '',
        diagnosis_id: prescription?.diagnosis_id || '',
        dosage: prescription?.dosage || '',
        quantity: prescription?.quantity || '',
        status: prescription?.status || '',
        instructions: prescription?.instructions || '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`Prescription data has been ${prescription ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${prescription ? 'update' : 'save'} prescription data.`);
            },
        };

        if (method === 'post') {
            post(store().url, commonCallbacks);
        } else {
            // console.log(newPurchaseRequestId);
            patch(update(id).url, commonCallbacks);
        }
    }

    const handleDelete = () => {
        if (!data.id) return;

        router.delete(destroy(id).url, {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success('Prescription data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete prescription data.');
            },
            preserveState: false, // To ensure the page reloads and the deleted item is gone
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {prescription ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add New Prescription
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Prescription Form</DialogTitle>
                    <DialogDescription className="mb-2">
                        {prescription ? 'Update prescription data' : 'Fill out the form to add a new prescription data'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4 mt-2">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Diagnosis
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                defaultValue={
                                    prescription ? { label: `${prescription.diagnosis_code} - ${prescription.patient_name} (${prescription.doctor_name})`, value: prescription.diagnosis_id } : null
                                }
                                loadOptions={getDiagnosis}
                                isClearable
                                placeholder="Select diagnosis..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Diagnosis not found'}
                                loadingMessage={() => 'Loading diagnoses data...'}
                                onChange={(selectedOption: any) => {
                                    setData('diagnosis_id', selectedOption.value)
                                }}
                                id="async-select-diagnosis"
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
                            <InputError message={errors.diagnosis_id} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Medicine
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                defaultValue={
                                    prescription ? { label: `${prescription.medicine_name} - ${prescription.medicine_strength}${prescription.medicine_strength_unit} (${prescription.medicine_manufacturer})`, value: prescription.medicines_id } : null
                                }
                                loadOptions={getMedicine}
                                isClearable
                                placeholder="Select medicine..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Medicine not found'}
                                loadingMessage={() => 'Loading medicines data...'}
                                onChange={(selectedOption: any) => {
                                    setData('medicines_id', selectedOption.value)
                                }}
                                id="async-select-medicine"
                                className="text-black dark:text-white"
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
                            <InputError message={errors.medicines_id} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Dosage
                            <Input type="text" id="dosage" name="dosage" placeholder="Dosage" value={data.dosage} onChange={e => setData('dosage', e.target.value)} />
                            <InputError message={errors.dosage} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Quantity
                            <Input id="quantity" name="quantity" min={0} placeholder="Quantity" value={data.quantity} onChange={e => setData('quantity', e.target.value)} />
                            <InputError message={errors.quantity} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Instructions
                            <Textarea id="instructions" name="instructions" placeholder="Instructions" value={data.instructions} onChange={e => setData('instructions', e.target.value)} />
                            <InputError message={errors.instructions} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Type
                            <Select value={data.status} onValueChange={value => setData('status', value)}>
                                <SelectTrigger className="w-full cursor-pointer">
                                    <SelectValue placeholder="Select Status"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {statusType.map((status) => (
                                        <SelectItem key={status.value} value={status.value} className="cursor-pointer">{status.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {prescription && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('prescriptionData.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete this prescription data.</AlertDialogDescription>
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
                                    {Can('prescriptionData.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {prescription ? 'Update' : 'Save'}
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