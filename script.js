// Chart Instance - Global Scope to be accessible by updateChart
let growthChart = null;

// Initial Setup and Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const initialInvestmentInput = document.getElementById('initial-investment');
    const monthlyContributionInput = document.getElementById('monthly-contribution');
    const interestRateInput = document.getElementById('interest-rate');
    const yearsInput = document.getElementById('years');
    const compoundFrequencySelect = document.getElementById('compound-frequency');
    const calculateBtn = document.getElementById('calculate-btn');

    // Auto-calculate on input change
    const currencyInputs = [initialInvestmentInput, monthlyContributionInput];
    const inputs = [initialInvestmentInput, monthlyContributionInput, interestRateInput, yearsInput, compoundFrequencySelect];

    // Add formatting listeners
    currencyInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const rawValue = e.target.value.replace(/[^0-9]/g, '');
            if (rawValue) {
                e.target.value = parseInt(rawValue).toLocaleString();
            }
            calculateAndRender();
        });
    });

    inputs.slice(2).forEach(input => { // Remaining inputs
        input.addEventListener('input', calculateAndRender);
    });

    calculateBtn.addEventListener('click', calculateAndRender);

    // Initial calculation
    calculateAndRender();

    function calculateAndRender() {
        // Parse with comma removal
        const principal = parseFloat(initialInvestmentInput.value.replace(/,/g, '')) || 0;
        const monthly = parseFloat(monthlyContributionInput.value.replace(/,/g, '')) || 0;
        const rate = parseFloat(interestRateInput.value) || 0;
        const years = parseInt(yearsInput.value) || 0;
        const frequency = parseInt(compoundFrequencySelect.value);

        if (years <= 0) return;

        const results = calculateCompoundInterest(principal, monthly, rate, years, frequency);
        updateUI(results);
        updateChart(results);
    }
});

function calculateCompoundInterest(p, pmnt, r, t, n) {
    // p: initial principal
    // pmnt: regular contribution
    // r: annual interest rate (percentage)
    // t: years
    // n: compound frequency per year

    const rateDecimal = r / 100;
    const data = [];
    let currentBalance = p;
    let totalPrincipal = p;
    const totalMonths = t * 12;

    // If compounding is monthly (n=12), we calculate easier.
    // If yearly (n=1), we assume contributions are still monthly but interest compounds yearly?
    // For simplicity in this general calculator:
    // We'll iterate month by month for contributions, and apply interest based on frequency.

    // Standard approach:
    // Monthly rate for contributions:
    // If n=12, monthly rate = r / 12 / 100.
    // If n=1, we verify logic.
    // Let's stick to a standard iteration where we add contribution and apply interest.

    // Simplified yearly snapshot for the chart/table
    let yearlyData = [];

    // Using iteration for accurate "end of month" contribution timing
    // Effective monthly rate depends on compounding frequency?
    // Actually, simple monthly compouding: rate/12. 
    // Yearly: effectively (1+r)^(1/12) - 1 per month? Or just interest at end of year?
    // Let's implement standard compounding formula logic.

    // A = P(1 + r/n)^(nt) + PMNT * [ (1 + r/n)^(nt) - 1 ] / (r/n)
    // *If PMNT is made at the end of each period*.
    // However, users usually select monthly contributions but might select yearly compounding.
    // To be precise and support the chart, let's just iterate monthly.

    let totalInterest = 0;

    for (let year = 1; year <= t; year++) {
        // Calculate for this year
        // We'll approximate for the graph points
        // Re-calcing from 0 to year 'i' using formula is safer to avoid drift,
        // but iteration is easier for "Total Principal" tracking.

        let yearStartBalance = currentBalance;
        let yearContribution = 0;
        let interestEarnedThisYear = 0;

        // Iterate months in this year
        for (let m = 0; m < 12; m++) {
            // Add contribution (assuming end of month for simplicity or beginning? Let's say beginning/during)
            // Common calculators often assume contribution is added, then interest triggers if freq matches.

            // Let's simple: Balance += Contribution. Then Interest.
            // But if compounding is yearly, interest only adds at month 12.

            currentBalance += pmnt;
            totalPrincipal += pmnt;
            yearContribution += pmnt;

            // Apply interest if applicable
            if (n === 12) {
                // Monthly compounding
                let interest = currentBalance * (rateDecimal / 12);
                currentBalance += interest;
                totalInterest += interest;
                interestEarnedThisYear += interest;
            } else if (n === 1 && m === 11) {
                // Yearly compounding (only at end of year)
                // Note: Average balance method or simple balance at end?
                // Standard: Balance * rateDecimal. 
                // BUT, contributions made during the year might not earn full year interest.
                // Simple approx: Interest on previous Year End Balance + some interest on contributions?
                // Let's stick to strictly: Interest happens at event.
                // If Yearly, event is Month 12. Base is calculate on what?
                // Valid yearly compound usually: PreviousBalance * (1+r) + Contributions accumulated...
                // Let's just use monthly compounding for 'Monthly' selection and Yearly for 'Yearly'.

                // For 'Yearly' freq:
                // We shouldn't calc interest every month.
                // At month 11 (december), we apply interest to the balance?
                // This is slightly inaccurate for contributions made in Jan vs Dec if we just do Balance * Rate.
                // Generally simple calculators might do: (BalanceBeforeInterest) * rateDecimal.
                let interest = (currentBalance - pmnt) * rateDecimal; // VERY ROUGH approx
                // Better: Iterate accurately. 
            }
        }

        if (n === 1) {
            // Correct Yearly Compounding logic:
            // Previous Balance grows by Rate
            // New Contributions: detailed calc or average?
            // Let's switch to Formula approach for Year 'i' to be distinct points.
            // Future Value of a Series...

            // To keep it clean and match the UI options:
            // Let's force monthly calculation for the loop to get the graph shape,
            // but adjust the rate application.
            // Actually, nearly all easy web calculators just use Monthly Compounding (n=12) by default
            // or provide the option. The option 'Yearly' usually implies interest hits once a year.

            // Let's do the Monthly Compounding logic as default/robust path (n=12),
            // And if n=1, we just aggregate interest at year end.
            let interest = (currentBalance - interestEarnedThisYear) * rateDecimal; // Logic is getting messy.
            // CLEAN RESET:
            // For this UI, let's assume standard "Monthly Compounding" if n=12.
        }

        // RE-WRITE with clean formula usage for each year marker to ensure accuracy.
        // Formula for Year 'y':
        // r_eff = rateDecimal / n;
        // periods = year * n;
        // FV_Principal = p * Math.pow(1 + r_eff, periods);
        // FV_Contributions = pmnt * (Math.pow(1 + r_eff, periods) - 1) / r_eff; 
        //  ^ This formula assumes pmnt is per compounding period. 
        //  If n=1 (Yearly) but pmnt is Monthly, the formula breaks.

        // HYBRID LOOP FIX:
        // We will maintain a running balance.
        // We have `currentBalance` tracking from previous years.
    }

    // implementation "Reset" for the loop
    currentBalance = p;
    totalPrincipal = p;
    totalInterest = 0;
    yearlyData = [];

    // Add Year 0
    yearlyData.push({
        year: 0,
        principal: p,
        interest: 0,
        balance: p,
        totalPrincipal: p
    });

    for (let i = 1; i <= t; i++) {
        let interestForYear = 0;

        // Simulate 12 months
        for (let m = 0; m < 12; m++) {
            currentBalance += pmnt;
            totalPrincipal += pmnt;

            if (n === 12) {
                let interest = currentBalance * (rateDecimal / 12);
                currentBalance += interest;
                totalInterest += interest;
                interestForYear += interest;
            }
        }

        if (n === 1) {
            // Yearly compounding: Apply to the balance at year end?
            // Standard simple model: (Balance before interest) * rate
            // But timing of contributions matters. 
            // Simplifying assumption: Contributions earn pro-rated or 0? 
            // Let's assume Interest is calculated on the Balance at start of year + ??
            // Let's use the most standard approach:
            // Interest = (BalancePriorToDecCalculations?)
            // Let's just stick to: Interest calc happens once at end of year on the whole pie.
            let interest = currentBalance * rateDecimal;
            currentBalance += interest;
            totalInterest += interest;
            interestForYear += interest;
        }

        yearlyData.push({
            year: i,
            totalPrincipal: totalPrincipal,
            interest: totalInterest,
            balance: currentBalance,
            yearInterest: interestForYear
        });
    }

    return yearlyData;
}

function updateUI(data) {
    const lastPoint = data[data.length - 1];

    document.getElementById('final-balance').textContent = formatMoney(lastPoint.balance);
    document.getElementById('total-principal').textContent = formatMoney(lastPoint.totalPrincipal);
    document.getElementById('total-interest').textContent = formatMoney(lastPoint.interest);

    // Table
    const tbody = document.getElementById('breakdown-body');
    tbody.innerHTML = '';

    // Show every year (or filter if too many?)
    // data[0] is year 0, start from year 1
    data.slice(1).forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.year}년차</td>
            <td>${formatMoney(row.totalPrincipal)}</td>
            <td>${formatMoney(row.yearInterest)}</td>
            <td>${formatMoney(row.interest)}</td>
            <td style="font-weight:bold; color:var(--accent-color)">${formatMoney(row.balance)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updateChart(data) {
    const ctx = document.getElementById('growthChart').getContext('2d');

    const labels = data.map(d => `${d.year}년`);
    const principalData = data.map(d => d.totalPrincipal);
    const interestData = data.map(d => d.balance); // We'll stack or overlap?
    // Better: Stacked Bar or Area?
    // Let's do filled line (Area) chart.
    // Dataset 1: Principal (Bottom)
    // Dataset 2: Interest (Top - actually Balance, so we fill between?)
    // ChartJS 'fill: true' often fills to bottom.
    // If we want Principal + Interest = Total, we can stack or just plot Total and Principal.

    // Strategy: Plot "Total Balance" and "Total Principal". 
    // Fill Principal to bottom. Fill Balance to Principal?

    if (growthChart) {
        growthChart.destroy();
    }

    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '총 평가액 (Total Balance)',
                    data: data.map(d => d.balance),
                    borderColor: '#34d399', // accent color
                    backgroundColor: 'rgba(52, 211, 153, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    borderWidth: 2
                },
                {
                    label: '투자 원금 (Principal)',
                    data: data.map(d => d.totalPrincipal),
                    borderColor: '#94a3b8',
                    backgroundColor: 'rgba(148, 163, 184, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#94a3b8'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatMoney(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function formatMoney(amount) {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}
