import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Can } from '@/lib/can';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Label, Legend } from 'recharts';

interface MonthlyData {
    month: string;
    total_cost?: number;
    total_amount?: number;
}

const chartConfig = {
    total_cost: {
        label: 'Total Cost',
        color: "hsl(210 40% 85%)", // Light Blue
    },
    total_amount: {
        label: 'Total Amount',
        color: "hsl(210 40% 65%)", // Darker Light Blue
    },
} satisfies ChartConfig

export default function FinanceChart({ chartData }: { chartData: MonthlyData[] }) {
    return (
        <ChartContainer config={chartConfig} className='min-h-[400px] w-full bg-white p-4 rounded-lg shadow' id="bar-chart">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis 
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('id-ID', { month: 'short' });
                    }}
                >
                    <Label value="Month" offset={-15} position="insideBottom" />
                </XAxis>
                <YAxis
                    tickFormatter={(value) => `Rp ${Number(value) / 1000}k`}
                >
                    <Label value="Amount" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} dx={-20} />
                </YAxis>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '35px' }} />
                <Bar dataKey="total_cost" fill="var(--color-total_cost)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total_amount" fill="var(--color-total_amount)" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ChartContainer>
    );
}