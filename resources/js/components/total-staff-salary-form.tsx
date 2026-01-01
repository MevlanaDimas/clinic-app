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
import { StaffSalary, TotalStaffSalary } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Minus, Plus, UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/staffSalaryCosts";
import { toast } from "sonner";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface TotalStaffSalaryFormProps {
    salary?: TotalStaffSalary;
    id?: number;
}

export const TotalStaffSalaryForm = ({ salary, id }: TotalStaffSalaryFormProps) => {
    const method = salary ? 'patch' : 'post';
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

    const getStafSalaries = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);
        try {
            const { data } = await axios.get('/staff-salary/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch staff salary data');
        }
    }

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        bill_id: salary?.bill_id || '',
        notes: salary?.notes || '',
        salaries: salary?.salaries?.length > 0 ? salary.salaries?.map(s => ({
            id: s.id,
            staff_id: s.staff_salary_id,
            staff: { value: s.staff_salary_id, label: `${s.staff_name} (${s.staff_position})`}
        })) : [{ id: null, staff_salary_id: null, staff: null }]
    });

    const handleAddStaffSalary = () => {
        setData('salaries', [...data.salaries, { id: null, staff_id: null, staff: null }]);
    }

    const handleRemoveStaffSalary = (index: number) => {
        const newSalaries = [...data.salaries];
        newSalaries.splice(index, 1);
        setData('salaries', newSalaries);
    }

    const handleStaffSalaryChange = (index: number, value: any) => {
        const newSalaries = [...data.salaries];
        newSalaries[index] = {
            ...newSalaries[index],
            staff_id: value ? value.value : null,
            staff: value,
        };
        setData('salaries', newSalaries);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`Staff salary payment data has been ${salary ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${salary ? 'update' : 'save'} staff salary payment data.`);
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {salary ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <UserRoundPlus className="mr-2 size-4" />
                        Add Staff Salary Payment Data
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Staff Salary Form</DialogTitle>
                    <DialogDescription>
                        {salary ? 'Update staff salary payment information.' : 'Fill out the form to add a new staff salary payment data.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div>
                                Bill <span className="text-xs font-bold">(Optional)</span>
                            </div>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                defaultValue={salary ? { label: salary.bill_number, value: salary.bill_id} : null}
                                loadOptions={getBills}
                                isClearable
                                placeholder="Select bill..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Bill not found'}
                                loadingMessage={() => 'Loading bills data...'}
                                onChange={(selectedOption:any) => {
                                    setData('bill_id', selectedOption ? selectedOption.value : null);
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
                            <InputError message={errors.bill_id} className="mt-1" />
                        </Label>
                        <div className="flex flex-col">
                            <h5 className="-mb-2 text-[14.3px]">Staff Salary</h5>
                            {data.salaries.map((staffSalary: StaffSalary, index: number) => (
                                <div key={index} className="space-y-2 mt-2 border p-3 rounded-md mb-3 relative">
                                    <Label className="flex flex-col gap-1 cursor-text">
                                        <h6>Staff</h6>
                                        <AsyncSelect
                                            cacheOptions
                                            defaultOptions
                                            value={staffSalary.staff}
                                            loadOptions={getStafSalaries}
                                            isClearable
                                            placeholder="Select staff salary..."
                                            isLoading={loading}
                                            noOptionsMessage={() => 'Staff salary not found'}
                                            loadingMessage={() => 'Loading staff salary data...'}
                                            onChange={(selectedOption: any) =>
                                                handleStaffSalaryChange(index, selectedOption)
                                            }
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
                                        <InputError message={errors[`salaries[${index}.staff_id`]} className="mt-1" />
                                    </Label>
                                    {data.salaries.length > 1 && (
                                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveStaffSalary(index)} className="absolute top-1 right-1 -mt-3 -mr-3 size-6 rounded-full cursor-pointer hover:!bg-red-900">
                                            <Minus size={14} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <div className="mt-2">
                                <Button type="button" variant="outline" className="w-full cursor-pointer" onClick={handleAddStaffSalary}>
                                    <Plus className="mr-2 size-4" /> Add Staff
                                </Button>
                            </div>
                        </div>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div className="flex flex-row gap-1">
                                <h5>Notes</h5><span className="text-xs font-bold">(optional)</span>
                            </div>
                            <Textarea id="notes" name="notes" placeholder="Notes (optional)" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                            <InputError message={errors.notes} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {salary && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('staffPaidData.delete') && <Button type="button" variant="destructive" className="cursor-pointer hover:!bg-red-900">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the staff salary payment data from the server.</AlertDialogDescription>
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
                                    {Can('staffPaidData.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {salary ? 'Update' : 'Save'}
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