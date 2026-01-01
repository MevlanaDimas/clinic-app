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
import { PatientBill, PrescriptionBill } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Minus, Plus, UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/totalPatientBill";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface TotalPatientBillFormProps {
    bill?: PatientBill;
    id?: number;
}

export const PatientBillForm = ({ bill, id }: TotalPatientBillFormProps) => {
    const method = bill ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const statusType = [
        {label: 'Paid', value: 'paid'},
        {label: 'Unpaid', value: 'unpaid'},
        {label: 'Cancelled', value: 'cancelled'}
    ]

    const getDiagnose = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);

        try {
            const { data } = await axios.get('/diagnose/get-json', {
                params: {
                    search: inputValue,
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch diagnose data');
        }
    }

    const getPrescription = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);

        try {
            const { data } = await axios.get('/prescription/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch prescription data');
        }
    }

    const getPatient = async (inputValue: string) => {
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
        } catch {
            setLoading(false);
            toast.error('Failed to fetch patient data');
        }
    }

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        patient_id: bill?.patient_id || '',
        diagnosis: bill?.diagnose_bill?.[0] ? {
            id: bill.diagnose_bill[0].id,
            diagnose_id: bill.diagnose_bill[0].diagnose_id,
            item_name: bill.diagnose_bill[0].item_name,
            amount: bill.diagnose_bill[0].amount,
            diagnose: { value: bill.diagnose_bill[0].diagnose_id, label: `${bill.diagnose_bill[0].diagnose?.diagnose_code} - ${bill.patient_name}`}
        } : { id: null, diagnose_id: null, item_name: '', amount: '', diagnose: null },
        prescriptions: bill?.prescription_bills?.length > 0 ? bill?.prescription_bills?.map(p => ({
            id: p.id,
            prescription_id: p.prescription_id,
            item_name: p.item_name,
            quantity: p.prescription.quantity,
            amount: p.amount,
            prescription: { value: p.prescription_id, label: `${p.prescription?.prescription_code} - ${p.item_name}`}
        })) : [{ id: null, prescription_id: null, item_name: '', amount: '', prescription: null }],
        administrative_fee: bill?.admin_fee || '',
        total_amount: bill?.total_amount || '',
        status: bill?.status || ''
    });

    const handleAddItem = () => {
        setData('prescriptions', [...data.prescriptions, { id: null, item_name: '', prescription_id: null, amount: '', prescription: null }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...data.prescriptions];
        newItems.splice(index, 1);
        setData('prescriptions', newItems);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...data.prescriptions];
        let parsedValue = value;

        if (field === 'amount') {
            parsedValue = value === '' ? 0 : parseFloat(value);
        }

        (newItems[index] as any)[field] = parsedValue;
        setData('prescriptions', newItems);
    };

    const handlePrescriptionChange = (index: number, selectedOption: any) => {
        const newItems = [...data.prescriptions];
        newItems[index] = { 
            ...newItems[index], 
            prescription: selectedOption, 
            prescription_id: selectedOption?.value || null, 
            item_name: selectedOption?.medicine_name || '', 
            amount: selectedOption?.medicine_price || '' };
        setData('prescriptions', newItems);
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
                toast.success(`patient bill data has been ${bill ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${bill ? 'update' : 'save'} patient bill data.`);
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
                toast.success('Patient bill data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete patient bill data.');
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {bill ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add Patient Bill
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Patient Bill Form</DialogTitle>
                    <DialogDescription>
                        {bill ? 'Update patient bill information' : 'Fill out the form to add a new patient bill request'}
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
                                    bill ? { label: `${bill.patient_number} - ${bill.patient_name}`, value: bill.patient_id } : null
                                }
                                loadOptions={getPatient}
                                isClearable
                                placeholder="Select Patient..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Patient not found'}
                                loadingMessage={() => 'Loading patients data...'}
                                onChange={(selectedOption: any) => {
                                    setData('patient_id', selectedOption.value)
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
                            <InputError message={errors.patient_id} className="mt-1" />
                        </Label>
                        <h5 className="text-[14.3px] -mb-2">Diagnosis</h5>
                        <div className="space-y-2 mt-2 border p-3 rounded-md mb-3 relative">
                            <Label className="flex flex-col gap-1 cursor-text">
                                Diagnosis
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions
                                    value={data.diagnosis.diagnose}
                                    loadOptions={getDiagnose}
                                    isClearable
                                    placeholder="Select diagnosis..."
                                    isLoading={loading}
                                    noOptionsMessage={() => 'Diagnosis not found'}
                                    loadingMessage={() => 'Loading diagnoses data...'}
                                    onChange={(selectedOption: any) => {
                                        setData('diagnosis', { ...data.diagnosis, diagnose: selectedOption, diagnose_id: selectedOption?.value || null, item_name: selectedOption?.label.split(' - ')[1] || '' })
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
                                <InputError message={errors['diagnosis.diagnose_id']} className="mt-1" />
                            </Label>
                            <Label className="flex flex-col gap-1 cursor-text">
                                Item Name
                                <Input type="text" placeholder="Item Name" value={data.diagnosis.item_name} onChange={e => setData('diagnosis', { ...data.diagnosis, item_name: e.target.value })} />
                                <InputError message={errors['diagnosis.item_name']} className="mt-1" />
                            </Label>
                            <Label className="flex flex-col gap-1 cursor-text">
                                Amount
                                <Input type="number" min={0} placeholder="Amount" value={data.diagnosis.amount} onChange={e => setData('diagnosis', { ...data.diagnosis, amount: e.target.value })} />
                                <InputError message={errors['diagnosis.amount']} className="mt-1" />
                            </Label>
                        </div>
                        <h5 className="text-[14.3px] -mb-2">Prescriptions</h5>
                        <div className="flex flex-col">
                            {data.prescriptions.map((prescription_item: PrescriptionBill, index: number) => (
                                <div key={index} className="space-y-2 mt-2 border p-3 rounded-md mb-3 relative">
                                    <h5 className="text-[14.3px] font-bold">Item {index + 1}</h5>
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        <h6>Prescription</h6>
                                        <AsyncSelect
                                            cacheOptions
                                            defaultOptions
                                            value={prescription_item.prescription}
                                            loadOptions={getPrescription}
                                            isClearable
                                            placeholder="Select prescription..."
                                            isLoading={loading}
                                            noOptionsMessage={() => 'Prescription not found'}
                                            loadingMessage={() => 'Loading prescriptions data...'}
                                            onChange={(selectedOption: any) => handlePrescriptionChange(index, selectedOption)}
                                            id={`async-select-prescription-${index}`}
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
                                        <InputError message={errors[`prescriptions.${index}.prescription_id`]} className="mt-1" />
                                    </Label>
                                    <Label className="flex flex-col gap-1 mt-2.5 cursor-text">
                                        <h6>Item Name</h6>
                                        <Input type="text" placeholder="Item Name" value={prescription_item.item_name} onChange={e => handleItemChange(index, 'item_name', e.target.value)} />
                                        <InputError message={errors[`prescriptions.${index}.item_name`]} className="mt-1" />
                                    </Label>
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        <h6>Quantity</h6>
                                        <Input type="number" min={0} placeholder="Quantity" value={prescription_item.quantity} readOnly />
                                    </Label>
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        <h6>Amount</h6>
                                        <Input type="number" min={0} placeholder="Amount" value={prescription_item.amount} onChange={e => handleItemChange(index, 'amount', e.target.value)} />
                                        <InputError message={errors[`prescriptions.${index}.amount`]} className="mt-1" />
                                    </Label>
                                    {data.prescriptions.length > 1 && (
                                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(index)} className="absolute top-1 right-1 -mt-3 -mr-3 size-6 rounded-full hover:!bg-red-900 cursor-pointer">
                                            <Minus size={14} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-2">
                            <Button type="button" variant="outline" className="w-full cursor-pointer" onClick={handleAddItem}>
                                <Plus className="mr-2 size-4" /> Add Prescription
                            </Button>
                        </div>
                        <Label className="flex flex-col mt-2 gap-1 cursor-text">
                            Administrative Fee
                            <Input type="number" min={0} placeholder="Administrative Fee" value={data.administrative_fee} onChange={e => setData('administrative_fee', e.target.value)} />
                            <InputError message={errors.administrative_fee} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Status
                            <Select value={bill?.status} onValueChange={value => setData('status', value)}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusType.map((status) => (
                                        <SelectItem key={status.value} value={status.value} className="cursor-pointer">{status.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Total Amount
                            <Input type="number" value={data.total_amount} readOnly />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {bill && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('patientBillData.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the patient bill data from the server.</AlertDialogDescription>
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
                                    {Can('patientBillData.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {bill ? 'Update' : 'Save'}
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