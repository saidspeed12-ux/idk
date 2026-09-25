const PRODUCTS_KEY = 'inventory_products_v1';
const SALES_KEY = 'inventory_sales_v1';

const form = document.getElementById('productForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const productList = document.getElementById('productList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const salesList = document.getElementById('salesList');
const calculatorDisplay = document.getElementById('calcDisplay');

const productNameInput = document.getElementById('productName');
const purchasePriceInput = document.getElementById('purchasePrice');
const sellingPriceInput = document.getElementById('sellingPrice');
const productQtyInput = document.getElementById('productQty');

const productsCount = document.getElementById('productsCount');
const stockCount = document.getElementById('stockCount');
const saleSummary = document.getElementById('saleSummary');
const totalProfitLabel = document.getElementById('totalProfitLabel');

const LEGACY_DEMO_PRODUCT_NAMES = ['ماء صغير', 'عصير تفاح'];

function getInitialProducts() {
  try {
    const stored = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
    if (!Array.isArray(stored)) {
      return [];
    }

    const hasLegacyDemo = stored.some((product) => LEGACY_DEMO_PRODUCT_NAMES.includes(product?.name));
    if (hasLegacyDemo) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
      return [];
    }

    return stored;
  } catch {
    return [];
  }
}

let products = getInitialProducts();

let sales = JSON.parse(localStorage.getItem(SALES_KEY)) || [];
let editingId = null;

function saveProducts() {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function saveSales() {
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function formatSaleTimestamp(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'لا يوجد وقت';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const meridiem = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds} ${meridiem}`;
}

function calculateProfit(soldQty, purchasePrice, sellingPrice) {
  return soldQty * sellingPrice - soldQty * purchasePrice;
}

function renderSales() {
  salesList.innerHTML = '';

  if (!sales.length) {
    salesList.innerHTML = '<div class="empty-state">لا توجد مبيعات مسجلة بعد.</div>';
    return;
  }

  sales.forEach((sale) => {
    const item = document.createElement('div');
    item.className = 'sale-item';

    const profitClass = sale.netProfit >= 0 ? 'profit-positive' : 'profit-negative';
    const profitLabel = sale.netProfit >= 0 ? 'ربح' : 'خسارة';

    item.innerHTML = `
      <div class="sale-header">
        <strong>${sale.productName}</strong>
        <span class="${profitClass}">${profitLabel}</span>
      </div>
      <p>الكمية: ${sale.soldQty}</p>
      <p>الإيراد: ${formatCurrency(sale.revenue)}</p>
      <p>التكلفة: ${formatCurrency(sale.cost)}</p>
      <p>صافي ${profitLabel}: <span class="${profitClass}">${formatCurrency(sale.netProfit)}</span></p>
      <div class="sale-time">${formatSaleTimestamp(sale.timestamp)}</div>
      <button type="button" class="delete-sale-btn" data-sale-id="${sale.id}">حذف الفاتورة</button>
    `;

    salesList.appendChild(item);
  });
}

function updateSummary() {
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);
  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.revenue || 0), 0);
  const totalNetProfit = sales.reduce((sum, sale) => sum + Number(sale.netProfit || 0), 0);

  productsCount.textContent = totalProducts;
  stockCount.textContent = totalStock;
  saleSummary.textContent = formatCurrency(totalSales);

  if (totalNetProfit >= 0) {
    totalProfitLabel.textContent = `${formatCurrency(totalNetProfit)} ربح`;
    totalProfitLabel.classList.remove('profit-negative');
    totalProfitLabel.classList.add('profit-positive');
  } else {
    totalProfitLabel.textContent = `${formatCurrency(Math.abs(totalNetProfit))} خسارة`;
    totalProfitLabel.classList.remove('profit-positive');
    totalProfitLabel.classList.add('profit-negative');
  }
}

function showPage(pageName) {
  const pages = document.querySelectorAll('.page');
  const navButtons = document.querySelectorAll('.nav-btn');

  pages.forEach((page) => {
    page.classList.toggle('active', page.id === `${pageName}Page`);
  });

  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.page === pageName);
  });
}

function renderProducts() {
  const keyword = searchInput.value.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const text = `${product.name}`.toLowerCase();
    return text.includes(keyword);
  });

  productList.innerHTML = '';

  if (filteredProducts.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  filteredProducts.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';

    const unitProfit = Number(product.sellingPrice) - Number(product.purchasePrice);
    const stockValue = Number(product.quantity) * Number(product.purchasePrice);
    const potentialProfit = Number(product.quantity) * unitProfit;

    card.innerHTML = `
      <div class="product-top">
        <h3 class="product-name">${product.name}</h3>
        <span class="qty-pill">الكمية: ${product.quantity}</span>
      </div>

      <div class="product-grid">
        <div class="info-box">
          <span>سعر الشراء</span>
          <strong>${formatCurrency(product.purchasePrice)}</strong>
        </div>
        <div class="info-box">
          <span>سعر البيع</span>
          <strong>${formatCurrency(product.sellingPrice)}</strong>
        </div>
        <div class="info-box">
          <span>ربح الوحدة</span>
          <strong class="${unitProfit >= 0 ? 'profit-positive' : 'profit-negative'}">${formatCurrency(unitProfit)}</strong>
        </div>
      </div>

      <div class="product-grid">
        <div class="info-box">
          <span>قيمة المخزون</span>
          <strong>${formatCurrency(stockValue)}</strong>
        </div>
        <div class="info-box">
          <span>إجمالي الربح</span>
          <strong class="${potentialProfit >= 0 ? 'profit-positive' : 'profit-negative'}">${formatCurrency(potentialProfit)}</strong>
        </div>
        <div class="info-box">
          <span>الوضع</span>
          <strong>${product.quantity > 0 ? 'متوفر' : 'منتهي'}</strong>
        </div>
      </div>

      <div class="product-actions">
        <div class="product-buttons">
          <button type="button" class="edit-btn" data-action="edit" data-id="${product.id}">تعديل</button>
          <button type="button" class="delete-btn" data-action="delete" data-id="${product.id}">حذف</button>
        </div>

        <form class="sell-form" data-id="${product.id}">
          <input type="number" min="1" max="${product.quantity || 0}" value="1" class="sell-qty" aria-label="كمية البيع" />
          <button type="submit" class="sell-btn">بيع</button>
        </form>
      </div>
    `;

    productList.appendChild(card);
  });

  updateSummary();
}

function resetForm() {
  form.reset();
  editingId = null;
  formTitle.textContent = 'إضافة منتج جديد';
  submitBtn.textContent = 'حفظ المنتج';
  cancelEditBtn.classList.add('hidden');
}

function handleSubmit(event) {
  event.preventDefault();

  const name = productNameInput.value.trim();
  const purchasePrice = Number(purchasePriceInput.value);
  const sellingPrice = Number(sellingPriceInput.value);
  const quantity = Number(productQtyInput.value);

  if (!name) {
    productNameInput.focus();
    return;
  }

  if (purchasePrice < 0 || sellingPrice < 0 || quantity < 0) {
    alert('يرجى إدخال قيم صحيحة للمشتريات والسعر والكمية.');
    return;
  }

  const productData = {
    name,
    purchasePrice,
    sellingPrice,
    quantity
  };

  if (editingId) {
    products = products.map((product) =>
      product.id === editingId ? { ...product, ...productData } : product
    );
  } else {
    products.unshift({ id: crypto.randomUUID(), ...productData });
  }

  saveProducts();
  renderProducts();
  resetForm();
}

function startEdit(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  editingId = productId;
  productNameInput.value = product.name;
  purchasePriceInput.value = product.purchasePrice;
  sellingPriceInput.value = product.sellingPrice;
  productQtyInput.value = product.quantity;

  formTitle.textContent = 'تعديل المنتج';
  submitBtn.textContent = 'تحديث المنتج';
  cancelEditBtn.classList.remove('hidden');
  productNameInput.focus();
}

function deleteProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const confirmed = window.confirm(`هل تريد حذف المنتج: ${product.name}؟`);
  if (!confirmed) return;

  products = products.filter((item) => item.id !== productId);

  if (editingId === productId) {
    resetForm();
  }

  saveProducts();
  saveSales();
  renderSales();
  renderProducts();
}

function deleteSale(saleId) {
  const sale = sales.find((item) => item.id === saleId);
  if (!sale) return;

  const confirmed = window.confirm(`هل تريد حذف فاتورة البيع: ${sale.productName}؟`);
  if (!confirmed) return;

  sales = sales.filter((item) => item.id !== saleId);
  saveSales();
  renderSales();
  updateSummary();
}

function sellProduct(productId, quantity) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const soldQty = Number(quantity);
  if (!Number.isFinite(soldQty) || soldQty <= 0) {
    alert('يرجى كتابة كمية بيع صحيحة.');
    return;
  }

  if (soldQty > Number(product.quantity)) {
    alert(`الكمية المطلوبة أكبر من المخزون المتوفر (${product.quantity}).`);
    return;
  }

  const revenue = soldQty * Number(product.sellingPrice);
  const cost = soldQty * Number(product.purchasePrice);
  const netProfit = revenue - cost;

  product.quantity = Number(product.quantity) - soldQty;

  sales.unshift({
    id: crypto.randomUUID(),
    productId: product.id,
    productName: product.name,
    soldQty,
    revenue,
    cost,
    netProfit,
    timestamp: new Date().toISOString()
  });

  saveProducts();
  saveSales();
  renderSales();
  renderProducts();

  const message = netProfit >= 0
    ? `تم البيع بنجاح! الربح = ${formatCurrency(netProfit)}`
    : `تم البيع بنجاح! الخسارة = ${formatCurrency(Math.abs(netProfit))}`;

  alert(message);
}

function bindCalculator() {
  const buttons = document.querySelectorAll('.calc-btn');
  let expression = '';

  const updateScreen = () => {
    calculatorDisplay.textContent = expression || '0';
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.value;

      if (value === 'C') {
        expression = '';
        updateScreen();
        return;
      }

      if (value === 'DEL') {
        expression = expression.slice(0, -1);
        updateScreen();
        return;
      }

      if (value === '=') {
        try {
          const safeExpression = expression
            .replace(/÷/g, '/')
            .replace(/×/g, '*')
            .replace(/−/g, '-')
            .replace(/%/g, '/100');

          const result = Function(`"use strict"; return (${safeExpression})`)();
          if (!Number.isFinite(result)) {
            expression = '0';
          } else {
            expression = Number(result.toFixed(10)).toString();
          }
        } catch {
          expression = '0';
        }

        updateScreen();
        return;
      }

      if (['/', '*', '+', '-', '%'].includes(value)) {
        const lastChar = expression.slice(-1);
        if (['/', '*', '+', '-', '%'].includes(lastChar)) {
          expression = expression.slice(0, -1) + value;
        } else {
          expression += value;
        }
      } else {
        if (expression === '0' && value !== '.') {
          expression = value;
        } else {
          expression += value;
        }
      }

      updateScreen();
    });
  });
}

document.querySelectorAll('.nav-btn').forEach((button) => {
  button.addEventListener('click', () => {
    showPage(button.dataset.page);
  });
});

form.addEventListener('submit', handleSubmit);
cancelEditBtn.addEventListener('click', resetForm);
searchInput.addEventListener('input', renderProducts);

productList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const { action, id } = button.dataset;

  if (action === 'edit') {
    startEdit(id);
  }

  if (action === 'delete') {
    deleteProduct(id);
  }
});

productList.addEventListener('submit', (event) => {
  const formEl = event.target.closest('.sell-form');
  if (!formEl) return;

  event.preventDefault();
  const productId = formEl.dataset.id;
  const qtyInput = formEl.querySelector('.sell-qty');
  sellProduct(productId, qtyInput.value);
});

salesList.addEventListener('click', (event) => {
  const button = event.target.closest('.delete-sale-btn');
  if (!button) return;

  deleteSale(button.dataset.saleId);
});

bindCalculator();
renderSales();
renderProducts();
