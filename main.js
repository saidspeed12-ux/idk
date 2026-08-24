let name = document.getElementById("name");
let buy = document.getElementById("buy");
let sell = document.getElementById("sell");
let amount = document.getElementById("amount");
let but = document.getElementById("but");
let search = document.getElementById("search");
let tbody = document.getElementById("tbody");
let totalProfitElement = document.getElementById("totalProfit");

// قراءة المنتجات من Local Storage
let dataPro = JSON.parse(localStorage.getItem("product")) || [];

// قراءة إجمالي الأرباح من Local Storage
let totalProfit = Number(localStorage.getItem("totalProfit")) || 0;


// ==========================
// عرض إجمالي الأرباح
// ==========================
function showTotalProfit() {
    totalProfitElement.textContent = totalProfit;
}


// ==========================
// عرض البيانات في الجدول
// ==========================
function showData() {
    tbody.innerHTML = "";

    for (let i = 0; i < dataPro.length; i++) {

        tbody.innerHTML += `
            <tr>
                <td>${dataPro[i].name}</td>
                <td>${dataPro[i].buy}</td>
                <td>${dataPro[i].sell}</td>
                <td>${dataPro[i].amount}</td>

                <td>
                    <button onclick="sellProduct(${i})">
                        بيع
                    </button>
                </td>

                <td>
                    <button onclick="updateProduct(${i})">
                        تعديل
                    </button>
                </td>

                <td>
                    <button onclick="deleteProduct(${i})">
                        مسح
                    </button>
                </td>
            </tr>
        `;
    }

    showTotalProfit();
}


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

    // التأكد إن البيانات مش فاضية
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

    // حفظ المنتجات
    localStorage.setItem("product", JSON.stringify(dataPro));

    showData();

    // تفريغ الحقول
    name.value = "";
    buy.value = "";
    sell.value = "";
    amount.value = "";
};


// ==========================
// بيع منتج
// ==========================
function sellProduct(index) {

    let product = dataPro[index];

    // طلب الكمية المباعة
    let soldAmount = Number(
        prompt(`اكتب الكمية التي تم بيعها من ${product.name}:`)
    );

    // التأكد من الكمية
    if (isNaN(soldAmount) || soldAmount <= 0) {
        alert("من فضلك اكتب كمية صحيحة");
        return;
    }

    // التأكد إن الكمية موجودة في المخزن
    if (soldAmount > Number(product.amount)) {
        alert(
            `الكمية غير كافية!\n\nالموجود في المخزن: ${product.amount}`
        );
        return;
    }

    // حساب الربح
    let profit =
        (Number(product.sell) - Number(product.buy)) * soldAmount;

    // تقليل الكمية من المخزن
    product.amount =
        Number(product.amount) - soldAmount;

    // إضافة الربح إلى إجمالي الأرباح
    totalProfit += profit;

    // حفظ المنتجات
    localStorage.setItem(
        "product",
        JSON.stringify(dataPro)
    );

    // حفظ إجمالي الأرباح
    localStorage.setItem(
        "totalProfit",
        totalProfit
    );

    // تحديث الجدول
    showData();

    // إظهار نتيجة البيع
    alert(`
تم البيع بنجاح ✅

المنتج: ${product.name}
الكمية المباعة: ${soldAmount}

الربح من العملية: ${profit} جنيه

إجمالي الأرباح: ${totalProfit} جنيه
`);
}


// ==========================
// مسح منتج
// ==========================
function deleteProduct(index) {

    let confirmDelete = confirm(
        `هل أنت متأكد من مسح ${dataPro[index].name}؟`
    );

    if (!confirmDelete) {
        return;
    }

    dataPro.splice(index, 1);

    // حفظ البيانات
    localStorage.setItem(
        "product",
        JSON.stringify(dataPro)
    );

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

    // حذف المنتج القديم مؤقتًا
    dataPro.splice(index, 1);

    localStorage.setItem(
        "product",
        JSON.stringify(dataPro)
    );

    showData();
}


// ==========================
// البحث عن منتج
// ==========================
search.onkeyup = function () {

    let searchValue =
        search.value.toLowerCase();

    tbody.innerHTML = "";

    for (let i = 0; i < dataPro.length; i++) {

        if (
            dataPro[i].name
                .toLowerCase()
                .includes(searchValue)
        ) {

            tbody.innerHTML += `
                <tr>
                    <td>${dataPro[i].name}</td>
                    <td>${dataPro[i].buy}</td>
                    <td>${dataPro[i].sell}</td>
                    <td>${dataPro[i].amount}</td>

                    <td>
                        <button onclick="sellProduct(${i})">
                            بيع
                        </button>
                    </td>

                    <td>
                        <button onclick="updateProduct(${i})">
                            تعديل
                        </button>
                    </td>

                    <td>
                        <button onclick="deleteProduct(${i})">
                            مسح
                        </button>
                    </td>
                </tr>
            `;
        }
    }
};


// ==========================
// تشغيل الموقع عند فتح الصفحة
// ==========================
showData();
showTotalProfit();


