import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Users, Stethoscope, DollarSign, Activity } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
    },
};

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;

    const stats = [
        { title: 'Total Patients', value: '1,204', icon: Users, color: 'text-sky-500' },
        { title: 'Appointments Today', value: '32', icon: Stethoscope, color: 'text-emerald-500' },
        { title: 'Revenue This Month', value: 'Rp 12,450', icon: DollarSign, color: 'text-amber-500' },
        { title: 'Clinic Occupancy', value: '75%', icon: Activity, color: 'text-rose-500' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard">
                <meta name="description" content="Clinic Dashboard: Monitor total patients, daily appointments, monthly revenue, and clinic occupancy in real-time." />
            </Head>
            <div className="p-4 sm:p-6 lg:p-8">
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Welcome back, {auth.user.name.split(' ')[0]}!
                    </h1>
                    <p className="text-muted-foreground">
                        Here's a snapshot of your clinic's activity today.
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {stats.map((stat) => (
                        <motion.div key={stat.title} variants={itemVariants}>
                            <Card className="overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* You can add more components here, like recent appointments or patient lists */}
                <div className="mt-8">
                    {/* Example: <RecentAppointments /> */}
                </div>
            </div>
        </AppLayout>
    );
}
