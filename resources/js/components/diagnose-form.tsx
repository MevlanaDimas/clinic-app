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
import { Diagnose, User } from "@/types";
import { router, useForm, usePage } from "@inertiajs/react";
import { Minus, Plus, UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/diagnose";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { Textarea } from "./ui/textarea";

interface PatientFormProps {
    diagnose?: Diagnose;
    id?: number;
}

export const DiagnoseForm = ({ diagnose, id }: PatientFormProps) => {
    const method = diagnose ? 'patch' : 'post';
    const { auth }: { auth: { user: User } } = usePage().props as any;
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const getPatients = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);

        try {
            const { data } = await axios.get('/patient-registration/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch patients data.');
        }
    }

    const getMedicines = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);

        try {
            const { data } = await axios.get('/medicine/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch medicines data.');
        }
    }

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        patient_id: diagnose?.patient_id || '',
        doctor_id: diagnose?.doctor_id || auth.user.id,
        diagnosis: diagnose?.diagnosis || '',
        treatment: diagnose?.treatment || '',
        prescriptions: diagnose?.prescription?.length > 0 ? diagnose.prescription.map(p => ({
            id: p.id, // Add prescription ID
            medicines_id: p.medicines_id,
            quantity: p.quantity,
            medicine_name: p.medicine_name,
            medicine_strength: p.medicine_strength,
            medicine_strength_unit: p.medicine_strength_unit,
            medicine_manufacturer: p.medicine_manufacturer
        })) : [{ id: null, medicines_id: '', quantity: '', medicine_name: '', medicine_strength: '', medicine_strength_unit: '', medicine_manufacturer: '' }],
        notes: diagnose?.notes || ''
    });

    const handleAddPrescription = () => {
        setData('prescriptions', [...data.prescriptions, { id: null, medicines_id: '', quantity: '', medicine_name: '', medicine_strength: '', medicine_strength_unit: '', medicine_manufacturer: '' }]);
    };

    const handleRemovePrescription = (index: number) => {
        const newPrescriptions = [...data.prescriptions];
        newPrescriptions.splice(index, 1);
        setData('prescriptions', newPrescriptions);
    };

    const handlePrescriptionChange = (index: number, field: string, value: any) => {
        const newPrescriptions = [...data.prescriptions];
        newPrescriptions[index] = { ...newPrescriptions[index], [field]: value };
        setData('prescriptions', newPrescriptions);
    };

    const handleMedicineChange = (index: number, selectedOption: any) => {
        const newPrescriptions = [...data.prescriptions];
        newPrescriptions[index] = { ...newPrescriptions[index], medicines_id: selectedOption?.value || '' };
        setData('prescriptions', newPrescriptions);
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
                toast.success(`Diagnose data has been ${diagnose ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${diagnose ? 'update' : 'save'} diagnose data.`);
            },
        };
        
        if (method === 'post') {
            post(store().url, commonOptions);
        } else {
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
                toast.success('Diagnose data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete diagnose data.');
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {diagnose ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add Diagnose
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Diagnose Form</DialogTitle>
                    <DialogDescription>
                        {diagnose ? 'Update diagnose information' : 'Fill out the form to add a new diagnose'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Patient
                            <AsyncSelect 
                                cacheOptions
                                defaultOptions
                                defaultValue={
                                    diagnose ? { label: `${diagnose.patient_name} (${diagnose.patient_number})`, value: diagnose.patient_id} : null
                                }
                                loadOptions={getPatients}
                                isClearable
                                placeholder="Select patient..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Patient not found'}
                                loadingMessage={() => 'Loading patients data...'}
                                onChange={(selectedOption: any) => {
                                    setData('patient_id', selectedOption.value)
                                }}
                                id="async-select-patient"
                                className="text-black"
                                styles={{
                                            option: (base) => ({
                                                ...base,
                                                cursor: 'pointer',
                                            }),
                                            control: (base, state) => ({
                                                ...base,
                                                cursor: state.isLoading ? 'progress' : 'text',
                                            }),
                                }}
                            />
                            <InputError message={errors.patient_id} className="mt-1" />
                        </Label>
                        <Label className="hidden">
                            <Input type="hidden" id="doctor" name="doctor" value={data.doctor_id} readOnly/>
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Diagnosis
                            <Textarea id="diagnosis" name="diagnosis" placeholder="Diagnosis" value={data.diagnosis} onChange={e => setData('diagnosis', e.target.value)} />
                            <InputError message={errors.diagnosis} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Treatment
                            <Textarea id="treatment" name="treatment" placeholder="Treatment" value={data.treatment} onChange={e => setData('treatment', e.target.value)} />
                            <InputError message={errors.treatment} className="mt-1" />
                        </Label>
                        <div className="flex flex-col">
                        <h5 className="text-[14.3px] -mb-2">Prescription</h5>
                            {data.prescriptions.map((prescription, index) => (
                                <div key={index} className="space-y-2 mt-2 border p-3 rounded-md mb-3 relative">
                                    <div className="flex flex-row w-full justify-between items-center gap-2">
                                        <Label className="flex flex-col gap-1 cursor-pointer">
                                            Medicine
                                            <AsyncSelect
                                                cacheOptions
                                                defaultOptions
                                                defaultValue={
                                                    prescription ? { label: `${prescription.medicine_name} - ${prescription.medicine_strength}${prescription.medicine_strength_unit} (${prescription.medicine_manufacturer})`, value: prescription.medicines_id } : null
                                                }
                                                loadOptions={getMedicines}
                                                isClearable
                                                placeholder="Select medicine..."
                                                isLoading={loading}
                                                noOptionsMessage={() => 'Medicine not found'}
                                                loadingMessage={() => 'Loading medicines data...'}
                                                onChange={(selectedOption: any) => handleMedicineChange(index, selectedOption)}
                                                id={`async-select-medicine-${index}`}
                                                className="text-black w-72"
                                                styles={{
                                                    option: (base) => ({
                                                        ...base,
                                                        cursor: 'pointer',
                                                    }),
                                                    control: (base, state) => ({
                                                        ...base,
                                                        cursor: state.isLoading ? 'progress' : 'text',
                                                    }),
                                                }}
                                            />
                                            <InputError message={errors[`prescriptions.${index}.medicines_id`]} className="mt-1" />
                                        </Label>
                                        <Label className="flex flex-col gap-1 cursor-text">
                                            Quantity
                                            <Input type="number" min={0} value={prescription.quantity} onChange={e => handlePrescriptionChange(index, 'quantity', e.target.value)} className="w-24" />
                                            <InputError message={errors[`prescriptions.${index}.quantity`]} />
                                        </Label>
                                    </div>
                                    {data.prescriptions.length > 1 && (
                                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemovePrescription(index)} className="absolute top-1 right-1 -mt-3 -mr-3 size-6 rounded-full hover:!bg-red-900 cursor-pointer">
                                            <Minus size={14} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <div className="mt-2">
                                <Button type="button" variant="outline" className="w-full cursor-pointer" onClick={handleAddPrescription}>
                                    <Plus className="mr-2 size-4" />
                                    Add Prescription
                                </Button>
                            </div>
                        </div>
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Notes
                            <Textarea id="notes" name="notes" placeholder="Notes" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                            <InputError message={errors.notes} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {diagnose && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('diagnoseData.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the diagnose data from the server.</AlertDialogDescription>
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
                                    {Can('diagnoseData.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {diagnose ? 'Update' : 'Save'}
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