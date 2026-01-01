import { router, useForm } from "@inertiajs/react";
import { status as registrationStatus } from "@/routes/registration"
import { toast } from "sonner";
import { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog";
import { Button } from "./ui/button";
import { SquareCheckBig } from "lucide-react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import InputError from "./input-error";
import { Can } from "@/lib/can";


interface PatientRegistrationStatusFormProps {
    id: number;
    status: string;
}

export const StatusForm = ({ id, status }: PatientRegistrationStatusFormProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const statusOptions = [
        { label: 'Done', value: 'done' },
        { label: 'On Process', value: 'on_process' },
        { label: 'Cancelled', value: 'cancelled' },
    ]

    const {data, setData, patch, processing, errors, reset, clearErrors} = useForm({
        id: id,
        status: status
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                router.reload();
                toast.success('Registration status has been updated successfully.');
            },
            onError: () => {
                toast.error('Failed to update registration status');
            }
        };

        patch(registrationStatus(id).url, commonCallbacks);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                    <SquareCheckBig size={16} />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Update Status</DialogTitle>
                    <DialogDescription>
                        Update patient registration status
                    </DialogDescription>
                </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                            <Label className="flex flex-col gap-1 cursor-pointer">
                                Status
                                <Select value={data.status} onValueChange={value => setData('status', value)}>
                                    <SelectTrigger className="w-full cursor-pointer">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status.value} value={status.value} className="cursor-pointer">
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} className="mt-1" />
                            </Label>
                            <DialogFooter className="gap-2 pt-4">
                                <div className="flex justify-between w-full">
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary" className="cursor-pointer">Cancel</Button>
                                    </DialogClose>
                                    {Can('patientRegist.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        Submit
                                    </Button>}
                                </div>
                            </DialogFooter>
                        </form>
                    </div>
            </DialogContent>
        </Dialog>
    )
}