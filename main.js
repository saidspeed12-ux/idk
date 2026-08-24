let name = document.getElementById("name");
let buy = document.getElementById("buy");
let sell = document.getElementById("sell");
let amount = document.getElementById("amount");
let but = document.getElementById("but");
let search = document.getElementById("search");
let tbody = document.getElementById("tbody");

// قراءة البيانات من Local Storage
let dataPro = JSON.parse(localStorage.getItem("product")) || [];

// عرض البيانات في الجدول
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
                    <button onclick="updateProduct(${i})">تعديل</button>
                </td>
                <td>
                    <button onclick="deleteProduct(${i})">مسح</button>
                </td>
            </tr>
        `;
    }
}

// إضافة منتج
but.onclick = function () {
    let newpro = {
        name: name.value,
        buy: buy.value,
        sell: sell.value,
        amount: amount.value
    };

    dataPro.push(newpro);

    localStorage.setItem("product", JSON.stringify(dataPro));

    showData();

    // تفريغ الحقول
    name.value = "";
    buy.value = "";
    sell.value = "";
    amount.value = "";
};

// مسح منتج
function deleteProduct(index) {
    dataPro.splice(index, 1);

    localStorage.setItem("product", JSON.stringify(dataPro));

    showData();
}

// تعديل منتج
function updateProduct(index) {
    name.value = dataPro[index].name;
    buy.value = dataPro[index].buy;
    sell.value = dataPro[index].sell;
    amount.value = dataPro[index].amount;

    dataPro.splice(index, 1);

    localStorage.setItem("product", JSON.stringify(dataPro));

    showData();
}

// البحث عن منتج
search.onkeyup = function () {
    let searchValue = search.value.toLowerCase();

    tbody.innerHTML = "";

    for (let i = 0; i < dataPro.length; i++) {
        if (dataPro[i].name.toLowerCase().includes(searchValue)) {
            tbody.innerHTML += `
                <tr>
                    <td>${dataPro[i].name}</td>
                    <td>${dataPro[i].buy}</td>
                    <td>${dataPro[i].sell}</td>
                    <td>${dataPro[i].amount}</td>
                    <td>
                        <button onclick="updateProduct(${i})">تعديل</button>
                    </td>
                    <td>
                        <button onclick="deleteProduct(${i})">مسح</button>
                    </td>
                </tr>
            `;
        }
    }
};

// عرض البيانات عند فتح الصفحة
showData();












