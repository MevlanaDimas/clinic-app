import { CustomPagination } from '@/components/custom-pagination';
import { Input } from '@/components/ui/input';
import { RequestItemForm } from '@/components/request-item-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Can } from '@/lib/can';
import { handlePerPageChange } from '@/lib/utils';
import { showRequestItem } from '@/routes/purchase/requestItems';
import { PurchaseRequestItem, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { MoveLeft, TextSearch, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/purchase';


export default function RequestItems() {
    const { requestItems, purchaseRequest }: any = usePage().props;
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Requested Items',
            href: showRequestItem(purchaseRequest.data.id).url
        },
    ];
    
    const meta = requestItems.meta;
    const path = meta?.path;
    const [search, setSearch] = useState('');

    const formatCurrency = (amount: number, locale = 'id-ID', currency = 'IDR') => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    const searchData = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(path, { search: search }, { preserveState: true, replace: true });
    }

    const clearSearch = () => {
        setSearch('');
        router.get(path, { search: '' }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Requested Items" />
            <div className="p-5">
                <div className='flex flex-row justify-between items-center mb-4'>
                    <Button asChild variant="outline">
                        <Link href={index().url}>
                            <MoveLeft className="mr-2 size-4" />
                            Back
                        </Link>
                    </Button>
                    {Can('requestItem.create') && <RequestItemForm purchaseRequestId={purchaseRequest.data.id} />}
                </div>
            </div>
            {purchaseRequest ? (
                <div className='w-full grid grid-cols-3 items-center mx-10'>
                    <div className='flex flex-col gap-2'>
                        <div className='flex flex-row items-center'>
                            <h3>ID :</h3><p className='text-sm'>{purchaseRequest.data.purchase_request_id}</p>
                        </div>
                        <div className='flex flex-row items-center'>
                            <h3>Requester :</h3><p className='text-sm'>{purchaseRequest.data.requester_name}</p>
                        </div>
                        <div className='flex flex-row items-center'>
                            <h3>Requester Email :</h3><p className='text-sm'>{purchaseRequest.data.requester_email}</p>
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <div className='flex flex-row items-center'>
                            <h3>Status :</h3><p className='text-sm'>{purchaseRequest.data.status}</p>
                        </div>
                        <div className='flex flex-row items-center'>
                            <h3>Required on :</h3><p className='text-sm'>{purchaseRequest.data.required_by_date}</p>
                        </div>
                        <div className='flex flex-row items-center'>
                            <h3>Total Amount :</h3><p className='text-sm'>{formatCurrency(purchaseRequest.data.total_amount)}</p>
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <div className='flex flex-col items-start justify-start text-start'>
                            <h3>Notes :</h3><p className='text-sm'>"{purchaseRequest.data.notes ? purchaseRequest.data.notes : '-'}"</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='w-full text-center justify-center items-center'>
                    <h5>Purchase Request Data not Found.</h5>
                </div>
            )}
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl mx-5 mt-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={searchData} className="w-full md:w-1/3">
                        <div className="relative">
                            <TextSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Search requested items..."
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
                                <TableHead className='text-center'>Item Name</TableHead>
                                <TableHead className='text-center'>Supplier</TableHead>
                                <TableHead className='text-center'>Supplier Contact Person Name</TableHead>
                                <TableHead className='text-center'>Supplier Email</TableHead>
                                <TableHead className='text-center'>Supplier Phone Number</TableHead>
                                <TableHead className='text-center'>Supplier Address</TableHead>
                                <TableHead className='text-center'>Type</TableHead>
                                <TableHead className='text-center'>Quantity</TableHead>
                                <TableHead className='text-center'>Price/Unit</TableHead>
                                <TableHead className='text-center'>Total Price</TableHead>
                                <TableHead className='text-center'>Reason</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requestItems.data.length > 0 ? (
                                requestItems.data.map((item: PurchaseRequestItem, index: number) => (
                                    <TableRow key={item.id} className="transition-colors hover:bg-muted/50">
                                        <TableCell className="text-center">{meta ? meta.from + index : index + 1}</TableCell>
                                        <TableCell className="text-center">{item.request_number}</TableCell>
                                        <TableCell className="text-center">{item.item_name}</TableCell>
                                        <TableCell className="text-center">{item.supplier_name}</TableCell>
                                        <TableCell className="text-center">{item.supplier_contact_person}</TableCell>
                                        <TableCell className="text-center">{item.supplier_email}</TableCell>
                                        <TableCell className='text-center'>{item.supplier_phone_number}</TableCell>
                                        <TableCell className='text-balance'>{item.supplier_address}</TableCell>
                                        <TableCell className="text-center">{item.type}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-center">{formatCurrency(item.price_per_unit)}</TableCell>
                                        <TableCell className="text-center">{formatCurrency(item.total_price)}</TableCell>
                                        <TableCell className="text-center">{item.reason}</TableCell>
                                        <TableCell className="flex flex-row items-center justify-center gap-5 text-center">
                                            <RequestItemForm requestItem={item} purchaseRequestId={purchaseRequest.data.id} />
                                        </TableCell>
                                    </TableRow>
                                ))) : (
                                    <TableRow>
                                        <TableCell colSpan={14} className="text-center">
                                            No request items data found.
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