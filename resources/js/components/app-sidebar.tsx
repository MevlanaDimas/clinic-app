import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarContentRef,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import {
    BookUser,
    Users,
    LayoutGrid,
    ListChecks,
    BadgeCheck,
    Shield,
    ClipboardPenLine,
    BriefcaseMedical,
    Tablets,
    Warehouse,
    ShoppingCart,
    IdCard,
    Receipt,
    ReceiptText,
    SendHorizonal,
    HandCoins,
    Landmark,
    Recycle,
    UtilityPole,
    ChartColumn,
    Megaphone
} from 'lucide-react';
import { useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { index as patientIndex } from '@/routes/patient';
import { index as registrationIndex } from '@/routes/registration';
import { index as userIndex } from '@/routes/user';
import { index as roleIndex } from '@/routes/role';
import { index as permissionIndex } from '@/routes/permission';
import { index as medicineIndex } from '@/routes/medicine';
import { index as diagnoseIndex } from '@/routes/diagnose';
import { index as prescriptionIndex } from '@/routes/prescription';
import { index as inventoryIndex } from '@/routes/inventory';
import { index as purchaseIndex } from '@/routes/purchase';
import { index as supplierIndex } from '@/routes/supplier';
import { index as purchaseDeliveryIndex } from '@/routes/purchaseDeliveryStatus';
import { index as staffSalaryIndex } from '@/routes/staffSalary';
import { index as staffSalaryCostsIndex } from '@/routes/staffSalaryCosts';
import { index as marketingIndex } from '@/routes/marketings';
import { index as medicalWasteIndex } from '@/routes/medicalWaste';
import { index as billsIndex } from '@/routes/bills';
import { index as utilityCostIndex } from '@/routes/utilityCost';
import { index as patientBillIndex } from '@/routes/totalPatientBill';
import { index as financeManagementIndex } from '@/routes/financeManagement';
import AppLogo from './app-logo';

const superAdminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        subMenu: 'Administration'
    },
    {
        title: 'User Management',
        href: userIndex(),
        icon: Users,
        subMenu: 'Administration'
    },
    {
        title: 'Permissions Management',
        href: permissionIndex(),
        icon: Shield,
        subMenu: 'Administration'
    },
    {
        title: 'Roles Management',
        href: roleIndex(),
        icon: BadgeCheck,
        subMenu: 'Administration'
    },
    {
        title: 'Finance Chart',
        href: financeManagementIndex(),
        icon: ChartColumn,
        subMenu: 'Finance'
    },
    {
        title: 'Staff Salary Data',
        href: staffSalaryIndex(),
        icon: HandCoins,
        subMenu: 'Finance'
    },
    {
        title: 'Staff Salary Management',
        href: staffSalaryCostsIndex(),
        icon: Landmark,
        subMenu: 'Finance'
    },
    {
        title: 'Marketing Management',
        href: marketingIndex(),
        icon: Megaphone,
        subMenu: 'Finance'
    },
    {
        title: 'Medical Waste Management',
        href: medicalWasteIndex(),
        icon: Recycle,
        subMenu: 'Finance'
    },
    {
        title: 'Utility Costs Management',
        href: utilityCostIndex(),
        icon: UtilityPole,
        subMenu: 'Finance'
    },
    {
        title: 'Suppliers Data',
        href: supplierIndex(),
        icon: IdCard,
        subMenu: 'Procurement'
    },
    {
        title: 'Inventories Management',
        href: inventoryIndex(),
        icon: Warehouse,
        subMenu: 'Procurement'
    },
    {
        title: 'Purchase Request Management',
        href: purchaseIndex(),
        icon: ShoppingCart,
        subMenu: 'Procurement'
    },
    {
        title: 'Purchase Delivery Data',
        href: purchaseDeliveryIndex(),
        icon: SendHorizonal,
        subMenu: 'Procurement'
    },
    {
        title: 'Bill Management',
        href: billsIndex(),
        icon: Receipt,
        subMenu: 'Finance'
    },
    {
        title: 'Medicines Management',
        href: medicineIndex(),
        icon: BriefcaseMedical,
        subMenu: 'Medical'
    },
    {
        title: 'Patients Data',
        href: patientIndex(),
        icon: BookUser,
        subMenu: 'Medical'
    },
    {
        title: 'Patients Registration',
        href: registrationIndex(),
        icon: ListChecks,
        subMenu: 'Medical'
    },
    {
        title: "Diagnose",
        href: diagnoseIndex(),
        icon: ClipboardPenLine,
        subMenu: 'Medical'
    },
    {
        title: "Prescription Data",
        href: prescriptionIndex(),
        icon: Tablets,
        subMenu: 'Medical'
    },
    {
        title: 'Patient Bill Data',
        href: patientBillIndex(),
        icon: ReceiptText,
        subMenu: 'Finance'
    }
];

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        subMenu: 'Administration'
    },
    {
        title: 'Users Management',
        href: userIndex(),
        icon: Users,
        subMenu: 'Administration'
    },
    {
        title: 'Permission Management',
        href: permissionIndex(),
        icon: Shield,
        subMenu: 'Administration'
    },
    {
        title: 'Roles Management',
        href: roleIndex(),
        icon: BadgeCheck,
        subMenu: 'Administration'
    },
    {
        title: 'Staff Salary Data',
        href: staffSalaryIndex(),
        icon: HandCoins,
        subMenu: 'Finance'
    },
    {
        title: 'Suppliers Data',
        href: supplierIndex(),
        icon: IdCard,
        subMenu: 'Procurement'
    },
    {
        title: 'Inventories Management',
        href: inventoryIndex(),
        icon: Warehouse,
        subMenu: 'Procurement'
    },
    {
        title: 'Purchase Request Management',
        href: purchaseIndex(),
        icon: ShoppingCart,
        subMenu: 'Procurement'
    },
    {
        title: 'Purchase Delivery Data',
        href: purchaseDeliveryIndex(),
        icon: SendHorizonal,
        subMenu: 'Procurement'
    },
    {
        title: 'Bill Management',
        href: billsIndex(),
        icon: Receipt,
        subMenu: 'Finance'
    },
    {
        title: 'Patient Bill Data',
        href: patientBillIndex(),
        icon: ReceiptText,
        subMenu: 'Finance'
    }
];

const financeNavItems: NavItem[] = [
    {
        title: 'Finance Chart',
        href: financeManagementIndex(),
        icon: ChartColumn,
        subMenu: 'Finance'
    },
    {
        title: 'Bill Management',
        href: billsIndex(),
        icon: Receipt,
        subMenu: 'Finance'
    },
    {
        title: 'Staff Salary Management',
        href: staffSalaryCostsIndex(),
        icon: Landmark,
        subMenu: 'Finance'
    },
    {
        title: 'Marketing Management',
        href: marketingIndex(),
        icon: Megaphone,
        subMenu: 'Finance'
    },
    {
        title: 'Medical Waste Management',
        href: medicalWasteIndex(),
        icon: Recycle,
        subMenu: 'Finance'
    },
    {
        title: 'Utility Costs Management',
        href: utilityCostIndex(),
        icon: UtilityPole,
        subMenu: 'Finance'
    },
    {
        title: 'Patient Bill Data',
        href: patientBillIndex(),
        icon: ReceiptText,
        subMenu: 'Finance'
    },
    {
        title: 'Suppliers Data',
        href: supplierIndex(),
        icon: IdCard,
        subMenu: 'Procurement'
    },
    {
        title: 'Inventories Management',
        href: inventoryIndex(),
        icon: Warehouse,
        subMenu: 'Procurement'
    },
    {
        title: 'Purchase Request Management',
        href: purchaseIndex(),
        icon: ShoppingCart,
        subMenu: 'Procurement'
    },
];

const doctorNavItems: NavItem[] = [
    {
        title: 'Patients Data',
        href: patientIndex(),
        icon: BookUser,
        subMenu: 'Medical'
    },
    {
        title: 'Patients Registration',
        href: registrationIndex(),
        icon: ListChecks,
        subMenu: 'Medical'
    },
    {
        title: "Diagnose",
        href: diagnoseIndex(),
        icon: ClipboardPenLine,
        subMenu: 'Medical'
    },
    {
        title: 'Medicines Management',
        href: medicineIndex(),
        icon: BriefcaseMedical,
        subMenu: 'Medical'
    },
    {
        title: "Prescription Data",
        href: prescriptionIndex(),
        icon: Tablets,
        subMenu: 'Medical'
    },
];

const nurseNavItems: NavItem[] = [
    {
        title: 'Patients Data',
        href: patientIndex(),
        icon: BookUser,
        subMenu: 'Medical'
    },
    {
        title: 'Patients Registration',
        href: registrationIndex(),
        icon: ListChecks,
        subMenu: 'Medical'
    },
];

const pharmacistNavItems: NavItem[] = [
    {
        title: 'Medicines Management',
        href: medicineIndex(),
        icon: BriefcaseMedical,
        subMenu: 'Medical'
    },
    {
        title: 'Patients Data',
        href: patientIndex(),
        icon: BookUser,
        subMenu: 'Medical'
    },
    {
        title: "Prescription Data",
        href: prescriptionIndex(),
        icon: Tablets,
        subMenu: 'Medical'
    },
];


export function AppSidebar() {
    const { auth }: any = usePage().props;
    const sidebarContentRef = useRef<SidebarContentRef>(null);
    const userRoles = auth.user?.roles.map((role: any) => role.name.toLowerCase()) || [];

    const isSuperAdmin = userRoles.includes('super admin');
    const isAdmin = userRoles.includes('admin');
    const isFinance = userRoles.includes('finance');
    const isDoctor = userRoles.includes('doctor');
    const isNurse = userRoles.includes('nurse');
    const isPharmacist = userRoles.includes('pharmacist');

    useEffect(() => {
        const sidebar = sidebarContentRef.current;
        if (!sidebar) return;

        const scrollKey = 'sidebarScrollPos';

        // Restore scroll position on component mount
        const savedScrollPosition = sessionStorage.getItem(scrollKey);
        if (savedScrollPosition) {
            sidebar.scrollTop = parseInt(savedScrollPosition, 10);
        }

        // Save scroll position on scroll
        const handleScroll = () => {
            sessionStorage.setItem(scrollKey, sidebar.scrollTop.toString());
        };

        sidebar.addEventListener('scroll', handleScroll);

        return () => sidebar.removeEventListener('scroll', handleScroll);
    }, []);

    const getNavItemsForRoles = (): NavItem[] => {
        const combinedItems: NavItem[] = [];
        const addedTitles = new Set<string>();

        const addItems = (items: NavItem[]) => {
            items.forEach(item => {
                if (!addedTitles.has(item.title)) {
                    combinedItems.push(item);
                    addedTitles.add(item.title);
                }
            });
        };

        if (isSuperAdmin) {
            addItems(superAdminNavItems);
        }
        if (isAdmin) {
            addItems(adminNavItems);
        }
        if (isFinance) {
            addItems(financeNavItems);
        }
        if (isDoctor) {
            addItems(doctorNavItems);
        }
        if (isNurse) {
            addItems(nurseNavItems);
        }
        if (isPharmacist) {
            addItems(pharmacistNavItems);
        }

        return combinedItems.length > 0 ? combinedItems : superAdminNavItems; // Fallback to default
    };

    const navItems = getNavItemsForRoles();

    const groupedNavItems = navItems.reduce((acc, item) => {
        const group = item.subMenu || 'General';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(item);
        return acc;
    }, {} as Record<string, NavItem[]>);


    return (
        <Sidebar className='mx-2'>
            <SidebarHeader>
                <Link href={dashboard()} className="flex items-center gap-2">
                    <AppLogo />
                </Link>
                <h2 className='flex h-5 mt-2 items-center px-2 rounded-md text-md uppercase tracking-wider text-foreground font-medium'>Main Menu</h2>
            </SidebarHeader>

            <SidebarContent ref={sidebarContentRef} scroll-region className="flex flex-col gap-4">
                {Object.entries(groupedNavItems).map(([groupTitle, items]) => (
                    <NavMain key={groupTitle} item_title={groupTitle} items={items} />
                ))}
            </SidebarContent>
        </Sidebar>
    );
}
