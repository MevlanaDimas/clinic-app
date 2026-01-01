import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({item_title, items = [] }: {item_title: string, items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-3">
            <SidebarGroupLabel className="px-3 text-xs uppercase tracking-wider text-muted-foreground">
                {item_title}
            </SidebarGroupLabel>
            <SidebarMenu className="mt-2">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={
                                page.url === (typeof item.href === 'string' ? item.href : item.href.url) ||
                                page.url.startsWith((typeof item.href === 'string' ? item.href : item.href.url) + '/')
                            }
                            tooltip={{ children: item.title }}
                            className="h-10 justify-start rounded-md data-[active=true]:bg-emerald-500/10 data-[active=true]:text-emerald-600 group-data-[collapsible=icon]:justify-center hover:bg-accent dark:data-[active=true]:bg-emerald-400/10 dark:data-[active=true]:text-emerald-400"
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon className="size-5" />}
                                <span className="text-sm font-medium">{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
