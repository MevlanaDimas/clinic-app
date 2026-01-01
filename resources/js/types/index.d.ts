import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    subMenu: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    position: string;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    photo_url: string;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Permission {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface StaffSalary {
    id: number;
    name: string;
    position: 'director' | 'manager' | 'head of medical staff' | 'doctor' | 'nurse' | 'pharmacist' | 'medical record staff' | 'head of administration and support staff' | 'admin' | 'cleaning staff' | 'security staff';
    staff_monthly_salary: number;
    staff_in_user: User;
    staff_id: number | null;
    email: string | null;
    monthly_salary: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface TotalStaffSalary {
    id: number;
    employee_payroll_id: string;
    bill_number: number | null;
    total_amount: number;
    notes: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Marketing {
    id: number;
    marketing_id: string;
    bill_number: string;
    name: string;
    amount: number;
    description: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface MedicalWaste {
    id: number;
    medical_waste_id: string;
    bill_number: string;
    name: string;
    amount: number;
    description: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface UtilityCosts {
    id: number;
    utility_id: string;
    bill_number: string;
    notes: string;
    total_amount: number;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Utility {
    id: number;
    name: string;
    amount: number;
    description: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Supplier {
    id: number;
    name: string;
    contact_person: string;
    email: string;
    phone_number: string;
    address: string;
    created_at: string;
    updated_at: string;
}

export interface Inventory {
    id: number;
    name: string;
    supplier_id: number;
    supplier_name: string;
    supplier_contact_person: string;
    supplier_email: string;
    supplier_phone_number: string;
    supplier_address: string;
    type: 'medicine' | 'equipment';
    quantity: number;
    created_at: string;
    updated_at: string;
}

export interface PurchaseRequest {
    id: number;
    purchase_request_id: string;
    bill_number: string;
    requester_id: number;
    requester_name: string;
    total_amount: number;
    status: 'pending' | 'approved' | 'rejected';
    required_by_date: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface PurchaseRequestItem {
    id: number;
    request_number: string;
    requester_name: string;
    purchase_request_id: string;
    item_name: string;
    inventory_id: number;
    supplier_id: number;
    supplier_name: string;
    supplier_contact_person: string;
    supplier_email: string;
    supplier_phone_number: string;
    supplier_address: string;
    delivery: RequestedItemDeliveryStatus;
    type: 'medicine' | 'equipment';
    quantity: number;
    price_per_unit: number;
    reason: string;
    total_price: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface DeliveryStatus {
    status: 'pending' | 'on_delivery' | 'delivered' | 'rejected' | 'returned';
    delivery_service: string;
    tracking_number: string;
    estimated_delivery_time_in_days: number;
    rejected_reason: string;
    returned_reason: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface RequestedItemDeliveryStatus {
    id: number;
    request_item_id: number;
    delivery_status: DeliveryStatus[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Bill {
    id: number;
    bill_number: string;
    total_amount: number;
    status: 'paid' | 'unpaid' | 'pending';
    notes: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Medicine {
    id: number;
    inventory_id: number;
    name: string;
    manufacturer: string;
    form: 'Tablets' | 'Capsules' | 'Powders and Granules' | 'Lozenges' | 'Suppositories' | 'Solutions' | 'Elixirs' | 'Suspensions' | 'Drops' | 'Ointments' | 'Creams' | 'Gels' | 'Pastes' | 'Inhalers' | 'Aerosols' | 'Nebulizers' | 'Implants' | 'Transdemal Patches' | 'Oral Films'| 'Other';
    delivery_systems: 'Oral' | 'Parenteral' | 'Topical' | 'Inhalation' | 'Transdermal';
    strength: number;
    strength_units: 'mg' | 'ml' | 'µg' | 'g';
    batch_number: number;
    quantity_in_stock: number;
    expiry_date: string;
    sell_price_per_unit: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Patient {
    id: number;
    patient_number: number;
    patient_name: string;
    age: number;
    blood_type: 'A' | 'B' | 'AB' | 'O';
    sex: 'Male' | 'Female';
    date_of_birth: string;
    phone_number: string;
    address: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Registration {
    id: number;
    patient_id: number;
    patient_number?: string;
    patient_name?: string;
    doctor_id: number;
    doctor?: string;
    queue_number: string;
    status: 'done' | 'on_process' | 'cancelled';
    patient_health_data: PatientHealthData | null;
    created_at: string;
    updated_at: string;
}

export interface PatientHealthData {
    id: number;
    patient_id: number;
    created_at: string;
    updated_at: string;
    systolic_bp: number;
    diastolic_bp: number;
    heart_rate: number;
    oxygen_saturation: number;
    temperature: number;
    height: number;
    weight: number;
    complaints: string;
    [key: string]: unknown;
}

export interface Diagnose {
    id: number;
    diagnose_code: string;
    patient_id: number;
    patient_name: string;
    patient_number: string;
    doctor_id: number;
    doctor: string;
    diagnosis: string;
    treatment: string;
    prescription: Prescription[];
    notes: string;
    created_at: string;
    updated_at: string;
}

export interface Prescription {
    id: number;
    prescription_code: string;
    paid_status: 'paid' | 'unpaid' | 'partially_paid';
    doctor_name: string;
    patient_name: string;
    medicines_id: number;
    medicine_name: string;
    medicine_manufacturer: string;
    medicine_form: string;
    medicine_delivery_system: string;
    medicine_strength: number;
    medicine_strength_unit: 'mg' | 'ml' | 'µg' | 'g';
    medicine_batch_number: number;
    medicine_quantity_in_stock: number;
    medicine_expiry_date: string;
    medicine_sell_price_per_unit: number;
    diagnosis_id: number;
    diagnosis_code: string;
    medicine: string; // This was correct, but now it matches the resource key.
    diagnose: Diagnose;
    dosage: string;
    quantity: number;
    status: 'done' | 'on_process' | 'recalled';
    instructions: string;
    created_at: string;
    updated_at: string;
}

export interface DiagnoseBill {
    id: number;
    item_name: string;
    diagnose_id: number;
    diagnose: Diagnose[];
    amount: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface PrescriptionBill {
    id: number;
    item_name: string;
    prescription_id: number;
    prescription: Prescription[];
    quantity: number;
    amount: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface PatientBill {
    id: number;
    bill_code: string;
    patient_name: string;
    patient_age: number;
    patient_sex: 'Male' | 'Female';
    patient_address: string;
    patient_phone_number: string;
    diagnose_bill: DiagnoseBill[];
    prescription_bill: PrescriptionBill[];
    admin_fee: number;
    total_amount: number;
    status: 'paid' | 'unpaid' | 'cancelled';
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Links {
    url: string;
    label: string;
    active: boolean;
}

export interface Meta {
    current_page: number;
    from: number;
    last_page: number;
    links: Links[];
    path: string;
    per_page: number;
    to: number;
    total: number
}