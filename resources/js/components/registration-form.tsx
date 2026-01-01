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
import { Registration } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/registration";
import { toast } from "sonner";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { Button } from "./ui/button";
import { Can } from "@/lib/can";

interface RegistrationFormProps {
    registration?: Registration; // Changed prop name and type
    id?: number;
    patient_id?: number;
}

export const RegistrationForm = ({ registration, id }: RegistrationFormProps) => {
    const method = registration ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const getPatients = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);
        try {
            const { data } = await axios.get('/patient-data/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch (error) {
            setLoading(false);
            toast.error('Failed to fetch patients');
        }
    }

    const getDoctors = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);
        try {
            const { data } = await axios.get('/users/get-json', {
                params: {
                    search: inputValue,
                    role: 'doctor' // Add this parameter to filter by role
                }
            })
            setLoading(false);
            return data;
        } catch (error) {
            setLoading(false);
            toast.error('Failed to fetch doctors');
        }
    }

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        patient_id: registration?.patient_id ?? '',
        doctor_id: registration?.doctor_id ?? '',
        systolic_bp: registration?.patient_health_data?.[registration?.patient_health_data.length - 1]?.systolic_bp ?? '',
        diastolic_bp: registration?.patient_health_data?.[registration?.patient_health_data.length - 1]?.diastolic_bp ?? '',
        heart_rate: registration?.patient_health_data?.[registration?.patient_health_data.length - 1]?.heart_rate ?? '',
        oxygen_saturation: registration?.patient_health_data?.[registration?.patient_health_data.length - 1]?.oxygen_saturation ?? '',
        temperature: registration?.patient_health_data?.[registration?.patient_health_data.length - 1]?.temperature ?? '',
        height: registration?.patient_health_data?.[registration?.patient_health_data.length - 1]?.height ?? '',
        weight: registration?.patient_health_data?.[registration?.patient_health_data.length - 1]?.weight ?? '',
        complaints: registration?.patient_health_data?.[registration?.patient_health_data.length - 1]?.complaints ?? ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`Patient registration has been ${registration ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${registration ? 'update' : 'save'} patient registration.`);
            },
        };

        if (method === 'post') {
            // console.log(data);
            post(store().url, commonCallbacks);
        } else {
            // console.log(data);
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
                toast.success('Patient registration has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete patient registration.');
            },
            preserveState: false, // To ensure the page reloads and the deleted item is gone
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {registration ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add Registration
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Patient Registration Form</DialogTitle>
                    <DialogDescription>
                        {registration ? 'Update patient registration information' : 'Fill out the form to add a new patient registration'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Patient
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                defaultValue={
                                    registration
                                        ? { label: `${registration.patient_name} (${registration.patient_number})`, value: registration.patient_id }
                                        : null
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
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Doctor
                            <AsyncSelect 
                                cacheOptions
                                defaultOptions
                                defaultValue={
                                    registration
                                        ? { label: registration.doctor, value: registration.doctor_id }
                                        : null
                                }
                                loadOptions={getDoctors}
                                isClearable
                                placeholder="Select doctor..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Doctor not found'}
                                loadingMessage={() => 'Loading doctors data...'}
                                onChange={(selectedOption: any) => {
                                    setData('doctor_id', selectedOption.value)
                                }}
                                id="async-select-doctor"
                                className="text-black"
                                styles={{
                                            option: (base) => ({
                                                ...base,
                                                cursor: 'pointer',
                                            }),
                                            control: (base) => ({
                                                ...base,
                                                cursor: 'text',
                                            }),
                                        }}
                            />
                            <InputError message={errors.doctor_id} className="mt-1" />
                        </Label>
                        <h5 className="text-[14.3px] -mb-2">Vital Signs</h5>
                        <div className="space-y-2 mt-2 border p-3 rounded-md mb-3 relative">
                            <div className="flex flex-row justify-between items-center gap-2">
                                <Label className="flex flex-col gap-1 cursor-text">
                                    Systolic
                                    <Input type='number' min={0} value={data.systolic_bp} onChange={e => setData('systolic_bp', e.target.value)} />
                                    <InputError message={errors.systolic_bp} className="mt-1" />
                                </Label>
                                <span className="mt-5.5 text-[30px]">/</span>
                                <Label className="flex flex-col gap-1 cursor-text">
                                    Diastolic
                                    <Input type="number" min={0} value={data.diastolic_bp} onChange={e => setData('diastolic_bp', e.target.value)} />
                                    <InputError message={errors.diastolic_bp} className="mt-1" />
                                </Label>
                                <span className="mt-4 text-[20px]">mmHg</span>
                            </div>
                            <div className="flex flex-row items-center gap-8">
                                <div className="flex flex-row items-center gap-3">
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        Heart Rate
                                        <Input type='number' min={0} className="w-32" value={data.heart_rate} onChange={e => setData('heart_rate', e.target.value)} />
                                        <InputError message={errors.heart_rate} className="mt-1" />
                                    </Label>
                                    <span className="mt-5 text-[15px]">bpm</span>
                                </div>
                                <div className="flex flex-row items-center gap-3">
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        Oxygen Saturation
                                        <Input type='number' min={0} className="w-32" value={data.oxygen_saturation} onChange={e => setData('oxygen_saturation', e.target.value)} />
                                        <InputError message={errors.oxygen_saturation} className="mt-1" />
                                    </Label>
                                    <span className="mt-5 text-[15px]">%</span>
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-3">
                                <Label className="flex flex-col gap-1 cursor-text">
                                    Temperature
                                    <Input type='number' min={0} className="w-90" value={data.temperature} onChange={e => setData('temperature', e.target.value)} />
                                    <InputError message={errors.temperature} className="mt-1" />
                                </Label>
                                <span className="mt-5.5 text-[15px]">°C</span>
                            </div>
                            <div className="flex flex-row items-center gap-8">
                                <div className="flex flex-row gap-3">
                                    <Label className="flex flex-col gap-1">
                                        Height
                                        <Input type='number' min={0} className="w-32" value={data.height} onChange={e => setData('height', e.target.value)} />
                                        <InputError message={errors.height} className="mt-1" />
                                    </Label>
                                    <span className="mt-6 text-[15px]">cm</span>
                                </div>
                                <div className="flex flex-row gap-3">
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        Weight
                                        <Input type='number' min={0} className="w-32" value={data.weight} onChange={e => setData('weight', e.target.value)} />
                                        <InputError message={errors.weight} className="mt-1" />
                                    </Label>
                                    <span className="mt-6 text-[15px]">kg</span>
                                </div>
                            </div>
                        </div>
                        <Label className="flex flex-col gap-1 mt-3 cursor-pointer">
                            Complaints
                            <Textarea id="complaints" name="complaints" value={data.complaints} onChange={e => setData('complaints', e.target.value)} />
                            <InputError message={errors.complaints} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {registration && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('patientRegist.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete this registration data.</AlertDialogDescription>
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
                                    {Can('patientRegist.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {registration ? 'Update' : 'Save'}
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