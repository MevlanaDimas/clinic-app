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
import { Patient } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/patient";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";

interface PatientFormProps {
    patient?: Patient;
    id?: number;
}

export const PatientForm = ({ patient, id }: PatientFormProps) => {
    const method = patient ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);
    const sex = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
    ];
    const bloodTypes = [
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'AB', value: 'AB' },
        { label: 'O', value: 'O' },
    ];

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        patient_name: patient?.patient_name || '',
        date_of_birth: patient?.date_of_birth || '',
        blood_type: patient?.blood_type || '',
        sex: patient?.sex || '',
        phone_number: patient?.phone_number || '',
        address: patient?.address || '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`Patient data has been ${patient ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${patient ? 'update' : 'save'} patient data.`);
            },
        };

        if (method === 'post') {
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
                toast.success('Patient data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete patient data.');
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
                {patient ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add Patient
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Patient Form</DialogTitle>
                    <DialogDescription>
                        {patient ? 'Update patient information' : 'Fill out the form to add a new patient'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Name
                            <Input type="text" id="patient_name" name="patient_name" placeholder="Patient Name" value={data.patient_name} onChange={e => setData('patient_name', e.target.value)} />
                            <InputError message={errors.patient_name} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Date of Birth
                            <Input type="date" id="date_of_birth" name="date_of_birth" max={todayDate} value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} />
                            <InputError message={errors.date_of_birth} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Blood Type
                            <Select value={data.blood_type} onValueChange={value => setData('blood_type', value)}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select Blood Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bloodTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.blood_type} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-3 cursor-pointer">
                            Sex
                            <div className="flex flex-row gap-10">
                                {sex.map((s) => (
                                    <label key={s.value} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="sex"
                                            value={s.value}
                                            checked={data.sex === s.value}
                                            onChange={(e) => setData('sex', e.target.value)}
                                            className="cursor-pointer"
                                        />
                                        {s.label}
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.sex} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Phone Number
                            <Input type="text" id="phone_number" name="phone_number" placeholder="Patient Phone Number" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} />
                            <InputError message={errors.phone_number} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Address
                            <Textarea id="address" name="address" placeholder="Patient Address" value={data.address} onChange={e => setData('address', e.target.value)} />
                            <InputError message={errors.address} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {patient && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('patientData.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the patient data from the server.</AlertDialogDescription>
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
                                    {Can('patientData.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {patient ? 'Update' : 'Save'}
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