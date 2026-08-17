// =========================
// Firebase
// =========================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


// =========================
// Firebase設定
// =========================

const firebaseConfig = {

    apiKey: "AIzaSyD_gYOoHpgbxHH4u7pEJIDK0yX7IRBlD-A",

    authDomain:
        "bunkasai-shift-ba044.firebaseapp.com",

    databaseURL:
        "https://bunkasai-shift-ba044-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "bunkasai-shift-ba044",

    storageBucket:
        "bunkasai-shift-ba044.firebasestorage.app",

    messagingSenderId:
        "415230184888",

    appId:
        "1:415230184888:web:ccb285a6843c558cf3134d"

};


// =========================
// Firebase初期化
// =========================

const app =
    initializeApp(firebaseConfig);

const database =
    getDatabase(app);


// =========================
// Firebase参照
// =========================

const staffRef =
    ref(database, "staff");

const shiftDataRef =
    ref(database, "shiftData");


// =========================
// データ
// =========================

let staffData = [];

let shiftData = [];


// =========================
// 現在の日
// =========================

let selectedDay = "1";


// =========================
// HTML
// =========================

const myNameSelect =
    document.getElementById(
        "myNameSelect"
    );

const currentShift =
    document.getElementById(
        "currentShift"
    );

const nextShift =
    document.getElementById(
        "nextShift"
    );

const shiftTable =
    document.getElementById(
        "shiftTable"
    );

const shiftTitle =
    document.getElementById(
        "shiftTitle"
    );

const dayTabs =
    document.querySelectorAll(
        ".day-tab"
    );


// =========================
// スタッフ読み込み
// =========================

onValue(
    staffRef,
    snapshot => {

        const data =
            snapshot.val();

        staffData = [];

        if (data) {

            Object.entries(data).forEach(
                ([id, person]) => {

                    staffData.push({

                        id: id,

                        name:
                            person.name

                    });

                }
            );

        }

        loadStaff();

    }
);


// =========================
// シフト読み込み
// =========================

onValue(
    shiftDataRef,
    snapshot => {

        const data =
            snapshot.val();

        shiftData = [];

        if (data) {

            Object.entries(data).forEach(
                ([id, shift]) => {

                    shiftData.push({

                        id: id,

                        day:
                            String(
                                shift.day
                            ),

                        time:
                            shift.time,

                        sales:
                            Array.isArray(
                                shift.sales
                            )
                                ? shift.sales
                                : [],

                        workshop:
                            Array.isArray(
                                shift.workshop
                            )
                                ? shift.workshop
                                : [],

                        break:
                            Array.isArray(
                                shift.break
                            )
                                ? shift.break
                                : []

                    });

                }
            );

        }

        console.log(
            "Firebaseからシフトを読み込みました",
            shiftData
        );

        displayShiftTable();

        displayMyShift();

    }
);


// =========================
// スタッフ表示
// =========================

function loadStaff() {

    myNameSelect.innerHTML = `

        <option value="">
            名前を選択してください
        </option>

    `;

    staffData.forEach(
        person => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                person.name;

            option.textContent =
                person.name;

            myNameSelect.appendChild(
                option
            );

        }
    );

}


// =========================
// シフト表表示
// =========================

function displayShiftTable() {

    shiftTitle.textContent =
        `${selectedDay}日目のシフト`;

    shiftTable.innerHTML = "";


    const dayShifts =
        shiftData
            .filter(
                shift =>
                    String(shift.day) ===
                    String(selectedDay)
            )
            .sort(
                (a, b) =>
                    a.time.localeCompare(
                        b.time
                    )
            );


    if (
        dayShifts.length === 0
    ) {

        shiftTable.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    style="text-align:center;"
                >
                    まだシフトが登録されていません。
                </td>

            </tr>

        `;

        return;

    }


    dayShifts.forEach(
        shift => {

            const tr =
                document.createElement(
                    "tr"
                );


            const sales =
                Array.isArray(
                    shift.sales
                )
                    ? shift.sales.join("、")
                    : "";


            const workshop =
                Array.isArray(
                    shift.workshop
                )
                    ? shift.workshop.join("、")
                    : "";


            tr.innerHTML = `

                <td>
                    ${shift.time}
                </td>

                <td>
                    ${sales || "―"}
                </td>

                <td>
                    ${workshop || "―"}
                </td>

            `;


            shiftTable.appendChild(
                tr
            );

        }
    );

}


// =========================
// 自分のシフト表示
// =========================

function displayMyShift() {

    const name =
        myNameSelect.value;


    if (!name) {

        currentShift.textContent =
            "名前を選択してください。";

        nextShift.textContent =
            "名前を選択してください。";

        return;

    }


    const myShifts =
        shiftData
            .filter(
                shift =>
                    String(shift.day) ===
                    String(selectedDay)
            )
            .filter(
                shift => {

                    return (
                        shift.sales.includes(name) ||
                        shift.workshop.includes(name) ||
                        shift.break.includes(name)
                    );

                }
            )
            .sort(
                (a, b) =>
                    a.time.localeCompare(
                        b.time
                    )
            );


    if (
        myShifts.length === 0
    ) {

        currentShift.textContent =
            "この日のシフトはありません。";

        nextShift.textContent =
            "この日のシフトはありません。";

        return;

    }


    // 最初のシフト

    const first =
        myShifts[0];


    currentShift.innerHTML =
        createMyShiftHTML(first);


    // 次のシフト

    if (
        myShifts.length >= 2
    ) {

        const second =
            myShifts[1];

        nextShift.innerHTML =
            createMyShiftHTML(second);

    } else {

        nextShift.textContent =
            "次の担当はありません。";

    }

}


// =========================
// 自分のシフトHTML
// =========================

function createMyShiftHTML(
    shift
) {

    let job = "";


    if (
        shift.sales.includes(
            myNameSelect.value
        )
    ) {

        job = "🛍️ 物販";

    }

    else if (
        shift.workshop.includes(
            myNameSelect.value
        )
    ) {

        job = "🎨 ワークショップ";

    }

    else if (
        shift.break.includes(
            myNameSelect.value
        )
    ) {

        job = "☕ 休憩";

    }


    return `

        <strong>
            ${shift.time}
        </strong>

        <br>

        ${job}

    `;

}


// =========================
// 名前変更
// =========================

myNameSelect.addEventListener(
    "change",
    function() {

        displayMyShift();

    }
);


// =========================
// 日付変更
// =========================

dayTabs.forEach(
    tab => {

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


                displayShiftTable();

                displayMyShift();

            }
        );

    }
);


// =========================
// ボタン
// =========================

document
    .getElementById("manageButton")
    .addEventListener(
        "click",
        function() {

            location.href =
                "staff.html";

        }
    );


document
    .getElementById("editButton")
    .addEventListener(
        "click",
        function() {

            location.href =
                "shift.html";

        }
    );


document
    .getElementById("timeButton")
    .addEventListener(
        "click",
        function() {

            location.href =
                "time.html";

        }
    );


document
    .getElementById("myStaffButton")
    .addEventListener(
        "click",
        function() {

            location.href =
                "mystaff.html";

        }
    );