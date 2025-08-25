// Financial calculation utilities based on code.py
export interface FinancialParams {
  startDate: string;
  eePopulation: number;
  eePopulationCAGR: number;
  activationRate: number;
  adoptionRate: number;
  utilisationRate: number;
  monthlyRevenuePerUser: number;
  grossMargin: number;
  monthlyOpex: number;
  investmentPeriodLength: number;
  investmentMonthlyOpex: number;
  rampUpPeriodLength: number;
  steadyStateSimulationLength: number;
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
  dates: Date[];
}



// IRR calculation with improved Newton-Raphson method and fallbacks
function calculateIRR(cashFlows: number[]): number {
  const maxIterations = 1000;
  const tolerance = 1e-10;
  const minRate = -0.99; // Minimum rate to prevent division by zero
  const maxRate = 10.0;   // Maximum rate to prevent extreme values
  
  // Helper function to calculate NPV
  function calculateNPV(rate: number): number {
    let npv = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + rate, i);
    }
    return npv;
  }
  
  // Helper function to calculate NPV derivative
  function calculateNPVDerivative(rate: number): number {
    let dnpv = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      if (i > 0) {
        dnpv -= i * cashFlows[i] / Math.pow(1 + rate, i + 1);
      }
    }
    return dnpv;
  }
  
  // Try multiple initial guesses to improve convergence
  const initialGuesses = [-0.5, -0.2, -0.1, 0.0, 0.1, 0.2, 0.5, 1.0];
  
  for (const initialGuess of initialGuesses) {
    let rate = initialGuess;
    let converged = false;
    
    for (let i = 0; i < maxIterations; i++) {
      const npv = calculateNPV(rate);
      
      if (Math.abs(npv) < tolerance) {
        converged = true;
        break;
      }
      
      const dnpv = calculateNPVDerivative(rate);
      
      // Check if derivative is too small (would cause instability)
      if (Math.abs(dnpv) < tolerance) {
        break;
      }
      
      // Newton-Raphson step
      const newRate = rate - npv / dnpv;
      
      // Apply bounds to prevent extreme values
      const boundedRate = Math.max(minRate, Math.min(maxRate, newRate));
      
      // Check for convergence
      if (Math.abs(boundedRate - rate) < tolerance) {
        rate = boundedRate;
        converged = true;
        break;
      }
      
      rate = boundedRate;
    }
    
    if (converged) {
      return rate;
    }
  }
  
  // If Newton-Raphson fails, use bisection method as fallback
  return calculateIRRBisection(cashFlows);
}

// Fallback bisection method for IRR calculation
function calculateIRRBisection(cashFlows: number[]): number {
  const tolerance = 1e-10;
  const maxIterations = 1000;
  
  // Helper function to calculate NPV
  function calculateNPV(rate: number): number {
    let npv = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + rate, i);
    }
    return npv;
  }
  
  let lowerBound = -0.99;
  let upperBound = 10.0;
  
  // Find bounds where NPV changes sign
  let npvLower = calculateNPV(lowerBound);
  let npvUpper = calculateNPV(upperBound);
  
  // If both have same sign, try to find better bounds
  if (npvLower * npvUpper > 0) {
    // Try expanding the search range
    for (let testRate = -0.95; testRate <= 5.0; testRate += 0.1) {
      const npvTest = calculateNPV(testRate);
      if (npvLower * npvTest < 0) {
        upperBound = testRate;
        npvUpper = npvTest;
        break;
      } else if (npvUpper * npvTest < 0) {
        lowerBound = testRate;
        npvLower = npvTest;
        break;
      }
    }
  }
  
  // If we still can't find a sign change, return a reasonable estimate
  if (npvLower * npvUpper > 0) {
    // If all cash flows are negative, IRR doesn't exist (return very negative value)
    if (cashFlows.every(cf => cf <= 0)) {
      return -0.99;
    }
    // If all cash flows are positive, IRR is very high
    if (cashFlows.every(cf => cf >= 0)) {
      return 10.0;
    }
    // Otherwise, return 0 as a neutral estimate
    return 0.0;
  }
  
  // Bisection method
  for (let i = 0; i < maxIterations; i++) {
    const midRate = (lowerBound + upperBound) / 2;
    const npvMid = calculateNPV(midRate);
    
    if (Math.abs(npvMid) < tolerance || Math.abs(upperBound - lowerBound) < tolerance) {
      return midRate;
    }
    
    if (npvLower * npvMid < 0) {
      upperBound = midRate;
      npvUpper = npvMid;
    } else {
      lowerBound = midRate;
      npvLower = npvMid;
    }
  }
  
  return (lowerBound + upperBound) / 2;
}

export function calculateFinancials(params: FinancialParams): FinancialResults {
  const {
    startDate,
    eePopulation,
    eePopulationCAGR,
    activationRate,
    adoptionRate,
    utilisationRate,
    monthlyRevenuePerUser,
    grossMargin,
    monthlyOpex,
    investmentPeriodLength,
    investmentMonthlyOpex,
    rampUpPeriodLength,
    steadyStateSimulationLength,
    terminalMultiple
  } = params;

  const monthlyGrossProfitPerUser = monthlyRevenuePerUser * grossMargin;
  const conversionRate = activationRate * adoptionRate * utilisationRate;
  
  const totalMonths = investmentPeriodLength + rampUpPeriodLength + steadyStateSimulationLength;
  
  const revenues: number[] = [];
  const cogs: number[] = [];
  const opex: number[] = [];
  const ebitda: number[] = [];
  const utilisingUsersList: number[] = [];
  const eePopulationList: number[] = [];
  
  // Calculate EE population growth with configurable CAGR
  for (let i = 0; i < totalMonths; i++) {
    const yearsSinceStart = i / 12;
    eePopulationList.push(eePopulation * Math.pow(1 + eePopulationCAGR, yearsSinceStart));
  }
  
  // Investment period: no revenue, just opex
  for (let i = 0; i < investmentPeriodLength; i++) {
    revenues.push(0);
    cogs.push(0);
    opex.push(investmentMonthlyOpex);
    utilisingUsersList.push(0);
  }
  
  // Ramp-up period: revenue grows linearly, population grows with CAGR
  for (let i = 0; i < rampUpPeriodLength; i++) {
    const idx = investmentPeriodLength + i;
    const currentPopulation = eePopulationList[idx];
    const utilisingUsers = currentPopulation * conversionRate;
    const monthlyRevenue = monthlyRevenuePerUser * utilisingUsers;
    const monthlyGrossProfit = monthlyRevenue * grossMargin;
    
    const rampFactor = i / rampUpPeriodLength;
    revenues.push(rampFactor * monthlyRevenue);
    cogs.push(rampFactor * (monthlyRevenue - monthlyGrossProfit));
    opex.push(monthlyOpex);
    utilisingUsersList.push(rampFactor * utilisingUsers);
  }
  
  // Steady state: full revenue, population continues to grow with CAGR
  for (let i = 0; i < steadyStateSimulationLength; i++) {
    const idx = investmentPeriodLength + rampUpPeriodLength + i;
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
  const terminalEbitda = ebitda[terminalMonth] * 12;
  const terminalValue = terminalEbitda * terminalMultiple;
  
  // Create cash flows including terminal value
  const cashFlows = [...ebitda];
  cashFlows[terminalMonth] += terminalValue;
  
  // Calculate IRR
  console.log(cashFlows)
  console.log(calculateIRR(cashFlows))
  const irr = (1+calculateIRR(cashFlows)) ** 12 - 1;
  
  // Create months, years, and dates arrays
  const months = Array.from({ length: revenues.length }, (_, i) => i);
  const years = months.map(m => m / 12);
  
  // Generate dates starting from the provided start date
  const dates = months.map(monthIndex => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + monthIndex);
    return date;
  });
  
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
    years,
    dates
  };
}

export function formatCurrency(value: number): string {
  if (value < 0) {
    return `-£${Math.abs(value).toLocaleString()}`;
  }
  return `£${value.toLocaleString()}`;
}

export function formatCurrencyWithDecimals(value: number): string {
  if (value < 0) {
    return `-£${Math.abs(value).toFixed(2)}`;
  }
  return `£${value.toFixed(2)}`;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}
