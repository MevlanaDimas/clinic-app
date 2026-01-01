import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { NavUser } from './nav-user';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="sticky top-0 grid grid-cols-3 h-16 shrink-0 items-center border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <SidebarTrigger className="h-8 w-9 bg-sidebar rounded-md cursor-pointer" />
            <div className="flex justify-center items-center gap-2">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="-col-start-1 justify-between items-center mr-4">
                <NavUser />
            </div>
        </header>
    );
}
