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
import { PatientHealthData } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import InputError from "./input-error";
import { 
    destroyHealthData,
    storeHealthData,
    updateHealthData
} from "@/routes/patient/healthData";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Can } from "@/lib/can";

interface RegistrationFormProps {
    id?: number;
    healthData?: PatientHealthData | null;
    patient_id?: number;
}

export const HealthDataForm = ({ healthData, patient_id }: RegistrationFormProps) => {
    const method = healthData ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        id: healthData?.id || '',
        systolic_bp: healthData?.systolic_bp || '',
        diastolic_bp: healthData?.diastolic_bp || '',
        heart_rate: healthData?.heart_rate || '',
        oxygen_saturation: healthData?.oxygen_saturation || '',
        temperature: healthData?.temperature || '',
        height: healthData?.height || '',
        weight: healthData?.weight || '',
        complaints: healthData?.complaints || ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`Patient health data has been ${healthData ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${healthData ? 'update' : 'save'} patient health data.`);
            },
        };

        if (method === 'post') {
            post(storeHealthData({id: patient_id}).url, commonCallbacks);
        } else {
            patch(updateHealthData({id: patient_id, healthDataId: data.id}).url, commonCallbacks);
        }
    }

    const handleDelete = () => {
        if (!data.id) return;

        router.delete(destroyHealthData({id: patient_id, healthDataId: data.id}).url, {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success('Patient health data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete patient health data.');
            },
            preserveState: false, // To ensure the page reloads and the deleted item is gone
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {healthData ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add Health Data
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Patient Health Data Form</DialogTitle>
                    <DialogDescription className="mb-2">
                        {healthData ? 'Update patient health data' : 'Fill out the form to add a new patient health data'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
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
                                <div className="flex flex-row items-center gap-3">
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        Height
                                        <Input type='number' min={0} className="w-32" value={data.height} onChange={e => setData('height', e.target.value)} />
                                        <InputError message={errors.height} className="mt-1" />
                                    </Label>
                                    <span className="mt-3.5 text-[15px]">cm</span>
                                </div>
                                <div className="flex flex-row items-center gap-3">
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        Weight
                                        <Input type='number' min={0} className="w-32" value={data.weight} onChange={e => setData('weight', e.target.value)} />
                                        <InputError message={errors.weight} className="mt-1" />
                                    </Label>
                                    <span className="mt-3.5 text-[15px]">kg</span>
                                </div>
                            </div>
                        </div>
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Complaints
                            <Textarea id="complaints" name="complaints" value={data.complaints} onChange={e => setData('complaints', e.target.value)} />
                            <InputError message={errors.complaints} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {healthData && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('healthData.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete this patient health data.</AlertDialogDescription>
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
                                    {Can('healthData.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {healthData ? 'Update' : 'Save'}
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