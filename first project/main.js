// ==========================
// تعريف العناصر من الـ HTML
// ==========================
let name = document.getElementById("name");
let buy = document.getElementById("buy");
let sell = document.getElementById("sell");
let amount = document.getElementById("amount");
let but = document.getElementById("but");
let search = document.getElementById("search");
let tbody = document.getElementById("tbody");

// ربط عناصر جدول المبيعات والعنوان
let salesTbody = document.getElementById("salesTbody");
let profitTitle = document.getElementById("profitTitle");

// ==========================
// قراءة البيانات من الـ Local Storage
// ==========================
let dataPro = JSON.parse(localStorage.getItem("product")) || [];
let dataSales = JSON.parse(localStorage.getItem("sales")) || [];

// ==========================
// حساب وعرض الأرباح والخسائر في العنوان
// ==========================
function updateProfitAndLossTitle() {
    let totalProfit = 0;
    let totalLoss = 0;

    dataSales.forEach(sale => {
        let net = sale.profitFromSale;
        if (net > 0) {
            totalProfit += net;
        } else if (net < 0) {
            totalLoss += Math.abs(net);
        }
    });

    if (profitTitle) {
        if (totalProfit >= totalLoss) {
            let netProfit = totalProfit - totalLoss;
            profitTitle.textContent = `💰 إجمالي الأرباح: ${netProfit} جنيه`;
            profitTitle.style.background = "#32e52c"; 
        } else {
            let netLoss = totalLoss - totalProfit;
            profitTitle.textContent = `📉 إجمالي الخسائر: ${netLoss} جنيه`;
            profitTitle.style.background = "#f44336"; 
        }
    }
}

// ==========================
// عرض البيانات في الجداول
// ==========================
function showData() {
    // 1. عرض جدول المنتجات الحالية
    tbody.innerHTML = "";
    for (let i = 0; i < dataPro.length; i++) {
        tbody.innerHTML += `
            <tr>
                <td>${dataPro[i].name}</td>
                <td>${dataPro[i].buy}</td>
                <td>${dataPro[i].sell}</td>
                <td>${dataPro[i].amount}</td>
                <td><button onclick="sellProduct(${i})">بيع</button></td>
                <td><button onclick="updateProduct(${i})">تعديل</button></td>
                <td><button onclick="deleteProduct(${i})">مسح</button></td>
            </tr>
        `;
    }

    // 2. عرض جدول المبيعات الجديد (الفواتير)
    if (salesTbody) {
        salesTbody.innerHTML = "";
        for (let j = 0; j < dataSales.length; j++) {
            let productExists = dataPro.some(p => p.name === dataSales[j].name);
            
            let actionButton = !productExists 
                ? `<button onclick="deleteSaleRecord(${j})" style="background: #f44336; color: white;">مسح الفاتورة</button>` 
                : `-`;

            salesTbody.innerHTML += `
                <tr>
                    <td>${dataSales[j].name}</td>
                    <td>${dataSales[j].totalPrice} جنيه</td>
                    <td style="font-size: 22px;">${dataSales[j].date}</td>
                    <td>${actionButton}</td>
                </tr>
            `;
        }
    }

    updateProfitAndLossTitle();
}

showData();

// ==========================
// إضافة منتج
// ==========================
but.onclick = function (e) {
    if(e) e.preventDefault(); 

    let newpro = {
        name: name.value,
        buy: Number(buy.value),
        sell: Number(sell.value),
        amount: Number(amount.value)
    };

    if (
        name.value.trim() === "" ||
        buy.value === "" ||
        sell.value === "" ||
        amount.value === ""
    ) {
        alert("من فضلك املأ جميع البيانات");
        return;
    }

    dataPro.push(newpro);
    localStorage.setItem("product", JSON.stringify(dataPro));
    showData();

    name.value = "";
    buy.value = "";
    sell.value = "";
    amount.value = "";
};

// ==========================
// بيع منتج وتسجيل التوقيت والأرباح
// ==========================
function sellProduct(index) {
    let product = dataPro[index];
    let soldAmount = Number(prompt(`اكتب الكمية التي تم بيعها من ${product.name}:`));

    if (isNaN(soldAmount) || soldAmount <= 0) {
        alert("من فضلك اكتب كمية صحيحة");
        return;
    }

    if (soldAmount > Number(product.amount)) {
        alert(`الكمية غير كافية!\n\nالموجود في المخزن: ${product.amount}`);
        return;
    }

    let totalPrice = Number(product.sell) * soldAmount;
    let profitFromSale = (Number(product.sell) - Number(product.buy)) * soldAmount;

    product.amount = Number(product.amount) - soldAmount;

    let now = new Date();
    let rawHours = now.getHours();
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let day = String(now.getDate()).padStart(2, '0');
    let month = String(now.getMonth() + 1).padStart(2, '0'); 
    let year = now.getFullYear();
    
    let ampm = rawHours >= 12 ? 'م' : 'ص';
    let hours = rawHours % 12;
    hours = hours ? hours : 12; 

    let formattedDate = `${year}-${month}-${day} | ${hours}:${minutes} ${ampm}`;

    let saleRecord = {
        name: product.name,
        totalPrice: totalPrice,
        profitFromSale: profitFromSale,
        date: formattedDate
    };
    dataSales.push(saleRecord);

    localStorage.setItem("product", JSON.stringify(dataPro));
    localStorage.setItem("sales", JSON.stringify(dataSales));

    showData();

    let statusText = profitFromSale >= 0 ? `الربح من العملية: ${profitFromSale}` : `الخسارة من العملية: ${Math.abs(profitFromSale)}`;
    alert(`تم البيع بنجاح ✅\n\nالمنتج: ${product.name}\nالكمية المباعة: ${soldAmount}\n${statusText} جنيه`);
}

// ==========================
// مسح منتج من المخزن
// ==========================
function deleteProduct(index) {
    let confirmDelete = confirm(`هل أنت متأكد من مسح ${dataPro[index].name}؟`);
    if (!confirmDelete) return;

    dataPro.splice(index, 1);
    localStorage.setItem("product", JSON.stringify(dataPro));
    showData();
}

// ==========================
// مسح فاتورة مبيعات معينة
// ==========================
function deleteSaleRecord(index) {
    let confirmDelete = confirm(`هل أنت متأكد من مسح هذه الفاتورة نهائياً؟`);
    if (!confirmDelete) return;

    dataSales.splice(index, 1);
    localStorage.setItem("sales", JSON.stringify(dataSales));
    showData();
}

// ==========================
// تعديل منتج
// ==========================
function updateProduct(index) {
    name.value = dataPro[index].name;
    buy.value = dataPro[index].buy;
    sell.value = dataPro[index].sell;
    amount.value = dataPro[index].amount;

    dataPro.splice(index, 1);
    localStorage.setItem("product", JSON.stringify(dataPro));
    showData();
}

// ==========================
// ميزة البحث
// ==========================
search.onkeyup = function () {
    let value = search.value.toLowerCase();
    tbody.innerHTML = "";
    for (let i = 0; i < dataPro.length; i++) {
        if (dataPro[i].name.toLowerCase().includes(value)) {
            tbody.innerHTML += `
                <tr>
                    <td>${dataPro[i].name}</td>
                    <td>${dataPro[i].buy}</td>
                    <td>${dataPro[i].sell}</td>
                    <td>${dataPro[i].amount}</td>
                    <td><button onclick="sellProduct(${i})">بيع</button></td>
                    <td><button onclick="updateProduct(${i})">تعديل</button></td>
                    <td><button onclick="deleteProduct(${i})">مسح</button></td>
                </tr>
            `;
        }
    }
};

// ====================================================
// برمجة أزرار وحسابات الآلة الحاسبة الذكية 🚀
// ====================================================
let calcExpression = document.getElementById("calcExpression");
let calcButton = document.getElementById("calcButton");
let calcResult = document.getElementById("calcResult");

function pressCalc(val) {
    if (val === 'C') {
        calcExpression.value = '';
        calcResult.textContent = 'النتيجة: 0';
    } else if (val === 'back') {
        calcExpression.value = calcExpression.value.slice(0, -1);
    } else {
        calcExpression.value += val;
    }
}

if (calcButton) {
    calcButton.onclick = function () {
        let expression = calcExpression.value.trim();

        if (expression === "" || expression === "0") {
            calcResult.textContent = "النتيجة: 0";
            return;
        }

        try {
            let formattedExpression = expression.replace(/×/g, '*');
            formattedExpression = formattedExpression.replace(/÷/g, '/');

            let result = Function(`"use strict"; return (${formattedExpression})`)();

            if (result === undefined || isNaN(result) || !isFinite(result)) {
                calcResult.textContent = "النتيجة: مسألة غير صحيحة";
            } else {
                calcResult.textContent = `النتيجة: ${result}`;
            }
        } catch (error) {
            calcResult.textContent = "النتيجة: خطأ صياغة";
        }
    };
}
