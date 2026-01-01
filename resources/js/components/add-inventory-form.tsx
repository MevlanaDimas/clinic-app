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
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import { PackagePlus } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import InputError from "./input-error";
import { store } from "@/routes/inventory";
import { toast } from "sonner";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { Can } from "@/lib/can";

export const AddInventoryForm = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const getRequestItem = async (inputValue: string) => {
        if(!inputValue) return [];
        setLoading(true);

        try {
            const { data } = await axios.get('purchase/get-json', {
                params: {
                    search: inputValue
                }
            })
            setLoading(false);
            return data;
        } catch {
            setLoading(false);
            toast.error('Failed to fetch request item data.');
        }
    }

    const {setData, post, processing, errors, reset, clearErrors} = useForm({
        request_item_id: ''
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const commonCallbacks = {
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(`Inventory data has been saved successfully.`);
            },
            onError: () => {
                toast.error(`Failed to save inventory data.`);
            },
        };

        post(store().url, commonCallbacks);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button variant="outline" className="cursor-pointer">
                    <PackagePlus className="mr-2 size-4" />
                    Add Inventory Data
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Staff Salary Form</DialogTitle>
                    <DialogDescription>
                        Fill out the form to add a inventory data.
                        Fill out the form to add an inventory data.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        <Label className="flex flex-col gap-1 cursor-text">
                            Requested Item
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                defaultValue={null}
                                loadOptions={getRequestItem}
                                isClearable
                                placeholder="Select requested item..."
                                isLoading={loading}
                                noOptionsMessage={() => 'Requested item not found'}
                                loadingMessage={() => 'Loading requested item data...'}
                                onChange={(selectedOption: any) => {
                                    setData('request_item_id', selectedOption.value)
                                }}
                                id="async-select-request_item"
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
                            <InputError message={errors.request_item_id} className="mt-1" />
                        </Label>
                        <DialogFooter className="gap-2 pt-4">
                            <div className="flex justify-end w-full">
                                <div className="flex gap-2 justify-between items-center">
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary" className="cursor-pointer">Cancel</Button>
                                    </DialogClose>
                                    {Can('inventories.create') && <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer" disabled={processing}>
                                        Save
                                    </button>}
                                </div>
                            </div>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};