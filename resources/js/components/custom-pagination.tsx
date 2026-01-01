import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { Meta } from '@/types';
import { cn } from '@/lib/utils';

interface CustomPaginationProps {
    meta: Meta;
}

export const CustomPagination = ({meta}: CustomPaginationProps
) => {
    return (
        <div>
            <Pagination aria-label="Page navigation">
                <PaginationContent className="w-full justify-center">
                    <PaginationItem className="flex flex-row justify-center gap-3">
                        {meta.links.filter((item) => !item.label.toLowerCase().includes('pagination')).map((item, index) => (
                        <PaginationLink key={index} href={item.url} isActive={item.active} className={cn('cursor-pointer rounded-md', { 'bg-accent text-accent-foreground': item.active })}>
                            {item.label.replace(/&laquo;|&raquo;/g, '')}
                        </PaginationLink>
                        ))}
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}