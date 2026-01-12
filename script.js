// Chart Instance - Global Scope to be accessible by updateChart
let growthChart = null;

// Initial Setup and Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching Logic
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => {
                c.style.display = 'none';
                c.classList.remove('active');
            });

            tab.classList.add('active');
            const targetId = `tab-${tab.dataset.tab}`;
            const targetContent = document.getElementById(targetId);
            targetContent.style.display = 'block';
            setTimeout(() => targetContent.classList.add('active'), 10);
        });
    });

    // --- Compound Interest Calculator Logic ---
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
        input.addEventListener('input', handleCurrencyInput);
    });

    inputs.slice(2).forEach(input => { // Remaining inputs
        input.addEventListener('input', calculateAndRender);
    });

    calculateBtn.addEventListener('click', calculateAndRender);

    // Initial calculation for Compound Calc
    calculateAndRender();

    // --- Stock Yield Calculator Logic ---
    const stockBuyPriceInput = document.getElementById('stock-buy-price');
    const stockQuantityInput = document.getElementById('stock-quantity');
    const feeBuyInput = document.getElementById('fee-buy');
    const feeSellInput = document.getElementById('fee-sell');
    const taxRateInput = document.getElementById('tax-rate');
    const addSplitBtn = document.getElementById('add-split-btn');

    const stockTotalAmountInput = document.getElementById('stock-total-amount-card');

    // New Top Section Inputs
    const targetReturnRateInput = document.getElementById('target-return-rate');
    const targetProfitAmountInput = document.getElementById('target-profit-amount');

    // Event Listeners for Stock Inputs
    stockBuyPriceInput.addEventListener('input', (e) => {
        handleCurrencyInput(e);
        syncTotalAmount();
        syncTargetProfit(); // Ensure target profit updates when total changes
        calculateStockYield();
    });

    stockQuantityInput.addEventListener('input', (e) => {
        handleCurrencyInput(e);
        syncTotalAmount();
        syncTargetProfit(); // Ensure target profit updates when total changes
        calculateStockYield();
    });

    stockTotalAmountInput.addEventListener('input', (e) => {
        handleCurrencyInput(e);
        syncQuantity();
        calculateStockYield();
        syncTargetProfit(); // Recalc target profit based on new total
    });

    // Target Section Listeners
    targetReturnRateInput.addEventListener('input', () => {
        syncTargetProfit();
    });

    targetProfitAmountInput.addEventListener('input', (e) => {
        handleCurrencyInput(e);
        syncTargetReturn();
    });

    [feeBuyInput, feeSellInput, taxRateInput].forEach(input => {
        input.addEventListener('input', calculateStockYield);
    });

    addSplitBtn.addEventListener('click', addSplitRow);

    // Initial Calc for Stock
    calculateStockYield();

    function handleCurrencyInput(e) {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        if (rawValue) {
            e.target.value = parseInt(rawValue).toLocaleString();
        } else {
            e.target.value = 0;
        }
        if (e.target.id.includes('stock')) {
            calculateStockYield();
        } else {
            calculateAndRender();
        }
    }

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

// --- Stock Yield Calculator Functions ---

function calculateStockYield() {
    // helpers
    const getVal = (id) => parseCurrency(document.getElementById(id).value);

    const buyPrice = getVal('stock-buy-price');
    const quantity = getVal('stock-quantity');

    // Fee Rates (percentages)
    const buyFeeRate = parseFloat(document.getElementById('fee-buy').value) || 0;
    const sellFeeRate = parseFloat(document.getElementById('fee-sell').value) || 0;
    const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;

    const totalBuyAmount = buyPrice * quantity;
    const buyFee = Math.floor(totalBuyAmount * (buyFeeRate / 100));

    // Update Buy Summary
    document.getElementById('stock-total-buy').textContent = formatMoney(totalBuyAmount);

    // Calculate Splits - Aggregation Only
    // Individual row calculations (Bidirectional) are handled by input events now.
    // However, we still need to sum up everything for the summary cards.
    // And if global 'calculateStockYield' is called (e.g. by modifying Buy Price), we need to update rows?
    // YES. If Buy Price changes, Profit remains constant? Or Return remains constant?
    // Usually Return % remains constant if you just changed buy price basics? 
    // Let's assume Target Return % is the anchor when Buy Price changes.
    // So we re-calculate Profit based on the current Return % in the input.

    const splitRows = document.querySelectorAll('#split-body tr');
    let totalSellAmount = 0;
    let totalSellQty = 0;
    let totalExpectedProfit = 0;

    splitRows.forEach(row => {
        const ratioInput = row.querySelector('.split-ratio');
        const profitInput = row.querySelector('.split-profit-input');
        const returnInput = row.querySelector('.split-return-input');
        const sellPriceCell = row.querySelector('.split-sell-price');
        const sellQtyCell = row.querySelector('.split-sell-qty');

        const ratio = parseFloat(ratioInput.value) || 0;
        const splitQty = Math.floor(quantity * (ratio / 100));

        // We use the current Return % value to derive everything else during a full re-calc
        // (e.g. when Quantity or Buy Price changes). 
        // If the user *just* typed in Profit, the Profit Event Listener would have updated Return %.

        let targetReturn = parseFloat(returnInput.value) || 0;

        // Calculate Sell Price based on Return %
        const targetSellPrice = buyPrice * (1 + targetReturn / 100);

        // Update display
        sellPriceCell.textContent = formatMoney(targetSellPrice);
        sellQtyCell.textContent = splitQty.toLocaleString() + '주';

        // Calculate Profit based on this Sell Price
        const splitSellAmt = targetSellPrice * splitQty;
        const splitSellFee = splitSellAmt * (sellFeeRate / 100);
        const splitSellTax = splitSellAmt * (taxRate / 100);
        const splitBuyAmt = buyPrice * splitQty;
        const splitBuyFee = splitBuyAmt * (buyFeeRate / 100);

        const netProfit = splitSellAmt - splitSellFee - splitSellTax - splitBuyAmt - splitBuyFee;

        // Sync Profit Input (only if not focused to avoid fighting user input)
        if (document.activeElement !== profitInput) {
            profitInput.value = Math.round(netProfit); // Raw number for input
        }

        totalSellAmount += splitSellAmt;
        totalSellQty += splitQty;
        totalExpectedProfit += netProfit;
    });

    // Update Split Summary
    let avgReturn = 0;
    if (totalBuyAmount > 0) {
        // Avg Return = Total Profit / Total Investment Cost
        const totalCost = totalBuyAmount + buyFee; // Should include fee? Usually yes for ROI.
        avgReturn = (totalExpectedProfit / totalCost) * 100;
    }

    document.getElementById('avg-return-rate').textContent = avgReturn.toFixed(2) + '%';
    const totalProfitEl = document.getElementById('total-expected-profit');
    totalProfitEl.textContent = formatMoney(totalExpectedProfit);
    totalProfitEl.style.color = totalExpectedProfit >= 0 ? 'var(--accent-color)' : '#ef4444';

    // Update Main Result Cards
    document.getElementById('stock-total-sell').textContent = formatMoney(totalSellAmount);

    const netProfitEl = document.getElementById('stock-net-profit');
    netProfitEl.textContent = formatMoney(totalExpectedProfit);
    netProfitEl.style.color = totalExpectedProfit >= 0 ? 'var(--accent-color)' : '#ef4444';

    const returnRateEl = document.getElementById('stock-return-rate');
    returnRateEl.textContent = avgReturn.toFixed(2) + '%';
    returnRateEl.style.color = avgReturn >= 0 ? 'var(--accent-color)' : '#ef4444';
}

function addSplitRow() {
    const tbody = document.getElementById('split-body');
    const tr = document.createElement('tr');
    // New Structure: [Ratio] [Profit Input] [Price] [Qty] [Return Input] [Delete]
    tr.innerHTML = `
        <td><input type="number" class="split-ratio" value="50" step="10"></td>
        <td><input type="number" class="split-profit-input" value="0"></td>
        <td class="split-sell-price">-</td>
        <td class="split-sell-qty">-</td>
        <td><input type="number" class="split-return-input" value="10" step="0.1"></td>
        <td><button class="btn-delete" onclick="this.closest('tr').remove(); calculateStockYield()">×</button></td>
    `;

    const profitInput = tr.querySelector('.split-profit-input');
    const returnInput = tr.querySelector('.split-return-input');
    const ratioInput = tr.querySelector('.split-ratio');

    // Profit Input Listener: Updates Return %
    profitInput.addEventListener('input', (e) => {
        const profit = parseFloat(e.target.value) || 0;
        const buyPrice = parseCurrency(document.getElementById('stock-buy-price').value);
        const quantity = parseCurrency(document.getElementById('stock-quantity').value);
        const ratio = parseFloat(ratioInput.value) || 0;
        const splitQty = Math.floor(quantity * (ratio / 100));

        if (splitQty <= 0 || buyPrice <= 0) return;

        const buyFeeRate = parseFloat(document.getElementById('fee-buy').value) || 0;
        const sellFeeRate = parseFloat(document.getElementById('fee-sell').value) || 0;
        const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;

        // Reverse Calc: 
        // Profit = (SellPrice * Qty) - SellFees - BuyCosts
        // Profit + BuyCosts = SellPrice * Qty * (1 - TotalSellRate)
        // SellPrice = (Profit + BuyCosts) / (Qty * (1 - TotalSellRate))

        const splitBuyAmt = buyPrice * splitQty;
        const splitBuyFee = splitBuyAmt * (buyFeeRate / 100);
        const totalBuyCost = splitBuyAmt + splitBuyFee;

        const totalSellRate = (sellFeeRate + taxRate) / 100;
        const targetSellPrice = (profit + totalBuyCost) / (splitQty * (1 - totalSellRate));

        const returnRate = ((targetSellPrice - buyPrice) / buyPrice) * 100;

        returnInput.value = returnRate.toFixed(2);

        // Recalc everything else (Summaries)
        calculateStockYield();
    });

    // Return Input Listener: Updates Profit (Standard logic)
    returnInput.addEventListener('input', (e) => {
        calculateStockYield();
    });

    ratioInput.addEventListener('input', calculateStockYield);

    tbody.appendChild(tr);
    calculateStockYield();
}
function parseCurrency(str) {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    return parseFloat(str.replace(/[^0-9.-]+/g, "")) || 0;
}

function syncTotalAmount() {
    const buyPriceInput = document.getElementById('stock-buy-price');
    const quantityInput = document.getElementById('stock-quantity');
    const totalAmountInput = document.getElementById('stock-total-amount-card');

    const price = parseCurrency(buyPriceInput.value);
    const qty = parseCurrency(quantityInput.value);
    const total = price * qty;
    totalAmountInput.value = total.toLocaleString();
}

function syncQuantity() {
    const buyPriceInput = document.getElementById('stock-buy-price');
    const quantityInput = document.getElementById('stock-quantity');
    const totalAmountInput = document.getElementById('stock-total-amount-card');

    const price = parseCurrency(buyPriceInput.value);
    const total = parseCurrency(totalAmountInput.value);
    if (price > 0) {
        const qty = Math.floor(total / price);
        quantityInput.value = qty.toLocaleString();
    }
}

function syncTargetProfit() {
    const totalInput = document.getElementById('stock-total-amount-card');
    const rateInput = document.getElementById('target-return-rate');
    const profitInput = document.getElementById('target-profit-amount');

    // Safety check if elements exist (in case of layout changes)
    if (!totalInput || !rateInput || !profitInput) return;

    const total = parseCurrency(totalInput.value);
    const rate = parseFloat(rateInput.value) || 0;

    // Profit Logic: 
    // Uses Buy Price/Qty if available for exact fee calc, otherwise approximation.
    const buyPrice = parseCurrency(document.getElementById('stock-buy-price').value);
    const quantity = parseCurrency(document.getElementById('stock-quantity').value);

    if (buyPrice > 0 && quantity > 0) {
        const buyFeeRate = parseFloat(document.getElementById('fee-buy').value) || 0;
        const sellFeeRate = parseFloat(document.getElementById('fee-sell').value) || 0;
        const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;

        const targetSellPrice = buyPrice * (1 + rate / 100);

        const totalBuyAmt = buyPrice * quantity;
        const totalSellAmt = targetSellPrice * quantity;

        const buyFee = totalBuyAmt * (buyFeeRate / 100);
        const sellFee = totalSellAmt * (sellFeeRate / 100);
        const sellTax = totalSellAmt * (taxRate / 100);

        const netProfit = totalSellAmt - totalBuyAmt - buyFee - sellFee - sellTax;

        profitInput.value = Math.round(netProfit).toLocaleString();
    } else {
        // Fallback approximation if no qty details
        if (total > 0) {
            const approxProfit = total * (rate / 100);
            profitInput.value = Math.round(approxProfit).toLocaleString();
        } else {
            profitInput.value = '0';
        }
    }
}

function syncTargetReturn() {
    const totalInput = document.getElementById('stock-total-amount-card');
    const rateInput = document.getElementById('target-return-rate');
    const profitInput = document.getElementById('target-profit-amount');

    if (!totalInput || !rateInput || !profitInput) return;

    const total = parseCurrency(totalInput.value);
    const profit = parseCurrency(profitInput.value);

    if (total <= 0) return;

    const buyPrice = parseCurrency(document.getElementById('stock-buy-price').value);
    const quantity = parseCurrency(document.getElementById('stock-quantity').value);

    if (buyPrice > 0 && quantity > 0) {
        const buyFeeRate = parseFloat(document.getElementById('fee-buy').value) || 0;
        const sellFeeRate = parseFloat(document.getElementById('fee-sell').value) || 0;
        const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;

        const totalBuyAmt = buyPrice * quantity;
        const buyFee = totalBuyAmt * (buyFeeRate / 100);
        const totalBuyCost = totalBuyAmt + buyFee;

        const totalSellRate = (sellFeeRate + taxRate) / 100;

        // Algebra: Profit + MakeWholeCost = SellAmt * (1 - TotalSellFeeRate)
        // SellAmt = (Profit + TotalBuyCost) / (1 - TotalSellFeeRate)
        // But need to be careful of denominator 0 if fees are 100% (unlikely).

        let targetSellAmt = 0;
        if (1 - totalSellRate > 0.0001) {
            targetSellAmt = (profit + totalBuyCost) / (1 - totalSellRate);
        } else {
            targetSellAmt = 0; // Error or massive fees
        }

        const targetSellPrice = targetSellAmt / quantity;
        const returnRate = ((targetSellPrice - buyPrice) / buyPrice) * 100;

        rateInput.value = returnRate.toFixed(2);
    } else {
        // Approximate
        const rate = (profit / total) * 100;
        rateInput.value = rate.toFixed(2);
    }
}
