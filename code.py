import numpy as np
import numpy_financial as npf

ee_population = 2260000

activation_rate = 0.75
adoption_rate = 0.36
utilisation_rate = 0.1

monthly_revenue_per_user = 4
gross_margin = 0.8

monthly_gross_profit_per_user = monthly_revenue_per_user * gross_margin

converstion_rate = activation_rate * adoption_rate * utilisation_rate

monthly_opex = 100000

investment_period_length = 12  # months
investment_monthly_opex = 100000

revenues = []
cogs = []
opex = []
ebitda = []
utilising_users_list = []

# Apply 10% CAGR to ee_population growth after investment period
total_months = investment_period_length + 12 + 4 * 12  # investment + ramp + steady
ee_population_list = []

for i in range(total_months):
    # After investment period, apply 10% CAGR to ee_population
    if i < investment_period_length:
        ee_population_list.append(ee_population)
    else:
        years_since_start = (i - investment_period_length) / 12
        ee_population_list.append(ee_population * (1.10**years_since_start))

# Investment period: no revenue, just opex
for i in range(investment_period_length):
    revenues.append(0)
    cogs.append(0)
    opex.append(investment_monthly_opex)
    utilising_users_list.append(0)

# Ramp-up period: revenue grows linearly, population grows with CAGR
for i in range(12):
    idx = investment_period_length + i
    current_population = ee_population_list[idx]
    utilising_users = current_population * converstion_rate
    monthly_revenue = monthly_revenue_per_user * utilising_users
    monthly_gross_profit = monthly_revenue * gross_margin

    ramp_factor = i / 12
    revenues.append(ramp_factor * monthly_revenue)
    cogs.append(ramp_factor * (monthly_revenue - monthly_gross_profit))
    opex.append(monthly_opex)
    utilising_users_list.append(ramp_factor * utilising_users)

# Steady state: full revenue, population continues to grow with CAGR
for i in range(4 * 12):
    idx = investment_period_length + 12 + i
    current_population = ee_population_list[idx]
    utilising_users = current_population * converstion_rate
    monthly_revenue = monthly_revenue_per_user * utilising_users
    monthly_gross_profit = monthly_revenue * gross_margin

    revenues.append(monthly_revenue)
    cogs.append(monthly_revenue - monthly_gross_profit)
    opex.append(monthly_opex)
    utilising_users_list.append(utilising_users)

for i in range(len(revenues)):
    cogs[i] = -cogs[i]
    opex[i] = -opex[i]
    ebitda.append(revenues[i] + cogs[i] + opex[i])

ebitda = np.array(ebitda)
utilising_users_array = np.array(utilising_users_list)

import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter


def pound_formatter(x, pos):
    if x < 0:
        return f"-£{abs(int(x)):,}"
    return f"£{int(x):,}"


# Plot financials
plt.figure(figsize=(12, 6))
months = np.arange(len(revenues))
years = months / 12
plt.plot(years, revenues, label="Revenues")
plt.plot(years, cogs, label="COGS")
plt.plot(years, opex, label="OPEX")
plt.plot(years, ebitda, label="EBITDA")
plt.xlabel("Year")
plt.ylabel("Amount")
plt.title("Revenues, COGS, OPEX, and EBITDA Over Time")
plt.legend()
plt.grid(True)

ax = plt.gca()
ax.yaxis.set_major_formatter(FuncFormatter(pound_formatter))

plt.show()

# Plot utilising users over time
plt.figure(figsize=(12, 4))
plt.plot(years, utilising_users_array, color="purple", label="Utilising Users")
plt.xlabel("Year")
plt.ylabel("Utilising Users")
plt.title("Utilising Users Over Time")
plt.grid(True)
plt.legend()
plt.tight_layout()
plt.show()

# Calculate terminal value at end of year 6 (i.e., month 72)
terminal_year = 6
terminal_month = terminal_year * 12 - 1
terminal_ebitda = ebitda[terminal_month]
# Assume a terminal multiple, e.g., 20x EBITDA
terminal_multiple = 20
terminal_value = terminal_ebitda * terminal_multiple

# Create cash flows including terminal value in month 72
cash_flows = ebitda.copy()
cash_flows[terminal_month] += terminal_value

irr = npf.irr(cash_flows)
print(
    f"Assuming sale value of {pound_formatter(terminal_value, None)} in year {terminal_year}"
)
print(f"IRR (including terminal value in year {terminal_year}): {irr:.2%}")
