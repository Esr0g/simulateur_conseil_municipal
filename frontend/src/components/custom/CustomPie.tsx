import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/charts"
import type { CSP } from "@/models/commune"
import { Label, Pie, PieChart } from "recharts"

export interface PieProps {
    data: CSP | undefined,
    nb_conseillers: number | null,
    color1: string,
    color2: string
}

export default function CustomPie({ data, nb_conseillers, color1, color2 }: PieProps) {
    const chartConfig = {
        elus: {
            label: data?.libelle_csp,
        },
        0: {
            label: data?.libelle_csp,
        },
        1: {
            label: "Elus",
        },
    } satisfies ChartConfig

    const chartData = [
        { val: 0, elus: data?.nb_conseillers_csp, fill: color1 },
        { val: 1, elus: nb_conseillers && data ? nb_conseillers - data.nb_conseillers_csp : 0, fill: color2 }
    ]

    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[200px]"
        >
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={chartData}
                    dataKey="elus"
                    nameKey="val"
                    innerRadius={50}
                    strokeWidth={5}
                >
                    <Label
                        content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                    <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                    >
                                        <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="fill-foreground text-3xl font-bold"
                                        >
                                            {data ? data.nb_conseillers_csp : 0}
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground"
                                        >
                                            Elus
                                        </tspan>
                                    </text>
                                )
                            }
                        }}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
    )
}