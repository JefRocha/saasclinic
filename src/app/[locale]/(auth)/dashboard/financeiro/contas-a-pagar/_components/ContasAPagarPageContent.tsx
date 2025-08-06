'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format, addDays } from "date-fns";
//import { Calendar as CalendarIcon, DollarSign, AlertTriangle, Clock, Timer, Hourglass, Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarIcon, DollarSign, AlertTriangle, Clock, Timer, Hourglass } from "lucide-react";
import { DateRange } from "react-day-picker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from 'recharts';
import { useQuery } from "@tanstack/react-query";

import {
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
  PageContent,
} from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/libs/utils";
import { formatCurrency } from "@/helpers/format";
import { getContasAPagarDashboardData } from "@/actions/get-contas-a-pagar-dashboard-data";

export function ContasAPagarPageContent() {
  const t = useTranslations("ContasAPagarPage");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "area" | "composed">("bar");
  const [chartType2, setChartType2] = useState<"bar" | "line" | "pie" | "area" | "composed">("pie");
  const [isClient, setIsClient] = useState(false);

  // UseEffect para garantir que estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["contasAPagarDashboard", dateRange],
    queryFn: () => getContasAPagarDashboardData({
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString(),
    }),
  });

  // Dados fictícios para demonstração
  const mockData = {
    totalAPagar: 182500.00,
    vencidas: 25000.00,
    aVencer30Dias: 45000.00,
    aVencer60Dias: 52500.00,
    aVencer90Dias: 35000.00,
    aVencerMais90Dias: 25000.00
  };

  const chartData = [
    { name: 'Total a Pagar', valor: dashboardData?.totalAPagar || mockData.totalAPagar, fill: '#6b7280' },
    { name: 'Vencidas', valor: dashboardData?.vencidas || mockData.vencidas, fill: '#ef4444' },
    { name: 'Vencer 30 dias', valor: dashboardData?.aVencer30Dias || mockData.aVencer30Dias, fill: '#f59e0b' },
    { name: 'Vencer 60 dias', valor: dashboardData?.aVencer60Dias || mockData.aVencer60Dias, fill: '#3b82f6' },
    { name: 'Vencer 90 dias', valor: dashboardData?.aVencer90Dias || mockData.aVencer90Dias, fill: '#a855f7' },
    { name: 'Vencer +90 dias', valor: dashboardData?.aVencerMais90Dias || mockData.aVencerMais90Dias, fill: '#10b981' },
  ];

  const COLORS = chartData.map(item => item.fill);

  // Função para renderizar o gráfico baseado no tipo
  const renderChart = (type: "bar" | "line" | "pie" | "area" | "composed") => {
    if (!chartData || chartData.length === 0) return null;

    switch (type) {
      case "bar":
        return (
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="valor" name="Valor" fill="#8884d8" />
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="valor" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Area type="monotone" dataKey="valor" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </AreaChart>
        );
      case "composed":
        return (
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="valor" name="Valor" fill="#8884d8" />
            <Line type="monotone" dataKey="valor" stroke="#ff7300" strokeWidth={2} />
          </ComposedChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={chartData}
              dataKey="valor"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>{t("title")}</PageTitle>
          <PageDescription>{t("description")}</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        {/* Filtros e controles */}
        <div className="mb-4 flex items-center justify-between">
          {/* Filtro de período */}
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* Botão para abrir a lista */}
          <div className="flex items-center gap-4">
            <Button>Ver Lista de Contas a Pagar</Button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-6 gap-4 mb-4">
          {/* Card 1 - Total a Pagar */}
          <div className="bg-gray-400 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-base font-semibold text-white">Total a Pagar</h5>
              <DollarSign className="h-6 w-6 text-white opacity-80" />
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(dashboardData?.totalAPagar || mockData.totalAPagar)}</p>
          </div>
          {/* Card 2 - Vencidas */}
          <div className="bg-red-700 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-white">Vencidas</h3>
              <AlertTriangle className="h-6 w-6 text-white opacity-80" />
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(dashboardData?.vencidas || mockData.vencidas)}</p>
          </div>
          {/* Card 3 - Vencer 30 dias */}
          <div className="bg-yellow-700 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-white">Vencer 30 dias</h3>
              <Clock className="h-6 w-6 text-white opacity-80" />
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(dashboardData?.aVencer30Dias || mockData.aVencer30Dias)}</p>
          </div>
          {/* Card 4 - Vencer 60 dias */}
          <div className="bg-blue-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-white">Vencer 60 dias</h3>
              <Timer className="h-6 w-6 text-white opacity-80" />
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(dashboardData?.aVencer60Dias || mockData.aVencer60Dias)}</p>
          </div>
          {/* Card 5 - Vencer 90 dias */}
          <div className="bg-purple-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-white">Vencer 90 dias</h3>
              <Hourglass className="h-6 w-6 text-white opacity-80" />
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(dashboardData?.aVencer90Dias || mockData.aVencer90Dias)}</p>
          </div>
          {/* Card 6 - Vencer +90 dias */}
          <div className="bg-green-800 p-4 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-white">Vencer +90 dias</h3>
              <CalendarIcon className="h-6 w-6 text-white opacity-80" />
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(dashboardData?.aVencerMais90Dias || mockData.aVencerMais90Dias)}</p>
          </div>
        </div>

        {/* Área de Gráficos Dividida */}
        <div className="grid grid-cols-2 gap-4">
          {/* Gráfico 1 */}
          <div className="bg-white p-4 rounded-lg shadow">
            {/* Select do primeiro gráfico */}
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Visualização 1</h3>
              <Select onValueChange={(value: "bar" | "line" | "pie" | "area" | "composed") => setChartType(value)} value={chartType}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipo de Gráfico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Barras</SelectItem>
                  <SelectItem value="line">Linhas</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                  <SelectItem value="composed">Misto</SelectItem>
                  <SelectItem value="pie">Pizza</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Container do primeiro gráfico */}
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Carregando dados...</p>
                </div>
              ) : isClient && chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart(chartType)}
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico 2 */}
          <div className="bg-white p-4 rounded-lg shadow">
            {/* Select do segundo gráfico */}
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Visualização 2</h3>
              <Select onValueChange={(value: "bar" | "line" | "pie" | "area" | "composed") => setChartType2(value)} value={chartType2}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipo de Gráfico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Barras</SelectItem>
                  <SelectItem value="line">Linhas</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                  <SelectItem value="composed">Misto</SelectItem>
                  <SelectItem value="pie">Pizza</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Container do segundo gráfico */}
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Carregando dados...</p>
                </div>
              ) : isClient && chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart(chartType2)}
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Nenhum dado disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}