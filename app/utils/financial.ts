// Financial calculation utilities based on code.py

export interface FinancialParams {
  eePopulation: number;
  activationRate: number;
  adoptionRate: number;
  utilisationRate: number;
  monthlyRevenuePerUser: number;
  grossMargin: number;
  monthlyOpex: number;
  investmentPeriodLength: number;
  investmentMonthlyOpex: number;
  terminalMultiple: number;
}

export interface FinancialResults {
  revenues: number[];
  cogs: number[];
  opex: number[];
  ebitda: number[];
  utilisingUsers: number[];
  eePopulationList: number[];
  cashFlows: number[];
  irr: number;
  terminalValue: number;
  months: number[];
  years: number[];
}

// IRR calculation using Newton-Raphson method
function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
  const maxIterations = 100;
  const tolerance = 1e-6;
  
  let rate = guess;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;
    
    for (let j = 0; j < cashFlows.length; j++) {
      const factor = Math.pow(1 + rate, j);
      npv += cashFlows[j] / factor;
      dnpv -= j * cashFlows[j] / (factor * (1 + rate));
    }
    
    if (Math.abs(npv) < tolerance) {
      return rate;
    }
    
    if (Math.abs(dnpv) < tolerance) {
      break;
    }
    
    rate = rate - npv / dnpv;
  }
  
  return rate;
}

export function calculateFinancials(params: FinancialParams): FinancialResults {
  const {
    eePopulation,
    activationRate,
    adoptionRate,
    utilisationRate,
    monthlyRevenuePerUser,
    grossMargin,
    monthlyOpex,
    investmentPeriodLength,
    investmentMonthlyOpex,
    terminalMultiple
  } = params;

  const monthlyGrossProfitPerUser = monthlyRevenuePerUser * grossMargin;
  const conversionRate = activationRate * adoptionRate * utilisationRate;
  
  const totalMonths = investmentPeriodLength + 12 + 4 * 12; // investment + ramp + steady
  
  const revenues: number[] = [];
  const cogs: number[] = [];
  const opex: number[] = [];
  const ebitda: number[] = [];
  const utilisingUsersList: number[] = [];
  const eePopulationList: number[] = [];
  
  // Calculate EE population growth with 10% CAGR after investment period
  for (let i = 0; i < totalMonths; i++) {
    if (i < investmentPeriodLength) {
      eePopulationList.push(eePopulation);
    } else {
      const yearsSinceStart = (i - investmentPeriodLength) / 12;
      eePopulationList.push(eePopulation * Math.pow(1.10, yearsSinceStart));
    }
  }
  
  // Investment period: no revenue, just opex
  for (let i = 0; i < investmentPeriodLength; i++) {
    revenues.push(0);
    cogs.push(0);
    opex.push(investmentMonthlyOpex);
    utilisingUsersList.push(0);
  }
  
  // Ramp-up period: revenue grows linearly, population grows with CAGR
  for (let i = 0; i < 12; i++) {
    const idx = investmentPeriodLength + i;
    const currentPopulation = eePopulationList[idx];
    const utilisingUsers = currentPopulation * conversionRate;
    const monthlyRevenue = monthlyRevenuePerUser * utilisingUsers;
    const monthlyGrossProfit = monthlyRevenue * grossMargin;
    
    const rampFactor = i / 12;
    revenues.push(rampFactor * monthlyRevenue);
    cogs.push(rampFactor * (monthlyRevenue - monthlyGrossProfit));
    opex.push(monthlyOpex);
    utilisingUsersList.push(rampFactor * utilisingUsers);
  }
  
  // Steady state: full revenue, population continues to grow with CAGR
  for (let i = 0; i < 4 * 12; i++) {
    const idx = investmentPeriodLength + 12 + i;
    const currentPopulation = eePopulationList[idx];
    const utilisingUsers = currentPopulation * conversionRate;
    const monthlyRevenue = monthlyRevenuePerUser * utilisingUsers;
    const monthlyGrossProfit = monthlyRevenue * grossMargin;
    
    revenues.push(monthlyRevenue);
    cogs.push(monthlyRevenue - monthlyGrossProfit);
    opex.push(monthlyOpex);
    utilisingUsersList.push(utilisingUsers);
  }
  
  // Convert COGS and OPEX to negative values and calculate EBITDA
  for (let i = 0; i < revenues.length; i++) {
    cogs[i] = -cogs[i];
    opex[i] = -opex[i];
    ebitda.push(revenues[i] + cogs[i] + opex[i]);
  }
  
  // Calculate terminal value at end of year 6 (month 72)
  const terminalYear = 6;
  const terminalMonth = terminalYear * 12 - 1;
  const terminalEbitda = ebitda[terminalMonth];
  const terminalValue = terminalEbitda * terminalMultiple;
  
  // Create cash flows including terminal value
  const cashFlows = [...ebitda];
  cashFlows[terminalMonth] += terminalValue;
  
  // Calculate IRR
  const irr = calculateIRR(cashFlows);
  
  // Create months and years arrays
  const months = Array.from({ length: revenues.length }, (_, i) => i);
  const years = months.map(m => m / 12);
  
  return {
    revenues,
    cogs,
    opex,
    ebitda,
    utilisingUsers: utilisingUsersList,
    eePopulationList,
    cashFlows,
    irr,
    terminalValue,
    months,
    years
  };
}

export function formatCurrency(value: number): string {
  if (value < 0) {
    return `-£${Math.abs(value).toLocaleString()}`;
  }
  return `£${value.toLocaleString()}`;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}
