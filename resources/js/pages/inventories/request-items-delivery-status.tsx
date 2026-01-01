import { CustomPagination } from '@/components/custom-pagination';
import { RequestedItemDeliveryStatusForm } from '@/components/request-item-delivery-status';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Can } from '@/lib/can';
import { handlePerPageChange } from '@/lib/utils';
import { index } from '@/routes/purchaseDeliveryStatus';
import { PurchaseRequestItem, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Clock, PackageCheck, TextSearch, Truck, Undo2, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Purchase Request Data',
        href: index().url,
    },
];

export default function DeliveryItemIndex() {
    const { items }: any = usePage().props;
    const meta = items.meta;
    const path = meta?.path;
    const [search, setSearch] = useState('');

    const searchData = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(path, { search: search }, { preserveState: true, replace: true });
    }

    const clearSearch = () => {
        setSearch('');
        router.get(path, { search: '' }, { preserveState: true, replace: true });
    }

    const deliveryStatus = (status: string) => {
        if (status === 'pending'){
            return (
                <Clock className='size-5 text-yellow-500 mx-auto' />
            )
        } else if (status === 'on_delivery'){
            return (
                <Truck className='size-5 text-yellow-500 mx-auto' />
            )
        } else if (status === 'delivered'){
            return (
                <PackageCheck className='size-5 text-green-500 mx-auto' />
            )
        } else if (status === 'rejected'){
            return (
                <X className='size-5 text-red-500 mx-auto' />
            )
        } else if (status === 'returned'){
            return (
                <Undo2 className='size-5 text-red-500 mx-auto' />
            )
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Requested Items Delivery Status" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={searchData} className="w-full md:w-1/3">
                        <div className="relative">
                            <TextSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Search delivery status..."
                                onChange={(e) => setSearch(e.target.value)}
                                value={search}
                                className="pl-9"
                            />
                            {search && (
                                <button type="button" onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </form>
                    {meta && (
                        <div className='flex flex-row items-center gap-3'>
                            <span className='text-sm'>Row per page:</span>
                            <Select onValueChange={(value) => handlePerPageChange(parseInt(value), path)} defaultValue={String(meta.per_page)}>
                                <SelectTrigger className='w-[80px] cursor-pointer'>
                                    <SelectValue placeholder="Row" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='25' className='cursor-pointer'>25</SelectItem>
                                    <SelectItem value='50' className='cursor-pointer'>50</SelectItem>
                                    <SelectItem value='100' className='cursor-pointer'>100</SelectItem>
                                    <SelectItem value='-1' className='cursor-pointer'>All</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className='border-b bg-muted'>
                            <TableRow>
                                <TableHead className="w-10 text-center">No</TableHead>
                                <TableHead className='text-center'>Request Number</TableHead>
                                <TableHead className='text-center'>Requester</TableHead>
                                <TableHead className='text-center'>Purchase Request Id</TableHead>
                                <TableHead className='text-center'>Item Name</TableHead>
                                <TableHead className='text-center'>Supplier</TableHead>
                                <TableHead className='text-center'>Supplier Contact Person Name</TableHead>
                                <TableHead className='text-center'>Supplier Email</TableHead>
                                <TableHead className='text-center'>Supplier Phone Number</TableHead>
                                <TableHead className='text-center'>Supplier Address</TableHead>
                                <TableHead className='text-center'>Quantity</TableHead>
                                <TableHead className='text-center'>Status</TableHead>
                                <TableHead className='text-center'>Delivery Service</TableHead>
                                <TableHead className='text-center'>Tracking Number</TableHead>
                                <TableHead className='text-center'>Estimated Delivery Time (days)</TableHead>
                                <TableHead className='text-center'>Rejected Reason</TableHead>
                                <TableHead className='text-center'>Returned Reason</TableHead>
                                <TableHead className='text-center'>Created At</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.data.length > 0 ? (
                                items.data.map((item: PurchaseRequestItem, index: number) => (
                                    <TableRow key={item.id} className="transition-colors hover:bg-muted/50">
                                        <TableCell className="text-center">{meta ? meta.from + index : index + 1}</TableCell>
                                        <TableCell className="text-center">{item.request_number}</TableCell>
                                        <TableCell className='text-center'>
                                            {item.requester_name}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.purchase_request_id}
                                        </TableCell>
                                        <TableCell className='text-center'>{item.item_name}</TableCell>
                                        <TableCell className='text-center'>{item.supplier_name}</TableCell>
                                        <TableCell className='text-center'>{item.supplier_contact_person}</TableCell>
                                        <TableCell className='text-center'>{item.supplier_email}</TableCell>
                                        <TableCell className='text-center'>{item.supplier_phone_number}</TableCell>
                                        <TableCell className='text-center'>{item.supplier_address}</TableCell>
                                        <TableCell className='text-center'>{item.quantity}</TableCell>
                                        <TableCell className="text-center">
                                            {deliveryStatus(item.delivery?.status)}
                                        </TableCell>
                                        <TableCell className='text-center'>{item.delivery?.delivery_service}</TableCell>
                                        <TableCell className='text-center'>{item.delivery?.tracking_number}</TableCell>
                                        <TableCell className="text-center">{item.delivery?.estimated_delivery_time_in_days}</TableCell>
                                        <TableCell className="text-center">{item.delivery?.rejected_reason}</TableCell>
                                        <TableCell className="text-center">{item.delivery?.returned_reason}</TableCell>
                                        <TableCell className="text-center">{item.delivery?.created_at}</TableCell>
                                        <TableCell className="flex flex-row items-center justify-center gap-5 text-center">
                                            {Can('purchaseDeliveryStatus.edit') && <RequestedItemDeliveryStatusForm item={item} requestedItemId={item.id} />}
                                        </TableCell>
                                    </TableRow>
                                ))) : (
                                    <TableRow>
                                        <TableCell colSpan={19} className="text-center">
                                            No item found.
                                        </TableCell>
                                    </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {meta && (
                    <div>
                        <CustomPagination meta={meta} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}