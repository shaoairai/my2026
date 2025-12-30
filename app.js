// Firebase SDK 導入
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyDYqveRLIRReHX3z-Gyg_hOI59Q_0SULJE",
  authDomain: "my2026-e8f99.firebaseapp.com",
  databaseURL:
    "https://my2026-e8f99-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my2026-e8f99",
  storageBucket: "my2026-e8f99.firebasestorage.app",
  messagingSenderId: "824810826104",
  appId: "1:824810826104:web:52c5ee818a1ac75d15c08d",
  measurementId: "G-K60ELT05VH",
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 預設白名單（若 Firebase 中不存在則自動建立）
const DEFAULT_WHITELIST = {
  "0935033983": { password: "a123321a" },
  "0963531832": { password: "a123321a" },
};

// 全域變數
let currentUser = null;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-11
let dailyGoalsData = {};
let selectedDate = null;

// DOM 元素
const loginPage = document.getElementById("loginPage");
const mainPage = document.getElementById("mainPage");
const phoneInput = document.getElementById("phoneInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const currentUserDisplay = document.getElementById("currentUserDisplay");
const changePasswordBtn = document.getElementById("changePasswordBtn");

const monthGoalInput = document.getElementById("monthGoalInput");
const addMonthGoalBtn = document.getElementById("addMonthGoalBtn");
const monthGoalsList = document.getElementById("monthGoalsList");


const progressRate = document.getElementById("progressRate");
const progressDetail = document.getElementById("progressDetail");

const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const calendarTitle = document.getElementById("calendarTitle");
const calendarGrid = document.getElementById("calendarGrid");

const dailyModal = document.getElementById("dailyModal");
const closeModal = document.getElementById("closeModal");
const modalDate = document.getElementById("modalDate");
const itemsList = document.getElementById("itemsList");
const newItemInput = document.getElementById("newItemInput");
const addItemBtn = document.getElementById("addItemBtn");
const addAndApplyBtn = document.getElementById("addAndApplyBtn");

const editItemModal = document.getElementById("editItemModal");
const closeEditModal = document.getElementById("closeEditModal");
const editItemInput = document.getElementById("editItemInput");
const saveEditBtn = document.getElementById("saveEditBtn");
const saveAndApplyEditBtn = document.getElementById("saveAndApplyEditBtn");

const newItemColorPicker = document.getElementById("newItemColorPicker");
const editItemColorPicker = document.getElementById("editItemColorPicker");

const yearGoalInput = document.getElementById("yearGoalInput");
const addYearGoalBtn = document.getElementById("addYearGoalBtn");
const yearGoalsList = document.getElementById("yearGoalsList");
const yearGoalColorPicker = document.getElementById("yearGoalColorPicker");

const monthGoalTitle = document.getElementById("monthGoalTitle");
const monthGoalColorPicker = document.getElementById("monthGoalColorPicker");

const editMonthGoalModal = document.getElementById("editMonthGoalModal");
const closeEditMonthGoalModal = document.getElementById(
  "closeEditMonthGoalModal"
);
const editMonthGoalInput = document.getElementById("editMonthGoalInput");
const editMonthGoalColorPicker = document.getElementById(
  "editMonthGoalColorPicker"
);
const saveEditMonthGoalBtn = document.getElementById("saveEditMonthGoalBtn");

const editYearGoalModal = document.getElementById("editYearGoalModal");
const closeEditYearGoalModal = document.getElementById(
  "closeEditYearGoalModal"
);
const editYearGoalInput = document.getElementById("editYearGoalInput");
const editYearGoalColorPicker = document.getElementById(
  "editYearGoalColorPicker"
);
const saveEditYearGoalBtn = document.getElementById("saveEditYearGoalBtn");

const passwordModal = document.getElementById("passwordModal");
const closePasswordModal = document.getElementById("closePasswordModal");
const currentPasswordInput = document.getElementById("currentPasswordInput");
const newPasswordInput = document.getElementById("newPasswordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");
const passwordError = document.getElementById("passwordError");
const savePasswordBtn = document.getElementById("savePasswordBtn");

// 編輯中的項目資訊
let editingItemId = null;
let editingItemOriginalText = null;
let editingItemOriginalColor = null;

// 編輯中的年度目標資訊
let editingYearGoalId = null;
let selectedEditYearGoalColor = "blue";

// 編輯中的月目標資訊
let editingMonthGoalId = null;
let selectedEditMonthGoalColor = "blue";
let selectedMonthGoalColor = "blue";

// 拖曳中的項目資訊
let draggedItem = null;
let draggedYearGoal = null;
let draggedMonthGoal = null;

// 目前選擇的顏色
let selectedNewItemColor = "blue";
let selectedEditItemColor = "blue";
let selectedYearGoalColor = "blue";

// ==================== 初始化白名單 ====================

async function initWhitelist() {
  try {
    const whitelistRef = ref(db, "loginWhitelist");
    const snapshot = await get(whitelistRef);

    if (!snapshot.exists()) {
      // 白名單不存在，建立預設白名單
      console.log("白名單不存在，正在建立預設白名單...");
      await set(whitelistRef, DEFAULT_WHITELIST);
      console.log("預設白名單已建立");
    }
  } catch (error) {
    console.error("初始化白名單失敗:", error);
  }
}

// ==================== 登入邏輯 ====================

// 檢查是否已登入
function checkLogin() {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = savedUser;
    showMainPage();
  }
}

// 登入按鈕事件
loginBtn.addEventListener("click", async () => {
  const phone = phoneInput.value.trim();
  const password = passwordInput.value;

  loginError.textContent = "";

  if (!phone || !password) {
    loginError.textContent = "請輸入手機號碼和密碼";
    return;
  }

  try {
    // 從 Firebase 讀取該使用者的資料
    const userRef = ref(db, `loginWhitelist/${phone}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();

      // 檢查密碼是否正確
      if (userData.password === password) {
        // 登入成功
        currentUser = phone;
        localStorage.setItem("currentUser", phone);
        showMainPage();
      } else {
        loginError.textContent = "密碼錯誤";
      }
    } else {
      loginError.textContent = "此手機號碼不在白名單中";
    }
  } catch (error) {
    console.error("登入錯誤:", error);
    loginError.textContent = "登入發生錯誤，請稍後再試";
  }
});

// Enter 鍵登入
passwordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    loginBtn.click();
  }
});

// 登出
logoutBtn.addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("currentUser");
  loginPage.classList.remove("hidden");
  mainPage.classList.add("hidden");
  phoneInput.value = "";
  passwordInput.value = "";
});

// 顯示主頁面
function showMainPage() {
  loginPage.classList.add("hidden");
  mainPage.classList.remove("hidden");
  currentUserDisplay.textContent = `👤 ${currentUser}`;

  // 初始化頁面
  initCalendar();
  loadYearGoals();
  loadMonthGoal();
  setupRealtimeListeners();
}

// ==================== 修改密碼功能 ====================

// 開啟修改密碼彈窗
changePasswordBtn.addEventListener("click", () => {
  currentPasswordInput.value = "";
  newPasswordInput.value = "";
  confirmPasswordInput.value = "";
  passwordError.textContent = "";
  passwordModal.classList.remove("hidden");
});

// 關閉修改密碼彈窗
closePasswordModal.addEventListener("click", () => {
  passwordModal.classList.add("hidden");
});

// 點擊背景關閉
passwordModal.addEventListener("click", (e) => {
  if (e.target === passwordModal) {
    passwordModal.classList.add("hidden");
  }
});

// 儲存新密碼
savePasswordBtn.addEventListener("click", async () => {
  const currentPwd = currentPasswordInput.value;
  const newPwd = newPasswordInput.value;
  const confirmPwd = confirmPasswordInput.value;

  passwordError.textContent = "";

  // 驗證輸入
  if (!currentPwd || !newPwd || !confirmPwd) {
    passwordError.textContent = "請填寫所有欄位";
    return;
  }

  if (newPwd !== confirmPwd) {
    passwordError.textContent = "新密碼與確認密碼不一致";
    return;
  }

  if (newPwd.length < 6) {
    passwordError.textContent = "新密碼至少需要 6 個字元";
    return;
  }

  try {
    // 先驗證目前密碼
    const userRef = ref(db, `loginWhitelist/${currentUser}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();

      if (userData.password !== currentPwd) {
        passwordError.textContent = "目前密碼錯誤";
        return;
      }

      // 更新密碼
      await update(userRef, { password: newPwd });

      alert("密碼修改成功！");
      passwordModal.classList.add("hidden");
    } else {
      passwordError.textContent = "使用者資料不存在";
    }
  } catch (error) {
    console.error("修改密碼失敗:", error);
    passwordError.textContent = "修改密碼失敗，請稍後再試";
  }
});

// ==================== 日期工具函數 ====================

// 取得當月的 key (例如 "2025-01")
function getMonthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

// 取得日期的 key (例如 "2025-01-03")
function getDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

// 取得今天的日期資訊
function getToday() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  };
}

// ==================== 月曆功能 ====================

function initCalendar() {
  renderCalendar();
}

function renderCalendar() {
  calendarTitle.textContent = `${currentYear} 年 ${currentMonth + 1} 月`;

  // 清空日曆格
  calendarGrid.innerHTML = "";

  // 取得當月第一天是星期幾
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // 取得當月天數
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // 取得今天
  const today = getToday();

  // 填入空白格 (月初之前)
  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "calendar-day empty";
    calendarGrid.appendChild(emptyDiv);
  }

  // 填入日期
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    const dateKey = getDateKey(currentYear, currentMonth, day);
    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();

    dayDiv.className = "calendar-day";
    dayDiv.dataset.date = dateKey;

    // 星期日/六 樣式
    if (dayOfWeek === 0) dayDiv.classList.add("sunday");
    if (dayOfWeek === 6) dayDiv.classList.add("saturday");

    // 今天的樣式
    if (
      currentYear === today.year &&
      currentMonth === today.month &&
      day === today.day
    ) {
      dayDiv.classList.add("today");
    }

    // 日期數字
    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    dayDiv.appendChild(dayNumber);

    // 每日項目容器（Google 日曆風格）
    const dayItems = document.createElement("div");
    dayItems.className = "day-items";
    dayItems.id = `items-${dateKey}`;
    dayDiv.appendChild(dayItems);

    // 點擊事件
    dayDiv.addEventListener("click", () => openDailyModal(dateKey));

    // 拖曳放置事件
    dayDiv.addEventListener("dragover", handleDayDragOver);
    dayDiv.addEventListener("dragleave", handleDayDragLeave);
    dayDiv.addEventListener("drop", handleDayDrop);

    calendarGrid.appendChild(dayDiv);
  }

  // 更新日曆上的項目顯示
  updateCalendarStatus();
}

// 取得日期項目排序後的 ID 列表
function getDayItemsSorted(items) {
  return Object.keys(items).sort((a, b) => {
    const orderA = items[a].order ?? 999999;
    const orderB = items[b].order ?? 999999;
    return orderA - orderB;
  });
}

// 更新日曆上的項目顯示
function updateCalendarStatus() {
  const days = calendarGrid.querySelectorAll(".calendar-day:not(.empty)");

  days.forEach((dayDiv) => {
    const dateKey = dayDiv.dataset.date;
    const data = dailyGoalsData[dateKey];
    const items = data?.items || {};

    // 清除完成狀態
    dayDiv.classList.remove("completed");

    // 更新項目顯示
    const dayItemsContainer = dayDiv.querySelector(".day-items");
    if (dayItemsContainer) {
      dayItemsContainer.innerHTML = "";

      // 按 order 排序顯示項目
      const sortedItemIds = getDayItemsSorted(items);

      sortedItemIds.forEach((itemId) => {
        const item = items[itemId];
        const itemDiv = document.createElement("div");
        const colorClass = item.color ? ` item-color-${item.color}` : "";
        itemDiv.className = `day-item my-item${
          item.completed ? " completed" : ""
        }${colorClass}`;
        itemDiv.textContent = item.text;
        itemDiv.dataset.itemId = itemId;
        itemDiv.dataset.dateKey = dateKey;
        itemDiv.dataset.itemText = item.text;
        itemDiv.dataset.itemCompleted = item.completed;
        itemDiv.dataset.itemColor = item.color || "";
        dayItemsContainer.appendChild(itemDiv);
      });

      // 為每個項目加上拖曳和點擊事件
      dayItemsContainer
        .querySelectorAll(".day-item.my-item")
        .forEach((itemDiv) => {
          itemDiv.draggable = true;
          let isDragging = false;

          itemDiv.addEventListener("mousedown", () => {
            isDragging = false;
          });

          itemDiv.addEventListener("dragstart", (e) => {
            isDragging = true;
            handleCalendarItemDragStart(e);
          });

          itemDiv.addEventListener("dragend", handleCalendarItemDragEnd);

          // 同一天內拖曳排序
          itemDiv.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (
              draggedItem &&
              draggedItem.sourceDate === dateKey &&
              itemDiv.dataset.itemId !== draggedItem.itemId
            ) {
              itemDiv.classList.add("drag-over-item");
            }
          });

          itemDiv.addEventListener("dragleave", (e) => {
            itemDiv.classList.remove("drag-over-item");
          });

          itemDiv.addEventListener("drop", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            itemDiv.classList.remove("drag-over-item");

            if (
              draggedItem &&
              draggedItem.sourceDate === dateKey &&
              itemDiv.dataset.itemId !== draggedItem.itemId
            ) {
              await reorderDayItems(
                dateKey,
                draggedItem.itemId,
                itemDiv.dataset.itemId
              );
              draggedItem = null;
            }
          });

          // 點擊時打開該日的彈窗（只有在沒有拖曳時）
          itemDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!isDragging) {
              openDailyModal(dateKey);
            }
            isDragging = false;
          });
        });
    }

    // 檢查是否所有項目都完成
    const itemKeys = Object.keys(items);
    if (itemKeys.length > 0) {
      const allCompleted = itemKeys.every((id) => items[id].completed === true);
      if (allCompleted) {
        dayDiv.classList.add("completed");
      }
    }
  });

  // 計算達成率
  calculateProgressRate();
}

// 上一月
prevMonthBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
  loadMonthGoal();
});

// 下一月
nextMonthBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
  loadMonthGoal();
});

// ==================== 每日項目彈窗 ====================

function openDailyModal(dateKey) {
  selectedDate = dateKey;

  // 格式化日期顯示
  const [year, month, day] = dateKey.split("-");
  modalDate.textContent = `${year} 年 ${parseInt(month)} 月 ${parseInt(
    day
  )} 日`;

  // 渲染現有項目列表
  renderItemsList();

  // 清空輸入框
  newItemInput.value = "";

  dailyModal.classList.remove("hidden");
}

// 彈窗內拖曳的項目
let draggedModalItem = null;

// 渲染項目列表
function renderItemsList() {
  if (!selectedDate) return;

  const data = dailyGoalsData[selectedDate];
  const items = data?.items || {};

  itemsList.innerHTML = "";

  // 按 order 排序
  const sortedItemIds = getDayItemsSorted(items);

  sortedItemIds.forEach((itemId) => {
    const item = items[itemId];
    const itemRow = document.createElement("div");
    itemRow.className = "item-row";
    itemRow.draggable = true;
    itemRow.dataset.id = itemId;
    const colorClass = item.color ? ` item-color-${item.color}` : "";
    itemRow.innerHTML = `
            <span class="item-drag-handle">⋮⋮</span>
            <input type="checkbox" class="item-checkbox" data-id="${itemId}" ${
      item.completed ? "checked" : ""
    } />
            <span class="item-text${
              item.completed ? " completed" : ""
            }${colorClass}" data-color="${item.color || ""}">${item.text}</span>
            <div class="item-actions">
                <button class="item-apply" data-id="${itemId}" data-text="${
      item.text
    }" data-color="${item.color || ""}" title="套用到全月">📅</button>
                <button class="item-edit" data-id="${itemId}" data-text="${
      item.text
    }" data-color="${item.color || ""}" title="編輯">✎</button>
                <button class="item-delete" data-id="${itemId}" title="刪除">×</button>
            </div>
        `;

    // 拖曳事件
    itemRow.addEventListener("dragstart", (e) => {
      draggedModalItem = itemRow;
      itemRow.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    itemRow.addEventListener("dragend", () => {
      draggedModalItem = null;
      itemRow.classList.remove("dragging");
      document
        .querySelectorAll(".item-row.drag-over")
        .forEach((el) => el.classList.remove("drag-over"));
    });

    itemRow.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (draggedModalItem && draggedModalItem !== itemRow) {
        itemRow.classList.add("drag-over");
      }
    });

    itemRow.addEventListener("dragleave", () => {
      itemRow.classList.remove("drag-over");
    });

    itemRow.addEventListener("drop", async (e) => {
      e.preventDefault();
      itemRow.classList.remove("drag-over");
      if (draggedModalItem && draggedModalItem !== itemRow) {
        const fromId = draggedModalItem.dataset.id;
        const toId = itemRow.dataset.id;
        await reorderDayItems(selectedDate, fromId, toId);
      }
    });

    itemsList.appendChild(itemRow);
  });

  // 綁定勾選事件
  itemsList.querySelectorAll(".item-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const itemId = e.target.dataset.id;
      toggleItemCompleted(itemId, e.target.checked);
    });
  });

  // 綁定套用到全月事件
  itemsList.querySelectorAll(".item-apply").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const itemText = e.target.dataset.text;
      const itemColor = e.target.dataset.color;
      applyItemToMonth(itemText, itemColor);
    });
  });

  // 綁定編輯事件
  itemsList.querySelectorAll(".item-edit").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const itemId = e.target.dataset.id;
      const itemText = e.target.dataset.text;
      const itemColor = e.target.dataset.color;
      openEditModal(itemId, itemText, itemColor);
    });
  });

  // 綁定刪除事件
  itemsList.querySelectorAll(".item-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const itemId = e.target.dataset.id;
      deleteItem(itemId);
    });
  });
}

// 新增項目
async function addItem() {
  if (!selectedDate || !currentUser) return;

  const text = newItemInput.value.trim();
  if (!text) {
    alert("請輸入項目內容");
    return;
  }

  try {
    // 計算新項目的 order（放在最後）
    const items = dailyGoalsData[selectedDate]?.items || {};
    const maxOrder = Object.values(items).reduce((max, item) => {
      return Math.max(max, item.order ?? 0);
    }, -1);

    // 產生唯一 ID
    const itemId = Date.now().toString();
    const itemRef = ref(
      db,
      `users/${currentUser}/dailyGoals/${selectedDate}/items/${itemId}`
    );
    const itemData = {
      text: text,
      completed: false,
      order: maxOrder + 1,
    };
    if (selectedNewItemColor && selectedNewItemColor !== "blue") {
      itemData.color = selectedNewItemColor;
    }
    await set(itemRef, itemData);

    newItemInput.value = "";
  } catch (error) {
    console.error("新增項目失敗:", error);
    alert("新增失敗，請稍後再試");
  }
}

// 切換項目完成狀態
async function toggleItemCompleted(itemId, completed) {
  if (!selectedDate || !currentUser) return;

  try {
    const itemRef = ref(
      db,
      `users/${currentUser}/dailyGoals/${selectedDate}/items/${itemId}`
    );
    await update(itemRef, { completed: completed });
  } catch (error) {
    console.error("更新狀態失敗:", error);
  }
}

// 刪除項目
async function deleteItem(itemId) {
  if (!selectedDate || !currentUser) return;

  const confirmDelete = confirm("確定要刪除此項目嗎？");
  if (!confirmDelete) return;

  try {
    const itemRef = ref(
      db,
      `users/${currentUser}/dailyGoals/${selectedDate}/items/${itemId}`
    );
    await set(itemRef, null);
  } catch (error) {
    console.error("刪除項目失敗:", error);
    alert("刪除失敗，請稍後再試");
  }
}

// 關閉彈窗
closeModal.addEventListener("click", () => {
  dailyModal.classList.add("hidden");
  selectedDate = null;
});

// 點擊背景關閉
dailyModal.addEventListener("click", (e) => {
  if (e.target === dailyModal) {
    dailyModal.classList.add("hidden");
    selectedDate = null;
  }
});

// 新增項目按鈕
addItemBtn.addEventListener("click", addItem);

// Enter 鍵新增項目
newItemInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addItem();
  }
});

// 新增項目顏色選擇
newItemColorPicker.querySelectorAll(".color-option").forEach((option) => {
  option.addEventListener("click", (e) => {
    newItemColorPicker
      .querySelectorAll(".color-option")
      .forEach((o) => o.classList.remove("selected"));
    e.target.classList.add("selected");
    selectedNewItemColor = e.target.dataset.color;
  });
});

// 編輯項目顏色選擇
editItemColorPicker.querySelectorAll(".color-option").forEach((option) => {
  option.addEventListener("click", (e) => {
    editItemColorPicker
      .querySelectorAll(".color-option")
      .forEach((o) => o.classList.remove("selected"));
    e.target.classList.add("selected");
    selectedEditItemColor = e.target.dataset.color;
  });
});

// 新增並套用到全月
addAndApplyBtn.addEventListener("click", async () => {
  if (!currentUser || !selectedDate) return;

  const text = newItemInput.value.trim();
  if (!text) {
    alert("請輸入項目內容");
    return;
  }

  const confirmApply = confirm(
    `確定要將「${text}」新增到 ${currentYear} 年 ${
      currentMonth + 1
    } 月的所有日期嗎？`
  );
  if (!confirmApply) return;

  try {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const updates = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = getDateKey(currentYear, currentMonth, day);
      const newItemId = Date.now().toString() + "_" + day;

      // 計算該日的最大 order
      const dayItems = dailyGoalsData[dateKey]?.items || {};
      const maxOrder = Object.values(dayItems).reduce((max, item) => {
        return Math.max(max, item.order ?? 0);
      }, -1);

      const itemData = {
        text: text,
        completed: false,
        order: maxOrder + 1,
      };
      if (selectedNewItemColor && selectedNewItemColor !== "blue") {
        itemData.color = selectedNewItemColor;
      }
      updates[`${dateKey}/items/${newItemId}`] = itemData;
    }

    const dailyGoalsRef = ref(db, `users/${currentUser}/dailyGoals`);
    await update(dailyGoalsRef, updates);

    newItemInput.value = "";
    alert(
      `已成功將「${text}」新增到 ${currentMonth + 1} 月全部 ${daysInMonth} 天！`
    );
  } catch (error) {
    console.error("套用失敗:", error);
    alert("套用失敗，請稍後再試");
  }
});

// ==================== 拖曳功能 ====================

// 日曆上的項目拖曳開始
function handleCalendarItemDragStart(e) {
  e.stopPropagation();
  const itemDiv = e.target;
  draggedItem = {
    itemId: itemDiv.dataset.itemId,
    text: itemDiv.dataset.itemText,
    completed: itemDiv.dataset.itemCompleted === "true",
    color: itemDiv.dataset.itemColor || "",
    sourceDate: itemDiv.dataset.dateKey,
  };
  itemDiv.classList.add("dragging");

  // 設置拖曳效果
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", itemDiv.dataset.itemText);
}

// 日曆上的項目拖曳結束
function handleCalendarItemDragEnd(e) {
  e.target.classList.remove("dragging");
  document.querySelectorAll(".calendar-day").forEach((day) => {
    day.classList.remove("drag-over");
  });
}

function handleDayDragOver(e) {
  e.preventDefault();
  if (draggedItem) {
    e.currentTarget.classList.add("drag-over");
  }
}

function handleDayDragLeave(e) {
  e.currentTarget.classList.remove("drag-over");
}

async function handleDayDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("drag-over");

  if (!draggedItem || !currentUser) return;

  const targetDate = e.currentTarget.dataset.date;

  // 不能放到同一天
  if (targetDate === draggedItem.sourceDate) {
    draggedItem = null;
    return;
  }

  // 檢查目標日期是否已有相同項目
  const targetData = dailyGoalsData[targetDate];
  const targetItems = targetData?.items || {};
  const hasDuplicate = Object.values(targetItems).some(
    (item) => item.text === draggedItem.text
  );

  if (hasDuplicate) {
    const confirmMove = confirm(
      `「${draggedItem.text}」在 ${formatDateDisplay(
        targetDate
      )} 已存在，是否仍要移動？\n\n（會產生重複項目）`
    );
    if (!confirmMove) {
      draggedItem = null;
      return;
    }
  }

  try {
    // 計算目標日期的最大 order
    const maxOrder = Object.values(targetItems).reduce((max, item) => {
      return Math.max(max, item.order ?? 0);
    }, -1);

    // 在目標日期新增項目
    const newItemId = Date.now().toString();
    const newItemRef = ref(
      db,
      `users/${currentUser}/dailyGoals/${targetDate}/items/${newItemId}`
    );
    const newItemData = {
      text: draggedItem.text,
      completed: draggedItem.completed,
      order: maxOrder + 1,
    };
    if (draggedItem.color) {
      newItemData.color = draggedItem.color;
    }
    await set(newItemRef, newItemData);

    // 從原日期刪除項目
    const oldItemRef = ref(
      db,
      `users/${currentUser}/dailyGoals/${draggedItem.sourceDate}/items/${draggedItem.itemId}`
    );
    await set(oldItemRef, null);
  } catch (error) {
    console.error("移動項目失敗:", error);
    alert("移動失敗，請稍後再試");
  }

  draggedItem = null;
}

// 同一天內重新排序項目
async function reorderDayItems(dateKey, fromId, toId) {
  if (!currentUser) return;

  const items = dailyGoalsData[dateKey]?.items || {};
  const sortedIds = getDayItemsSorted(items);
  const fromIndex = sortedIds.indexOf(fromId);
  const toIndex = sortedIds.indexOf(toId);

  if (fromIndex === -1 || toIndex === -1) return;

  // 移動元素
  sortedIds.splice(fromIndex, 1);
  sortedIds.splice(toIndex, 0, fromId);

  // 更新所有項目的 order
  const updates = {};
  sortedIds.forEach((id, index) => {
    updates[`${dateKey}/items/${id}/order`] = index;
  });

  try {
    const dailyGoalsRef = ref(db, `users/${currentUser}/dailyGoals`);
    await update(dailyGoalsRef, updates);
  } catch (error) {
    console.error("重新排序項目失敗:", error);
  }
}

// 格式化日期顯示
function formatDateDisplay(dateKey) {
  const [, month, day] = dateKey.split("-");
  return `${parseInt(month)}/${parseInt(day)}`;
}

// 套用單一項目到全月（從現有項目）
async function applyItemToMonth(text, color) {
  if (!currentUser) return;

  const confirmApply = confirm(
    `確定要將「${text}」套用到 ${currentYear} 年 ${
      currentMonth + 1
    } 月的所有日期嗎？\n\n（已有相同項目的日期會跳過）`
  );
  if (!confirmApply) return;

  try {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const updates = {};
    let addedCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = getDateKey(currentYear, currentMonth, day);
      const data = dailyGoalsData[dateKey];
      const items = data?.items || {};

      // 檢查該日是否已有相同名稱的項目
      const hasItem = Object.values(items).some((item) => item.text === text);
      if (!hasItem) {
        // 計算該日的最大 order
        const maxOrder = Object.values(items).reduce((max, item) => {
          return Math.max(max, item.order ?? 0);
        }, -1);

        const newItemId = Date.now().toString() + "_" + day;
        const itemData = {
          text: text,
          completed: false,
          order: maxOrder + 1,
        };
        if (color && color !== "blue") {
          itemData.color = color;
        }
        updates[`${dateKey}/items/${newItemId}`] = itemData;
        addedCount++;
      }
    }

    if (addedCount === 0) {
      alert("所有日期都已有此項目");
      return;
    }

    const dailyGoalsRef = ref(db, `users/${currentUser}/dailyGoals`);
    await update(dailyGoalsRef, updates);

    alert(`已成功將「${text}」新增到 ${addedCount} 天！`);
  } catch (error) {
    console.error("套用失敗:", error);
    alert("套用失敗，請稍後再試");
  }
}

// ==================== 編輯項目功能 ====================

// 開啟編輯彈窗
function openEditModal(itemId, itemText, itemColor) {
  editingItemId = itemId;
  editingItemOriginalText = itemText;
  editingItemOriginalColor = itemColor || "blue";
  editItemInput.value = itemText;

  // 設置顏色選擇器
  selectedEditItemColor = itemColor || "blue";
  editItemColorPicker.querySelectorAll(".color-option").forEach((o) => {
    o.classList.remove("selected");
    if (o.dataset.color === selectedEditItemColor) {
      o.classList.add("selected");
    }
  });

  editItemModal.classList.remove("hidden");
}

// 關閉編輯彈窗
closeEditModal.addEventListener("click", () => {
  editItemModal.classList.add("hidden");
  editingItemId = null;
  editingItemOriginalText = null;
  editingItemOriginalColor = null;
});

editItemModal.addEventListener("click", (e) => {
  if (e.target === editItemModal) {
    editItemModal.classList.add("hidden");
    editingItemId = null;
    editingItemOriginalText = null;
    editingItemOriginalColor = null;
  }
});

// 儲存編輯（只修改當天）
saveEditBtn.addEventListener("click", async () => {
  if (!selectedDate || !currentUser || !editingItemId) return;

  const newText = editItemInput.value.trim();
  if (!newText) {
    alert("請輸入項目內容");
    return;
  }

  try {
    const itemRef = ref(
      db,
      `users/${currentUser}/dailyGoals/${selectedDate}/items/${editingItemId}`
    );
    const updateData = { text: newText };
    if (selectedEditItemColor && selectedEditItemColor !== "blue") {
      updateData.color = selectedEditItemColor;
    } else {
      updateData.color = null; // 移除顏色屬性
    }
    await update(itemRef, updateData);

    editItemModal.classList.add("hidden");
    editingItemId = null;
    editingItemOriginalText = null;
    editingItemOriginalColor = null;
  } catch (error) {
    console.error("修改失敗:", error);
    alert("修改失敗，請稍後再試");
  }
});

// 修改並套用到全月（修改所有相同名稱的項目）
saveAndApplyEditBtn.addEventListener("click", async () => {
  if (!currentUser || !editingItemOriginalText) return;

  const newText = editItemInput.value.trim();
  if (!newText) {
    alert("請輸入項目內容");
    return;
  }

  const textChanged = newText !== editingItemOriginalText;
  const colorChanged = selectedEditItemColor !== editingItemOriginalColor;

  if (!textChanged && !colorChanged) {
    alert("沒有任何變更");
    return;
  }

  const confirmApply = confirm(
    `確定要將 ${currentYear} 年 ${
      currentMonth + 1
    } 月所有「${editingItemOriginalText}」修改嗎？`
  );
  if (!confirmApply) return;

  try {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const updates = {};
    let count = 0;

    // 遍歷當月每一天，找出所有相同名稱的項目
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = getDateKey(currentYear, currentMonth, day);
      const data = dailyGoalsData[dateKey];
      const items = data?.items || {};

      Object.keys(items).forEach((itemId) => {
        if (items[itemId].text === editingItemOriginalText) {
          if (textChanged) {
            updates[`${dateKey}/items/${itemId}/text`] = newText;
          }
          if (colorChanged) {
            if (selectedEditItemColor && selectedEditItemColor !== "blue") {
              updates[`${dateKey}/items/${itemId}/color`] =
                selectedEditItemColor;
            } else {
              updates[`${dateKey}/items/${itemId}/color`] = null;
            }
          }
          count++;
        }
      });
    }

    if (count === 0) {
      alert("找不到符合的項目");
      return;
    }

    const dailyGoalsRef = ref(db, `users/${currentUser}/dailyGoals`);
    await update(dailyGoalsRef, updates);

    editItemModal.classList.add("hidden");
    editingItemId = null;
    editingItemOriginalText = null;
    editingItemOriginalColor = null;

    alert(`已成功修改 ${count} 個項目！`);
  } catch (error) {
    console.error("批次修改失敗:", error);
    alert("修改失敗，請稍後再試");
  }
});

// ==================== 年度目標（多項目） ====================

let yearGoalsData = {};

async function loadYearGoals() {
  if (!currentUser) return;

  const yearKey = currentYear.toString();
  const yearGoalsRef = ref(
    db,
    `users/${currentUser}/yearlyGoals/${yearKey}/items`
  );

  try {
    const snapshot = await get(yearGoalsRef);
    if (snapshot.exists()) {
      yearGoalsData = snapshot.val();
    } else {
      yearGoalsData = {};
    }
    renderYearGoalsList();
  } catch (error) {
    console.error("讀取年度目標失敗:", error);
  }
}

function getYearGoalsSorted() {
  // 按 order 排序，沒有 order 的放最後
  return Object.keys(yearGoalsData).sort((a, b) => {
    const orderA = yearGoalsData[a].order ?? 999999;
    const orderB = yearGoalsData[b].order ?? 999999;
    return orderA - orderB;
  });
}

function renderYearGoalsList() {
  yearGoalsList.innerHTML = "";

  const sortedIds = getYearGoalsSorted();

  sortedIds.forEach((itemId) => {
    const item = yearGoalsData[itemId];
    const colorClass = item.color ? ` color-${item.color}` : " color-blue";
    const goalItem = document.createElement("div");
    goalItem.className = `year-goal-item${
      item.completed ? " completed" : ""
    }${colorClass}`;
    goalItem.draggable = true;
    goalItem.dataset.id = itemId;
    goalItem.innerHTML = `
            <span class="year-goal-drag-handle">⋮⋮</span>
            <input type="checkbox" class="year-goal-checkbox" data-id="${itemId}" ${
      item.completed ? "checked" : ""
    } />
            <span class="year-goal-text" data-id="${itemId}">${item.text}</span>
            <button class="year-goal-delete" data-id="${itemId}">×</button>
        `;
    yearGoalsList.appendChild(goalItem);

    // 拖曳事件
    goalItem.addEventListener("dragstart", (e) => {
      draggedYearGoal = goalItem;
      goalItem.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    goalItem.addEventListener("dragend", () => {
      draggedYearGoal = null;
      goalItem.classList.remove("dragging");
      document
        .querySelectorAll(".year-goal-item.drag-over")
        .forEach((el) => el.classList.remove("drag-over"));
    });

    goalItem.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (draggedYearGoal && draggedYearGoal !== goalItem) {
        goalItem.classList.add("drag-over");
      }
    });

    goalItem.addEventListener("dragleave", () => {
      goalItem.classList.remove("drag-over");
    });

    goalItem.addEventListener("drop", async (e) => {
      e.preventDefault();
      goalItem.classList.remove("drag-over");
      if (draggedYearGoal && draggedYearGoal !== goalItem) {
        const fromId = draggedYearGoal.dataset.id;
        const toId = goalItem.dataset.id;
        await reorderYearGoals(fromId, toId);
      }
    });
  });

  // 綁定事件
  yearGoalsList.querySelectorAll(".year-goal-checkbox").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      e.stopPropagation();
      toggleYearGoalItem(e.target.dataset.id, e.target.checked);
    });
  });
  yearGoalsList.querySelectorAll(".year-goal-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteYearGoalItem(e.target.dataset.id);
    });
  });
  yearGoalsList.querySelectorAll(".year-goal-text").forEach((text) => {
    text.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditYearGoalModal(e.target.dataset.id);
    });
  });
}

async function reorderYearGoals(fromId, toId) {
  const sortedIds = getYearGoalsSorted();
  const fromIndex = sortedIds.indexOf(fromId);
  const toIndex = sortedIds.indexOf(toId);

  // 移動元素
  sortedIds.splice(fromIndex, 1);
  sortedIds.splice(toIndex, 0, fromId);

  // 更新所有項目的 order
  const yearKey = currentYear.toString();
  const updates = {};
  sortedIds.forEach((id, index) => {
    updates[`users/${currentUser}/yearlyGoals/${yearKey}/items/${id}/order`] =
      index;
  });

  try {
    await update(ref(db), updates);
    await loadYearGoals();
  } catch (error) {
    console.error("重新排序失敗:", error);
  }
}

function openEditYearGoalModal(itemId) {
  const item = yearGoalsData[itemId];
  if (!item) return;

  editingYearGoalId = itemId;
  editYearGoalInput.value = item.text;
  selectedEditYearGoalColor = item.color || "blue";

  // 更新顏色選擇器
  editYearGoalColorPicker.querySelectorAll(".color-option").forEach((opt) => {
    opt.classList.toggle(
      "selected",
      opt.dataset.color === selectedEditYearGoalColor
    );
  });

  editYearGoalModal.classList.remove("hidden");
}

async function saveEditYearGoal() {
  if (!editingYearGoalId || !currentUser) return;

  const newText = editYearGoalInput.value.trim();
  if (!newText) {
    alert("請輸入年度目標");
    return;
  }

  const yearKey = currentYear.toString();
  const itemRef = ref(
    db,
    `users/${currentUser}/yearlyGoals/${yearKey}/items/${editingYearGoalId}`
  );

  try {
    const updateData = { text: newText };
    if (selectedEditYearGoalColor) {
      updateData.color = selectedEditYearGoalColor;
    }
    await update(itemRef, updateData);
    editYearGoalModal.classList.add("hidden");
    editingYearGoalId = null;
    await loadYearGoals();
  } catch (error) {
    console.error("更新年度目標失敗:", error);
    alert("更新失敗，請稍後再試");
  }
}

async function addYearGoalItem() {
  if (!currentUser) return;

  const text = yearGoalInput.value.trim();
  if (!text) {
    alert("請輸入年度目標");
    return;
  }

  const yearKey = currentYear.toString();
  const itemId = Date.now().toString();
  const itemRef = ref(
    db,
    `users/${currentUser}/yearlyGoals/${yearKey}/items/${itemId}`
  );

  // 計算新項目的 order（放在最後）
  const maxOrder = Object.values(yearGoalsData).reduce((max, item) => {
    return Math.max(max, item.order ?? 0);
  }, -1);

  try {
    const itemData = { text: text, completed: false, order: maxOrder + 1 };
    if (selectedYearGoalColor && selectedYearGoalColor !== "blue") {
      itemData.color = selectedYearGoalColor;
    }
    await set(itemRef, itemData);
    yearGoalInput.value = "";
    await loadYearGoals();
  } catch (error) {
    console.error("新增年度目標失敗:", error);
    alert("新增失敗，請稍後再試");
  }
}

async function toggleYearGoalItem(itemId, completed) {
  if (!currentUser) return;

  const yearKey = currentYear.toString();
  const itemRef = ref(
    db,
    `users/${currentUser}/yearlyGoals/${yearKey}/items/${itemId}`
  );

  try {
    await update(itemRef, { completed: completed });
    await loadYearGoals();
  } catch (error) {
    console.error("更新年度目標狀態失敗:", error);
  }
}

async function deleteYearGoalItem(itemId) {
  if (!currentUser) return;
  if (!confirm("確定要刪除此年度目標嗎？")) return;

  const yearKey = currentYear.toString();
  const itemRef = ref(
    db,
    `users/${currentUser}/yearlyGoals/${yearKey}/items/${itemId}`
  );

  try {
    await set(itemRef, null);
    await loadYearGoals();
  } catch (error) {
    console.error("刪除年度目標失敗:", error);
  }
}

// 年度目標顏色選擇
yearGoalColorPicker.querySelectorAll(".color-option").forEach((option) => {
  option.addEventListener("click", (e) => {
    yearGoalColorPicker
      .querySelectorAll(".color-option")
      .forEach((o) => o.classList.remove("selected"));
    e.target.classList.add("selected");
    selectedYearGoalColor = e.target.dataset.color;
  });
});

// 年度目標按鈕事件
addYearGoalBtn.addEventListener("click", addYearGoalItem);
yearGoalInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addYearGoalItem();
});

// 編輯年度目標彈窗事件
closeEditYearGoalModal.addEventListener("click", () => {
  editYearGoalModal.classList.add("hidden");
  editingYearGoalId = null;
});

editYearGoalModal.addEventListener("click", (e) => {
  if (e.target === editYearGoalModal) {
    editYearGoalModal.classList.add("hidden");
    editingYearGoalId = null;
  }
});

editYearGoalColorPicker.querySelectorAll(".color-option").forEach((option) => {
  option.addEventListener("click", (e) => {
    editYearGoalColorPicker
      .querySelectorAll(".color-option")
      .forEach((o) => o.classList.remove("selected"));
    e.target.classList.add("selected");
    selectedEditYearGoalColor = e.target.dataset.color;
  });
});

saveEditYearGoalBtn.addEventListener("click", saveEditYearGoal);
editYearGoalInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") saveEditYearGoal();
});

// ==================== 月目標（多項目） ====================

let monthGoalsData = {};

async function loadMonthGoal() {
  if (!currentUser) return;

  // 更新月目標標題
  monthGoalTitle.textContent = `📅 ${currentMonth + 1}月目標`;

  const monthKey = getMonthKey(currentYear, currentMonth);
  const monthGoalRef = ref(
    db,
    `users/${currentUser}/monthlyGoals/${monthKey}/items`
  );

  try {
    const snapshot = await get(monthGoalRef);
    if (snapshot.exists()) {
      monthGoalsData = snapshot.val();
    } else {
      monthGoalsData = {};
    }
    renderMonthGoalsList();
  } catch (error) {
    console.error("讀取月目標失敗:", error);
  }
}

function getMonthGoalsSorted() {
  // 按 order 排序，沒有 order 的放最後
  return Object.keys(monthGoalsData).sort((a, b) => {
    const orderA = monthGoalsData[a].order ?? 999999;
    const orderB = monthGoalsData[b].order ?? 999999;
    return orderA - orderB;
  });
}

function renderMonthGoalsList() {
  monthGoalsList.innerHTML = "";

  const sortedIds = getMonthGoalsSorted();

  sortedIds.forEach((itemId) => {
    const item = monthGoalsData[itemId];
    const colorClass = item.color ? ` color-${item.color}` : " color-blue";
    const row = document.createElement("div");
    row.className = `goal-item-row${
      item.completed ? " completed" : ""
    }${colorClass}`;
    row.draggable = true;
    row.dataset.id = itemId;
    row.innerHTML = `
            <span class="goal-item-drag-handle">⋮⋮</span>
            <input type="checkbox" class="goal-item-checkbox" data-id="${itemId}" ${
      item.completed ? "checked" : ""
    } />
            <span class="goal-item-text" data-id="${itemId}">${item.text}</span>
            <button class="goal-item-delete" data-id="${itemId}">×</button>
        `;
    monthGoalsList.appendChild(row);

    // 拖曳事件
    row.addEventListener("dragstart", (e) => {
      draggedMonthGoal = row;
      row.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    row.addEventListener("dragend", () => {
      draggedMonthGoal = null;
      row.classList.remove("dragging");
      document
        .querySelectorAll(".goal-item-row.drag-over")
        .forEach((el) => el.classList.remove("drag-over"));
    });

    row.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (draggedMonthGoal && draggedMonthGoal !== row) {
        row.classList.add("drag-over");
      }
    });

    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-over");
    });

    row.addEventListener("drop", async (e) => {
      e.preventDefault();
      row.classList.remove("drag-over");
      if (draggedMonthGoal && draggedMonthGoal !== row) {
        const fromId = draggedMonthGoal.dataset.id;
        const toId = row.dataset.id;
        await reorderMonthGoals(fromId, toId);
      }
    });
  });

  // 綁定事件
  monthGoalsList.querySelectorAll(".goal-item-checkbox").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      e.stopPropagation();
      toggleMonthGoalItem(e.target.dataset.id, e.target.checked);
    });
  });
  monthGoalsList.querySelectorAll(".goal-item-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteMonthGoalItem(e.target.dataset.id);
    });
  });
  monthGoalsList.querySelectorAll(".goal-item-text").forEach((text) => {
    text.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditMonthGoalModal(e.target.dataset.id);
    });
  });
}

async function reorderMonthGoals(fromId, toId) {
  const sortedIds = getMonthGoalsSorted();
  const fromIndex = sortedIds.indexOf(fromId);
  const toIndex = sortedIds.indexOf(toId);

  // 移動元素
  sortedIds.splice(fromIndex, 1);
  sortedIds.splice(toIndex, 0, fromId);

  // 更新所有項目的 order
  const monthKey = getMonthKey(currentYear, currentMonth);
  const updates = {};
  sortedIds.forEach((id, index) => {
    updates[`users/${currentUser}/monthlyGoals/${monthKey}/items/${id}/order`] =
      index;
  });

  try {
    await update(ref(db), updates);
    await loadMonthGoal();
  } catch (error) {
    console.error("重新排序失敗:", error);
  }
}

function openEditMonthGoalModal(itemId) {
  const item = monthGoalsData[itemId];
  if (!item) return;

  editingMonthGoalId = itemId;
  editMonthGoalInput.value = item.text;
  selectedEditMonthGoalColor = item.color || "blue";

  // 更新顏色選擇器
  editMonthGoalColorPicker.querySelectorAll(".color-option").forEach((opt) => {
    opt.classList.toggle(
      "selected",
      opt.dataset.color === selectedEditMonthGoalColor
    );
  });

  editMonthGoalModal.classList.remove("hidden");
}

async function saveEditMonthGoal() {
  if (!editingMonthGoalId || !currentUser) return;

  const newText = editMonthGoalInput.value.trim();
  if (!newText) {
    alert("請輸入月目標");
    return;
  }

  const monthKey = getMonthKey(currentYear, currentMonth);
  const itemRef = ref(
    db,
    `users/${currentUser}/monthlyGoals/${monthKey}/items/${editingMonthGoalId}`
  );

  try {
    const updateData = { text: newText };
    if (selectedEditMonthGoalColor) {
      updateData.color = selectedEditMonthGoalColor;
    }
    await update(itemRef, updateData);
    editMonthGoalModal.classList.add("hidden");
    editingMonthGoalId = null;
    await loadMonthGoal();
  } catch (error) {
    console.error("更新月目標失敗:", error);
    alert("更新失敗，請稍後再試");
  }
}

async function addMonthGoalItem() {
  if (!currentUser) return;

  const text = monthGoalInput.value.trim();
  if (!text) {
    alert("請輸入月目標");
    return;
  }

  const monthKey = getMonthKey(currentYear, currentMonth);
  const itemId = Date.now().toString();
  const itemRef = ref(
    db,
    `users/${currentUser}/monthlyGoals/${monthKey}/items/${itemId}`
  );

  // 計算新項目的 order（放在最後）
  const maxOrder = Object.values(monthGoalsData).reduce((max, item) => {
    return Math.max(max, item.order ?? 0);
  }, -1);

  try {
    const itemData = { text: text, completed: false, order: maxOrder + 1 };
    if (selectedMonthGoalColor && selectedMonthGoalColor !== "blue") {
      itemData.color = selectedMonthGoalColor;
    }
    await set(itemRef, itemData);
    monthGoalInput.value = "";
    await loadMonthGoal();
  } catch (error) {
    console.error("新增月目標失敗:", error);
    alert("新增失敗，請稍後再試");
  }
}

async function toggleMonthGoalItem(itemId, completed) {
  if (!currentUser) return;

  const monthKey = getMonthKey(currentYear, currentMonth);
  const itemRef = ref(
    db,
    `users/${currentUser}/monthlyGoals/${monthKey}/items/${itemId}`
  );

  try {
    await update(itemRef, { completed: completed });
    await loadMonthGoal();
  } catch (error) {
    console.error("更新月目標狀態失敗:", error);
  }
}

async function deleteMonthGoalItem(itemId) {
  if (!currentUser) return;
  if (!confirm("確定要刪除此月目標嗎？")) return;

  const monthKey = getMonthKey(currentYear, currentMonth);
  const itemRef = ref(
    db,
    `users/${currentUser}/monthlyGoals/${monthKey}/items/${itemId}`
  );

  try {
    await set(itemRef, null);
    await loadMonthGoal();
  } catch (error) {
    console.error("刪除月目標失敗:", error);
  }
}

// 月目標顏色選擇
monthGoalColorPicker.querySelectorAll(".color-option").forEach((option) => {
  option.addEventListener("click", (e) => {
    monthGoalColorPicker
      .querySelectorAll(".color-option")
      .forEach((o) => o.classList.remove("selected"));
    e.target.classList.add("selected");
    selectedMonthGoalColor = e.target.dataset.color;
  });
});

addMonthGoalBtn.addEventListener("click", addMonthGoalItem);
monthGoalInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addMonthGoalItem();
});

// 編輯月目標彈窗事件
closeEditMonthGoalModal.addEventListener("click", () => {
  editMonthGoalModal.classList.add("hidden");
  editingMonthGoalId = null;
});

editMonthGoalModal.addEventListener("click", (e) => {
  if (e.target === editMonthGoalModal) {
    editMonthGoalModal.classList.add("hidden");
    editingMonthGoalId = null;
  }
});

editMonthGoalColorPicker.querySelectorAll(".color-option").forEach((option) => {
  option.addEventListener("click", (e) => {
    editMonthGoalColorPicker
      .querySelectorAll(".color-option")
      .forEach((o) => o.classList.remove("selected"));
    e.target.classList.add("selected");
    selectedEditMonthGoalColor = e.target.dataset.color;
  });
});

saveEditMonthGoalBtn.addEventListener("click", saveEditMonthGoal);
editMonthGoalInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") saveEditMonthGoal();
});

// ==================== 達成率計算 ====================

function calculateProgressRate() {
  const today = getToday();
  const isCurrentMonth =
    currentYear === today.year && currentMonth === today.month;

  let totalItems = 0;
  let completedItems = 0;
  let daysWithItems = 0;
  let daysAllCompleted = 0;

  const maxDay = isCurrentMonth
    ? today.day
    : currentYear < today.year ||
      (currentYear === today.year && currentMonth < today.month)
    ? new Date(currentYear, currentMonth + 1, 0).getDate()
    : 0;

  if (maxDay === 0) {
    // 未來月份：無法計算
    progressRate.textContent = "--%";
    progressDetail.textContent = "未來月份無法計算";
    return;
  }

  for (let day = 1; day <= maxDay; day++) {
    const dateKey = getDateKey(currentYear, currentMonth, day);
    const data = dailyGoalsData[dateKey];
    const items = data?.items || {};
    const itemKeys = Object.keys(items);

    if (itemKeys.length > 0) {
      daysWithItems++;
      totalItems += itemKeys.length;

      let dayCompleted = 0;
      itemKeys.forEach((id) => {
        if (items[id].completed === true) {
          completedItems++;
          dayCompleted++;
        }
      });

      if (dayCompleted === itemKeys.length) {
        daysAllCompleted++;
      }
    }
  }

  const rate =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  progressRate.textContent = `${rate}%`;
  progressDetail.textContent = `已完成 ${completedItems} 項 / 共 ${totalItems} 項（${daysAllCompleted}/${daysWithItems} 天全完成）`;

  // 更新 Firebase 中的達成率
  if (currentUser && isCurrentMonth) {
    const monthKey = getMonthKey(currentYear, currentMonth);
    const monthGoalRef = ref(
      db,
      `users/${currentUser}/monthlyGoals/${monthKey}`
    );
    update(monthGoalRef, { progressRate: rate / 100 }).catch(console.error);
  }
}

// ==================== 即時監聽 ====================

function setupRealtimeListeners() {
  if (!currentUser) return;

  // 監聽每日目標變化
  const dailyGoalsRef = ref(db, `users/${currentUser}/dailyGoals`);
  onValue(dailyGoalsRef, (snapshot) => {
    if (snapshot.exists()) {
      dailyGoalsData = snapshot.val();
    } else {
      dailyGoalsData = {};
    }
    updateCalendarStatus();

    // 若彈窗已開啟，即時更新項目列表
    if (selectedDate && !dailyModal.classList.contains("hidden")) {
      renderItemsList();
    }
  });
}

// ==================== 統計總覽功能 ====================

const viewStatsBtn = document.getElementById("viewStatsBtn");
const statsModal = document.getElementById("statsModal");
const closeStatsModal = document.getElementById("closeStatsModal");
const statsContent = document.getElementById("statsContent");
const statsGridViewBtn = document.getElementById("statsGridViewBtn");
const statsChartViewBtn = document.getElementById("statsChartViewBtn");

// 使用者顏色對應
const userColors = ["#3498DB", "#E74C3C", "#2ECC71", "#F1C40F", "#9B59B6", "#E91E63", "#1ABC9C", "#E67E22"];

// 統計資料快取
let cachedStatsData = null;
let currentStatsView = "grid"; // "grid" or "chart"

// 開啟統計彈窗
viewStatsBtn.addEventListener("click", async () => {
  statsModal.classList.remove("hidden");
  statsContent.innerHTML = '<p class="loading-text">載入中...</p>';
  cachedStatsData = null;
  await loadAllUsersStats();
});

// 關閉統計彈窗
closeStatsModal.addEventListener("click", () => {
  statsModal.classList.add("hidden");
});

statsModal.addEventListener("click", (e) => {
  if (e.target === statsModal) {
    statsModal.classList.add("hidden");
  }
});

// 切換視圖按鈕
statsGridViewBtn.addEventListener("click", () => {
  if (currentStatsView === "grid") return;
  currentStatsView = "grid";
  statsGridViewBtn.classList.add("active");
  statsChartViewBtn.classList.remove("active");
  renderStatsView();
});

statsChartViewBtn.addEventListener("click", () => {
  if (currentStatsView === "chart") return;
  currentStatsView = "chart";
  statsChartViewBtn.classList.add("active");
  statsGridViewBtn.classList.remove("active");
  renderStatsView();
});

// 載入所有使用者的統計資料
async function loadAllUsersStats() {
  try {
    // 取得所有白名單使用者
    const whitelistRef = ref(db, "loginWhitelist");
    const whitelistSnapshot = await get(whitelistRef);

    if (!whitelistSnapshot.exists()) {
      statsContent.innerHTML = '<p class="loading-text">沒有使用者資料</p>';
      return;
    }

    const users = Object.keys(whitelistSnapshot.val());
    cachedStatsData = [];

    for (let i = 0; i < users.length; i++) {
      const phone = users[i];
      const userColor = userColors[i % userColors.length];

      // 取得該使用者 2026 年的資料
      const monthlyRates = await getUserMonthlyRates(phone, 2026);
      const yearGoals = await getUserYearGoals(phone, 2026);

      cachedStatsData.push({
        phone,
        color: userColor,
        monthlyRates,
        yearGoals
      });
    }

    renderStatsView();
  } catch (error) {
    console.error("載入統計資料失敗:", error);
    statsContent.innerHTML = '<p class="loading-text">載入失敗，請稍後再試</p>';
  }
}

// 根據當前視圖模式渲染統計內容
function renderStatsView() {
  if (!cachedStatsData || cachedStatsData.length === 0) {
    statsContent.innerHTML = '<p class="loading-text">沒有使用者資料</p>';
    return;
  }

  let html = "";

  if (currentStatsView === "grid") {
    cachedStatsData.forEach((userData) => {
      html += renderUserStatsSection(userData.phone, userData.color, userData.monthlyRates, userData.yearGoals);
    });
  } else {
    cachedStatsData.forEach((userData) => {
      html += renderUserChartSection(userData.phone, userData.color, userData.monthlyRates, userData.yearGoals);
    });
  }

  statsContent.innerHTML = html;
}

// 取得使用者各月達成率
async function getUserMonthlyRates(phone, year) {
  const rates = [];

  for (let month = 0; month < 12; month++) {
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

    try {
      // 取得該月的每日目標資料
      const dailyGoalsRef = ref(db, `users/${phone}/dailyGoals`);
      const snapshot = await get(dailyGoalsRef);

      let totalItems = 0;
      let completedItems = 0;

      if (snapshot.exists()) {
        const dailyGoals = snapshot.val();

        // 計算當月的項目
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayData = dailyGoals[dateKey];

          if (dayData && dayData.items) {
            Object.values(dayData.items).forEach((item) => {
              totalItems++;
              if (item.completed) completedItems++;
            });
          }
        }
      }

      const rate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : null;
      rates.push({ month: month + 1, rate });
    } catch (error) {
      rates.push({ month: month + 1, rate: null });
    }
  }

  return rates;
}

// 取得使用者年度目標
async function getUserYearGoals(phone, year) {
  try {
    const yearGoalsRef = ref(db, `users/${phone}/yearlyGoals/${year}/items`);
    const snapshot = await get(yearGoalsRef);

    if (snapshot.exists()) {
      const goals = snapshot.val();
      return Object.values(goals).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    }
    return [];
  } catch (error) {
    return [];
  }
}

// 渲染單一使用者的統計區塊
function renderUserStatsSection(phone, color, monthlyRates, yearGoals) {
  // 月達成率 HTML
  let monthsHtml = "";
  monthlyRates.forEach((m) => {
    const rateClass = m.rate === null ? "none" : m.rate >= 70 ? "high" : m.rate >= 40 ? "medium" : "low";
    const rateText = m.rate === null ? "--" : `${m.rate}%`;
    monthsHtml += `
      <div class="stats-month">
        <div class="stats-month-label">${m.month}月</div>
        <div class="stats-month-rate ${rateClass}">${rateText}</div>
      </div>
    `;
  });

  // 年度目標 HTML
  let goalsHtml = "";
  if (yearGoals.length > 0) {
    yearGoals.forEach((goal) => {
      const statusClass = goal.completed ? "completed" : "pending";
      const statusIcon = goal.completed ? "✓" : "";
      const textClass = goal.completed ? "completed" : "";
      goalsHtml += `
        <div class="stats-goal-item">
          <span class="goal-status ${statusClass}">${statusIcon}</span>
          <span class="goal-text ${textClass}">${goal.text}</span>
        </div>
      `;
    });
  } else {
    goalsHtml = '<p class="stats-no-goals">尚未設定年度目標</p>';
  }

  return `
    <div class="stats-user-section">
      <div class="stats-user-header">
        <div class="stats-user-avatar" style="background-color: ${color}">👤</div>
        <span class="stats-user-name">${phone}</span>
      </div>
      <div class="stats-months">${monthsHtml}</div>
      <div class="stats-year-goals">
        <div class="stats-year-goals-title">🎯 年度目標</div>
        ${goalsHtml}
      </div>
    </div>
  `;
}

// 渲染單一使用者的圖表區塊
function renderUserChartSection(phone, color, monthlyRates, yearGoals) {
  // 長條圖 HTML
  let barsHtml = "";
  monthlyRates.forEach((m) => {
    const rate = m.rate ?? 0;
    const heightPercent = m.rate === null ? 3 : Math.max(rate, 3); // 最小高度 3%
    const rateClass = m.rate === null ? "none" : rate >= 70 ? "high" : rate >= 40 ? "medium" : "low";
    const tooltipText = m.rate === null ? "無資料" : `${m.rate}%`;

    barsHtml += `
      <div class="stats-bar-wrapper">
        <div class="stats-bar ${rateClass}" style="height: ${heightPercent}%">
          <span class="stats-bar-tooltip">${tooltipText}</span>
          <span class="stats-bar-label">${m.month}月</span>
        </div>
      </div>
    `;
  });

  // 年度目標 HTML
  let goalsHtml = "";
  if (yearGoals.length > 0) {
    yearGoals.forEach((goal) => {
      const statusClass = goal.completed ? "completed" : "pending";
      const statusIcon = goal.completed ? "✓" : "";
      const textClass = goal.completed ? "completed" : "";
      goalsHtml += `
        <div class="stats-goal-item">
          <span class="goal-status ${statusClass}">${statusIcon}</span>
          <span class="goal-text ${textClass}">${goal.text}</span>
        </div>
      `;
    });
  } else {
    goalsHtml = '<p class="stats-no-goals">尚未設定年度目標</p>';
  }

  return `
    <div class="stats-chart-section">
      <div class="stats-chart-header">
        <div class="stats-chart-avatar" style="background-color: ${color}">👤</div>
        <span class="stats-chart-name">${phone}</span>
      </div>
      <div class="stats-chart-container">
        <div class="stats-chart">
          <div class="stats-chart-y-axis">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>
          <div class="stats-chart-bars">
            <div class="stats-chart-grid">
              <div class="stats-chart-grid-line"></div>
              <div class="stats-chart-grid-line"></div>
              <div class="stats-chart-grid-line"></div>
              <div class="stats-chart-grid-line"></div>
              <div class="stats-chart-grid-line"></div>
            </div>
            ${barsHtml}
          </div>
        </div>
      </div>
      <div class="stats-chart-goals">
        <div class="stats-year-goals-title">🎯 年度目標</div>
        ${goalsHtml}
      </div>
    </div>
  `;
}

// ==================== 初始化 ====================

// 網站載入時先檢查/建立白名單，再檢查登入狀態
initWhitelist().then(() => {
  checkLogin();
});
