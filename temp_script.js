
// --- Stock Yield Calculator Functions ---

function calculateStockYield() {
    const buyPrice = parseCurrency(document.getElementById('stock-buy-price').value);
    const quantity = parseCurrency(document.getElementById('stock-quantity').value);

    // Fee Rates (percentages)
    const buyFeeRate = parseFloat(document.getElementById('fee-buy').value) || 0;
    const sellFeeRate = parseFloat(document.getElementById('fee-sell').value) || 0;
    const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;

    const totalBuyAmount = buyPrice * quantity;
    const buyFee = Math.floor(totalBuyAmount * (buyFeeRate / 100)); // Floor is standard for KRW fees usually, or round? Let's use standard math. Usually fees are truncated.

    // Update Buy Summary
    document.getElementById('stock-total-buy').textContent = formatMoney(totalBuyAmount + buyFee); // Total Cost usually includes fee? Or strictly Buy Amount? Let's show Buy Amount + Fee as "Total Outflow"?
    // "Total Buy Amount" usually means Buy Price * Qty. Let's clarify.
    // Let's display: Total Buy Amount = Buy * Qty.
    // But cost basis is Buy + Fee.
    document.getElementById('stock-total-buy').textContent = formatMoney(totalBuyAmount);

    // Calculate Splits
    const splitRows = document.querySelectorAll('#split-body tr');
    let totalSellAmount = 0;
    let totalSellQty = 0;
    let totalExpectedProfit = 0;

    // We need to re-calculate per row values based on current Buy Price inputs
    splitRows.forEach(row => {
        const ratioInput = row.querySelector('.split-ratio');
        const targetInput = row.querySelector('.split-target');
        const sellPriceCell = row.querySelector('.split-sell-price');
        const sellQtyCell = row.querySelector('.split-sell-qty');
        const profitCell = row.querySelector('.split-profit');

        const ratio = parseFloat(ratioInput.value) || 0;
        const targetReturn = parseFloat(targetInput.value) || 0; // This is Target Return %, meaning (Sell - Buy)/Buy %? Or ((Sell - Cost) / Cost)?
        // Usually Target Return means: I want to make 10% profit.
        // Let's assume Target Return refers to Price increase % for simplicity, or Net Return %?
        // "Target Return %" on price is typical. Sell Price = Buy Price * (1 + target/100).

        const targetSellPrice = buyPrice * (1 + targetReturn / 100);
        const splitQty = Math.floor(quantity * (ratio / 100));

        // Render calculated cells
        sellPriceCell.textContent = formatMoney(targetSellPrice);
        sellQtyCell.textContent = splitQty.toLocaleString() + '주';

        // Calc Profit for this split
        // Sell Amount = Price * Qty
        // Sell Fee = Sell Amount * SellFeeRate
        // Sell Tax = Sell Amount * TaxRate
        // Net Sell = Sell Amount - Fee - Tax
        // Cost for this Qty = (Buy Price * Qty) + (Buy Amount * BuyFeeRate)? -> Buy Price * Qty * (1 + BuyFeeRate/100)?
        // Net Profit = Net Sell - Cost

        const splitSellAmt = targetSellPrice * splitQty;
        const splitSellFee = splitSellAmt * (sellFeeRate / 100);
        const splitSellTax = splitSellAmt * (taxRate / 100);
        const splitBuyAmt = buyPrice * splitQty;
        const splitBuyFee = splitBuyAmt * (buyFeeRate / 100);

        const netProfit = splitSellAmt - splitSellFee - splitSellTax - splitBuyAmt - splitBuyFee;

        profitCell.textContent = formatMoney(netProfit);
        profitCell.className = netProfit >= 0 ? 'split-profit highlight' : 'split-profit';
        if (netProfit < 0) profitCell.style.color = '#ef4444';

        totalSellAmount += splitSellAmt;
        totalSellQty += splitQty;
        totalExpectedProfit += netProfit;
    });

    // Update Split Summary
    let avgReturn = 0;
    if (totalBuyAmount > 0) {
        // Return Rate = Total Net Profit / (Total Buy Amount + Total Buy Fee)
        // Or simple Return on Investment?
        const totalCost = totalBuyAmount + (totalBuyAmount * buyFeeRate / 100);
        avgReturn = (totalExpectedProfit / totalCost) * 100;
    }

    document.getElementById('avg-return-rate').textContent = avgReturn.toFixed(2) + '%';
    document.getElementById('total-expected-profit').textContent = formatMoney(totalExpectedProfit);
    document.getElementById('total-expected-profit').style.color = totalExpectedProfit >= 0 ? 'var(--accent-color)' : '#ef4444';

    // Update Main Result Cards (If we assume all sold? Or just sum of splits?)
    // Let's treat the Main Result Cards as "Summary of Split Plan"
    document.getElementById('stock-total-sell').textContent = formatMoney(totalSellAmount);
    document.getElementById('stock-net-profit').textContent = formatMoney(totalExpectedProfit);
    document.getElementById('stock-net-profit').style.color = totalExpectedProfit >= 0 ? 'var(--accent-color)' : '#ef4444';
    document.getElementById('stock-return-rate').textContent = avgReturn.toFixed(2) + '%';
    document.getElementById('stock-return-rate').style.color = avgReturn >= 0 ? 'var(--accent-color)' : '#ef4444';
}

function addSplitRow() {
    const tbody = document.getElementById('split-body');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input type="number" class="split-ratio" value="50" step="10"></td>
        <td><input type="number" class="split-target" value="10" step="1"></td>
        <td class="split-sell-price">-</td>
        <td class="split-sell-qty">-</td>
        <td class="split-profit">-</td>
        <td><button class="btn-delete" onclick="this.closest('tr').remove(); calculateStockYield()">×</button></td>
    `;

    // Add listeners to new inputs
    tr.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateStockYield);
    });

    tbody.appendChild(tr);
    calculateStockYield();
}

function parseCurrency(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/[^0-9.-]+/g, "")) || 0;
}
