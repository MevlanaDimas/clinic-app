import logo from '@/../../public/1.png';
import { DiagnoseBill, PrescriptionBill } from '@/types';
import { Head, usePage } from '@inertiajs/react';

// Note: If using TypeScript, rename this file to print-invoice.tsx and define the Bill interface.
export default function PrintInvoice() {
    const { bill } = usePage().props;

    const handlePrint = () => {
        window.print();
    };

    // Access the data property from the resource wrapper
    const invoice = bill.data;

    return (
        <>
            <Head title={`Invoice #${invoice.bill_code}`} />
            
            <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white">
                <div className="bg-white p-10 max-w-3xl mx-auto shadow-lg print:shadow-none print:m-0 print:max-w-full print:w-full rounded-lg">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">INVOICE</h1>
                            <p className="text-gray-600 mt-1">#{invoice.bill_code}</p>
                            <div className="mt-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {invoice.status}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <img src={logo} alt="Clinic Logo" className='w-50 mb-3' />
                            <p className="text-gray-600">123 Health Street</p>
                            <p className="text-gray-600">Wellness City</p>
                            <p className="text-gray-600 mt-2">
                                Date: {invoice.created_at}
                            </p>
                        </div>
                    </div>

                    {/* Patient Details */}
                    <div className="mb-10 border-b border-gray-200 pb-6">
                        <h3 className="text-gray-500 uppercase tracking-wide text-xs font-bold mb-3">Bill To:</h3>
                        <div className="text-gray-800">
                            <p className="text-xl font-bold">{invoice.patient_name}</p>
                            <p className="text-gray-600">{invoice.patient_address}</p>
                            <p className="text-gray-600 mt-1">Patient ID: <span className="font-mono">{invoice.patient_number}</span></p>
                        </div>
                    </div>

                    {/* Bill Items */}
                    <table className="w-full mb-10">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 text-gray-600 font-bold uppercase text-xs tracking-wider">Description</th>
                                <th className="text-right py-3 text-gray-600 font-bold uppercase text-xs tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {/* Diagnosis Items */}
                            {invoice.diagnose_bill?.map((item: DiagnoseBill, index: number) => (
                                <tr key={`diag-${index}`} className="border-b border-gray-100 last:border-0">
                                    <td className="py-3 text-gray-800">
                                        <div className="font-medium">Diagnosis</div>
                                        {item.diagnose?.doctor && (
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                Dr. {item.diagnose.doctor}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 text-right text-gray-800 font-medium">
                                        Rp {Number(item.amount).toLocaleString()}
                                    </td>
                                </tr>
                            ))}

                            {/* Prescription Items */}
                            {invoice.prescription_bills?.map((item: PrescriptionBill, index: number) => (
                                <tr key={`presc-${index}`} className="border-b border-gray-100 last:border-0">
                                    <td className="py-3 text-gray-800">
                                        <div className="font-medium">{item.item_name}</div>
                                        {item.prescription && (
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                Qty: {item.prescription.quantity}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 text-right text-gray-800 font-medium">
                                        Rp {Number(item.amount).toLocaleString()}
                                    </td>
                                </tr>
                            ))}

                            {/* Administrative Fee */}
                            <tr className="border-b border-gray-100 last:border-0">
                                <td className="py-3 text-gray-800 font-medium">Administrative Fee</td>
                                <td className="py-3 text-right text-gray-800 font-medium">
                                    Rp {Number(invoice.admin_fee).toLocaleString()}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Total */}
                    <div className="flex justify-end mb-12">
                        <div className="text-right bg-gray-50 p-4 rounded-lg print:bg-transparent print:p-0">
                            <p className="text-gray-600 mb-1 text-sm">Total Amount</p>
                            <p className="text-3xl font-bold text-gray-900">
                                Rp {Number(invoice.total_amount).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    
                    {/* Footer Message */}
                    <div className="text-center text-gray-500 text-sm mb-10 print:block hidden">
                        <p>Thank you for choosing Vital Core Pharma.</p>
                    </div>

                    {/* Print Button (Hidden in Print) */}
                    <div className="text-center print:hidden flex justify-center space-x-4">
                        <button 
                            onClick={handlePrint} 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200 flex items-center cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Invoice
                        </button>
                        <button 
                            onClick={() => window.history.back()} 
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-6 rounded-lg shadow-sm transition duration-200 cursor-pointer"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// Ensure no layout is used for the print page
PrintInvoice.layout = page => page;
