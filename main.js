// ==========================
// تعريف العناصر من الـ HTML الأصلي
// ==========================
let name = document.getElementById("name");
let buy = document.getElementById("buy");
let sell = document.getElementById("sell");
let amount = document.getElementById("amount");
let but = document.getElementById("but");
let search = document.getElementById("search");
let tbody = document.getElementById("tbody");

// إعداد مكان ديناميكي لعرض العنوان والجدول الجديد لكي يعمل مع الـ HTML الأصلي بدون تعديل
let salesSection = document.createElement("div");
salesSection.style.cssText = "direction: rtl; width: 91%; margin: 30px auto; text-align: center;";

let profitTitle = document.createElement("h2");
profitTitle.style.cssText = "font-size: 35px; color: #fff; background: #32e52c; padding: 15px; border-radius: 7px; margin-bottom: 10px;";
profitTitle.textContent = "إجمالي الأرباح: 0 جنيه";

let salesTable = document.createElement("table");
salesTable.style.cssText = "text-align: center; width: 100%; margin: 10px 0; border: 10px solid rgb(0, 0, 0); font-size: 30px; background: rgb(0, 0, 0); color: white;";
salesTable.innerHTML = `
    <thead>
        <tr style="background: #2196F3; color: white;">
            <th>اسم المنتج</th>
            <th>سعر البيع الكلي</th>
            <th>التاريخ والوقت</th>
            <th>إجراء</th>
        </tr>
    </thead>
    <tbody id="salesTbody"></tbody>
`;

salesSection.appendChild(profitTitle);
salesSection.appendChild(salesTable);
// إضافة الجدول الجديد تلقائياً في نهاية الصفحة قبل كود الـ Script لكي لا تلمس الـ HTML
document.body.insertBefore(salesSection, document.getElementById("calculator"));

let salesTbody = salesTable.querySelector("#salesTbody");

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

    // 2. عرض جدول المبيعات الجديد مع فحص وجود المنتج في المخزن
    salesTbody.innerHTML = "";
    for (let j = 0; j < dataSales.length; j++) {
        // التحقق مما إذا كان المنتج لا يزال موجوداً في المخزن (جدول المنتجات)
        let productExists = dataPro.some(p => p.name === dataSales[j].name);
        
        // إذا كان المنتج ممسوحاً من المخزن، يظهر زر المسح، وغير ذلك يظهر مكان فارغ أو كلمة "-"
        let actionButton = !productExists 
            ? `<button onclick="deleteSaleRecord(${j})" style="background: #f44336; color: white; font-size: 20px; padding: 5px 10px; cursor: pointer; border-radius: 5px; border: none;">مسح الفاتورة</button>` 
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

    updateProfitAndLossTitle();
}

showData();

// ==========================
// إضافة منتج
// ==========================
but.onclick = function () {
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

    // الحصول على الوقت والتاريخ الحالي بالتفصيل
    let now = new Date();
    let rawHours = now.getHours();
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let day = String(now.getDate()).padStart(2, '0');
    let month = String(now.getMonth() + 1).padStart(2, '0'); 
    let year = now.getFullYear();
    
    // تحويل الساعة لنظام 12 ساعة وتحديد (صباحاً / مساءً)
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
    let confirmDelete = confirm(`هل أنت متأكد من مسح ${dataPro[index].name}؟ (سيؤدي ذلك لتفعيل خيار مسح فواتيره من جدول المبيعات)`);
    if (!confirmDelete) return;

    dataPro.splice(index, 1);
    localStorage.setItem("product", JSON.stringify(dataPro));
    showData(); // عند التحديث سيظهر زر المسح بجانب فواتير هذا المنتج تلقائياً
}

// ==========================
// مسح فاتورة مبيعات معينة (يظهر فقط للمنتجات الممسوحة)
// ==========================
function deleteSaleRecord(index) {
    let confirmDelete = confirm(`هل أنت متأكد من مسح هذه الفاتورة نهائياً؟`);
    if (!confirmDelete) return;

    dataSales.splice(index, 1);
    localStorage.setItem("sales", JSON.stringify(dataSales));
    showData(); // إعادة الحساب والعرض بعد مسح الفاتورة
}

// ==========================
// تعديل منتج (الكود الأصلي الخاص بك)
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
