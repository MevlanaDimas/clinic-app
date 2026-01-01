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
import { Marketing } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { UserRoundPlus, View } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { destroy, store, update } from "@/routes/marketings";
import { toast } from "sonner";
import { Can } from "@/lib/can";
import { Button } from "./ui/button";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { Textarea } from "./ui/textarea";
import { Plus } from "lucide-react";

interface MarketingFormProps {
    item?: Marketing;
    id?: number;
}

export const MarketingForm = ({ item, id }: MarketingFormProps) => {
    const method = item ? 'patch' : 'post';
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

    const {data, setData, post, patch, processing, errors, reset, clearErrors} = useForm({
        bill_id: item?.bill_id || '',
        name: item?.name || '',
        amount: item?.amount || '',
        description: item?.description || ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonOptions = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                router.reload();
                toast.success(`Marketing data has been ${item ? 'updated' : 'saved'} successfully.`);
            },
            onError: () => {
                toast.error(`Failed to ${item ? 'update' : 'save'} marketing data.`);
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
                toast.success('Medical waste data has been deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete medical waste data.');
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {item ? (
                    <Button variant="secondary" size="icon" className="size-8 cursor-pointer">
                        <View size={16} />
                    </Button>
                ) : (
                    <Button variant="outline" className="cursor-pointer">
                        <Plus className="mr-2 size-4" />
                        Add New Item
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Marketing Form</DialogTitle>
                    <DialogDescription>
                        {item ? 'Update marketing information' : 'Fill out the form to add a new marketing'}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div>
                                Bill Number <span className="text-xs font-bold">(optional)</span>
                            </div>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                defaultValue={
                                    item ? { label: `${item.bill_number}`, value: item.bill_id } : null
                                }
                                loadOptions={getBills}
                                isClearable
                                placeholder="Select bill..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Bill not found'}
                                loadingMessage={() => 'Loading bills data...'}
                                onChange={(selectedOption: any) => {
                                    setData('bill_id', selectedOption.value)
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
                            <InputError message={errors.bill_id} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Name
                            <Input type="text" id="name" name="name" placeholder="Name" value={data.name} onChange={e => setData('name', e.target.value)} />
                            <InputError message={errors.name} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div>
                                Price
                            </div>
                            <Input type="number" min={0} id="amount" name="amount" placeholder="Price" value={data.amount} onChange={e => setData('amount', e.target.value)} />
                            <InputError message={errors.amount} className="mt-1" />
                        </Label>
                        <Label className="flex flex-col gap-1 cursor-text">
                            <div>
                                Description <span className="text-xs font-bold">(optional)</span>
                            </div>
                            <Textarea id="description" name="description" placeholder="Description" value={data.description} onChange={e => setData('description', e.target.value)} />
                            <InputError message={errors.description} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-between w-full">
                                <div>
                                    {item && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild disabled={processing}>
                                                {Can('marketingData.delete') && <Button type="button" variant="destructive" className="hover:!bg-red-900 cursor-pointer">Delete</Button>}
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This action cannot be undone. This will permanently delete the marketing data from the server.</AlertDialogDescription>
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
                                    {Can('marketingData.edit') && <Button type="submit" disabled={processing} className="cursor-pointer">
                                        {item ? 'Update' : 'Save'}
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