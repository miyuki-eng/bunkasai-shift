import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


// =========================
// Firebase設定
// =========================

const firebaseConfig = {
    apiKey: "AIzaSyD_gYOoHpgbxHH4u7pEJIDK0yX7IRBlD-A",
    authDomain: "bunkasai-shift-ba044.firebaseapp.com",
    databaseURL: "https://bunkasai-shift-ba044-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bunkasai-shift-ba044",
    storageBucket: "bunkasai-shift-ba044.firebasestorage.app",
    messagingSenderId: "415230184888",
    appId: "1:415230184888:web:ccb285a6843c558cf3134d"
};


// =========================
// Firebase初期化
// =========================

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const staffRef = ref(database, "staff");
const timeSlotsRef = ref(database, "timeSlots");
const shiftDataRef = ref(database, "shiftData");


// =========================
// データ
// =========================

let staffData = [];
let timeSlots = [];
let shiftData = [];

let selectedDay = "1";


// =========================
// HTML
// =========================

const timeSelect =
    document.getElementById("timeSelect");

const staffSelect =
    document.getElementById("staffSelect");

const registerButton =
    document.getElementById("registerButton");

const shiftList =
    document.getElementById("shiftList");

const shiftTitle =
    document.getElementById("shiftTitle");

const backButton =
    document.getElementById("backButton");

const dayTabs =
    document.querySelectorAll(".day-tab");


// =========================
// スタッフ読み込み
// =========================

onValue(staffRef, snapshot => {

    const data = snapshot.val();

    staffData = [];

    if (data) {

        Object.entries(data).forEach(
            ([id, person]) => {

                staffData.push({
                    id: id,
                    name: person.name,
                    jobs: person.jobs || []
                });

            }
        );

    }

    loadStaff();

});


// =========================
// 時間帯読み込み
// =========================

onValue(timeSlotsRef, snapshot => {

    const data = snapshot.val();

    timeSlots = [];

    if (data) {

        Object.entries(data).forEach(
            ([id, slot]) => {

                timeSlots.push({

                    id: id,

                    day: String(slot.day),

                    start: slot.start,

                    end: slot.end

                });

            }
        );

    }

    loadTimes();

});


// =========================
// シフト読み込み
// =========================

onValue(shiftDataRef, snapshot => {

    const data = snapshot.val();

    shiftData = [];

    if (data) {

        Object.entries(data).forEach(
            ([id, shift]) => {

                shiftData.push({

                    id: id,

                    day: String(
                        shift.day
                    ),

                    time:
                        shift.time || "",

                    sales:
                        Array.isArray(shift.sales)
                            ? shift.sales
                            : shift.sales
                                ? Object.values(
                                    shift.sales
                                )
                                : [],

                    workshop:
                        Array.isArray(shift.workshop)
                            ? shift.workshop
                            : shift.workshop
                                ? Object.values(
                                    shift.workshop
                                )
                                : [],

                    break:
                        Array.isArray(shift.break)
                            ? shift.break
                            : shift.break
                                ? Object.values(
                                    shift.break
                                )
                                : []

                });

            }
        );

    }

    console.log(
        "🔥 Firebaseシフト読み込み:",
        shiftData
    );

    displayShifts();

});

// =========================
// 時間帯表示
// =========================

function loadTimes() {

    timeSelect.innerHTML = `
        <option value="">
            時間帯を選択してください
        </option>
    `;

    const daySlots =
        timeSlots
            .filter(
                slot =>
                    String(slot.day) ===
                    String(selectedDay)
            )
            .sort(
                (a, b) =>
                    a.start.localeCompare(b.start)
            );


    daySlots.forEach(slot => {

        const option =
            document.createElement("option");

        option.value =
            `${slot.start}〜${slot.end}`;

        option.textContent =
            `${slot.start}〜${slot.end}`;

        timeSelect.appendChild(option);

    });

}


// =========================
// スタッフ表示
// =========================

function loadStaff() {

    staffSelect.innerHTML = `
        <option value="">
            スタッフを選択してください
        </option>
    `;

    staffData.forEach(person => {

        const option =
            document.createElement("option");

        option.value =
            person.name;

        option.textContent =
            person.name;

        staffSelect.appendChild(option);

    });

}


// =========================
// シフト登録
// =========================

registerButton.addEventListener(
    "click",
    async function() {

        const time =
            timeSelect.value;

        const staff =
            staffSelect.value;

        const jobElement =
            document.querySelector(
                'input[name="job"]:checked'
            );


        // 入力確認

        if (!time) {

            alert(
                "時間帯を選択してください。"
            );

            return;

        }


        if (!staff) {

            alert(
                "スタッフを選択してください。"
            );

            return;

        }


        if (!jobElement) {

            alert(
                "担当を選択してください。"
            );

            return;

        }


        const job =
            jobElement.value;


        // =========================
        // 同じ時間の重複確認
        // =========================

        const alreadyExists =
            shiftData.some(shift => {

                if (
                    String(shift.day) !==
                    String(selectedDay)
                ) {

                    return false;

                }

                if (
                    shift.time !== time
                ) {

                    return false;

                }


                return (

                    shift.sales.includes(staff) ||

                    shift.workshop.includes(staff) ||

                    shift.break.includes(staff)

                );

            });


        if (alreadyExists) {

            alert(
                "このスタッフには、すでにこの時間のシフトがあります。"
            );

            return;

        }


        // =========================
        // 同じ時間帯のシフトを探す
        // =========================

        let shift =
            shiftData.find(
                item =>
                    String(item.day) ===
                    String(selectedDay) &&
                    item.time === time
            );


        // =========================
        // なければ新規作成
        // =========================

        if (!shift) {

            const newRef = push(shiftDataRef);

            shift = {

                id: newRef.key,

                day: String(selectedDay),

                time: time,

                sales: [],

                workshop: [],

                break: []

            };

        }


        // =========================
        // 担当者追加
        // =========================

        if (
            !Array.isArray(
                shift[job]
            )
        ) {

            shift[job] = [];

        }


        shift[job].push(staff);


        // =========================
        // Firebase保存
        // =========================

        await set(
            ref(
                database,
                `shiftData/${shift.id}`
            ),
            {

                day:
                    shift.day,

                time:
                    shift.time,

                sales:
                    shift.sales,

                workshop:
                    shift.workshop,

                break:
                    shift.break

            }
        );


        // フォームリセット

        resetForm();


        alert(
            "シフトを登録しました！"
        );

    }
);


// =========================
// フォームリセット
// =========================

function resetForm() {

    timeSelect.value = "";

    staffSelect.value = "";

    document
        .querySelectorAll(
            'input[name="job"]'
        )
        .forEach(
            radio =>
                radio.checked = false
        );

}


// =========================
// シフト表示
// =========================

function displayShifts() {

    shiftTitle.textContent =
        `${selectedDay}日目のシフト`;

    shiftList.innerHTML = "";


    const dayShifts =
        shiftData
            .filter(
                shift =>
                    String(shift.day) ===
                    String(selectedDay)
            )
            .sort(
                (a, b) =>
                    a.time.localeCompare(b.time)
            );


    if (
        dayShifts.length === 0
    ) {

        shiftList.innerHTML = `
            <p class="empty-message">
                まだシフトが登録されていません。
            </p>
        `;

        return;

    }


    dayShifts.forEach(shift => {

        const item =
            document.createElement("div");

        item.className =
            "shift-edit-item";


        let html = `

            <div class="shift-edit-time">
                🕐 ${shift.time}
            </div>

        `;


        // 物販

        if (
            shift.sales.length > 0
        ) {

            html += `
                <div class="shift-person-group">

                    <div class="shift-job-title">
                        🛍️ 物販
                    </div>
            `;

            shift.sales.forEach(name => {

                html += createPersonHTML(
                    shift,
                    name,
                    "sales"
                );

            });

            html += `</div>`;

        }


        // ワークショップ

        if (
            shift.workshop.length > 0
        ) {

            html += `
                <div class="shift-person-group">

                    <div class="shift-job-title">
                        🎨 ワークショップ
                    </div>
            `;

            shift.workshop.forEach(name => {

                html += createPersonHTML(
                    shift,
                    name,
                    "workshop"
                );

            });

            html += `</div>`;

        }


        // 休憩

        if (
            shift.break.length > 0
        ) {

            html += `
                <div class="shift-person-group">

                    <div class="shift-job-title">
                        ☕ 休憩
                    </div>
            `;

            shift.break.forEach(name => {

                html += createPersonHTML(
                    shift,
                    name,
                    "break"
                );

            });

            html += `</div>`;

        }


        item.innerHTML = html;

        shiftList.appendChild(item);

    });


    addButtonEvents();

}


// =========================
// スタッフHTML
// =========================

function createPersonHTML(
    shift,
    name,
    job
) {

    return `

        <div class="shift-person">

            <span>
                ${name}
            </span>

            <div>

                <button
                    class="delete-person-button"
                    data-id="${shift.id}"
                    data-name="${name}"
                    data-job="${job}"
                >
                    🗑️
                </button>

            </div>

        </div>

    `;

}


// =========================
// 削除ボタン
// =========================

function addButtonEvents() {

    document
        .querySelectorAll(
            ".delete-person-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    deletePersonShift(
                        this.dataset.id,
                        this.dataset.name,
                        this.dataset.job
                    );

                }
            );

        });

}


// =========================
// シフト削除
// =========================

async function deletePersonShift(
    id,
    name,
    job
) {

    const shift =
        shiftData.find(
            item =>
                item.id === id
        );


    if (!shift) {

        return;

    }


    if (
        !confirm(
            `${name}さんのシフトを削除しますか？`
        )
    ) {

        return;

    }


    shift[job] =
        shift[job].filter(
            person =>
                person !== name
        );


    const empty =
        shift.sales.length === 0 &&
        shift.workshop.length === 0 &&
        shift.break.length === 0;


    if (empty) {

        await remove(
            ref(
                database,
                `shiftData/${id}`
            )
        );

    } else {

        await set(
            ref(
                database,
                `shiftData/${id}`
            ),
            {

                day: shift.day,

                time: shift.time,

                sales: shift.sales,

                workshop: shift.workshop,

                break: shift.break

            }
        );

    }


    alert(
        "シフトを削除しました。"
    );

}


// =========================
// 日付変更
// =========================

dayTabs.forEach(tab => {

    tab.addEventListener(
        "click",
        function() {

            dayTabs.forEach(
                otherTab =>
                    otherTab.classList.remove(
                        "active"
                    )
            );

            this.classList.add(
                "active"
            );

            selectedDay =
                this.dataset.day;

            loadTimes();

            displayShifts();

        }
    );

});


// =========================
// 戻る
// =========================

backButton.addEventListener(
    "click",
    function() {

        location.href =
            "index.html";

    }
);