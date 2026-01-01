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
import { StaffSalary } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/staffSalary";
import { toast } from "sonner";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface StaffSalaryFormProps {
    staffSalary?: StaffSalary;
    id?: number;
}

export const StaffSalaryForm = ({ staffSalary, id }: StaffSalaryFormProps) => {
    const method = staffSalary ? 'patch' : 'post';
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const staffPositions = [
        { label: 'Director', value: 'director' },
        { label: 'Manager', value: 'manager' },
        { label: 'Head of Medical Staff', value: 'head of medical staff' },
        { label: 'Doctor', value: 'doctor' },
        { label: 'Nurse', value: 'nurse' },
        { label: 'Pharmacist', value: 'pharmacist' },
        { label: 'Medical Record Staff', value: 'medical record staff' },
        { label: 'Head of Administration and Support Staff', value: 'head of administration and support staff' },
        { label: 'Admin', value: 'admin' },
        { label: 'Cleaning Staff', value: 'cleaning staff' },
        { label: 'Security Staff', value: 'security staff' }
    ]

    const getUsers = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);
        try {
            const { data } = await axios.get('/users/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch users');
        }
    }

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        name: staffSalary?.name || '',
        position: staffSalary?.position || '',
        user_id: staffSalary?.staff_in_user.id || '',
        monthly_salary: staffSalary?.staff_monthly_salary || ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`Staff salary data has been ${staffSalary ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${staffSalary ? 'update' : 'save'} staff salary data.`);
            },
        };

        if (method === 'post') {
            // console.log(data);
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
                toast.success('Staff salary data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete staff salary data.');
            },
            preserveState: false, // To ensure the page reloads and the deleted item is gone
        });
    }

    console.log(data);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {staffSalary ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add Staff Salary
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Staff Salary Form</DialogTitle>
                    <DialogDescription>
                        {staffSalary ? 'Update staff salary information' : 'Fill out the form to add a new staff salary'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Name
                            <Input type="text" id="name" name="name" placeholder="User Name" value={data.name} onChange={e => setData('name', e.target.value)} />
                            <InputError message={errors.name} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-pointer">
                            Position
                            <Select value={data.position} onValueChange={value => setData('position', value)}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="Select Position" />
                                </SelectTrigger>
                                <SelectContent className="max-h-56">
                                    {staffPositions.map((position) => (
                                        <SelectItem key={position.value} value={position.value} className="cursor-pointer">{position.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.position} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div>
                                User <span className="text-xs font-bold">(Optional)</span>
                            </div>
                            <AsyncSelect 
                                defaultOptions
                                defaultValue={staffSalary ? { label: staffSalary.staff_in_user.name, value: staffSalary.staff_in_user.id } : null}
                                loadOptions={getUsers}
                                isClearable
                                placeholder="Select user..."
                                isLoading={loading}
                                noOptionsMessage={() => 'User not found'}
                                loadingMessage={() => 'Loading users data...'}
                                onChange={(selectedOption:any) => {
                                    setData('user_id', selectedOption ? selectedOption.value : null);
                                }}
                                id="async-select-user"
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
                            <InputError message={errors.user_id} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Monthly Salary
                            <Input type="number" id="monthly_salary" name="monthly_salary" placeholder="Monthly Salary" value={data.monthly_salary} onChange={e => setData('monthly_salary', e.target.value)} />
                            <InputError message={errors.monthly_salary} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {staffSalary && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('staffSalaryData.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the staff salary data from the server.</AlertDialogDescription>
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
                                    {Can('staffSalaryData.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {staffSalary ? 'Update' : 'Save'}
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