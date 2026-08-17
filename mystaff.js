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

    apiKey:
        "AIzaSyD_gYOoHpgbxHH4u7pEJIDK0yX7IRBlD-A",

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
// HTML要素
// =========================

const staffSelect =
    document.getElementById(
        "staffSelect"
    );

const myShiftList =
    document.getElementById(
        "myShiftList"
    );

const shiftTitle =
    document.getElementById(
        "shiftTitle"
    );

const backButton =
    document.getElementById(
        "backButton"
    );

const dayTabs =
    document.querySelectorAll(
        ".day-tab"
    );


// =========================
// スタッフをFirebaseから読み込む
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

        console.log(
            "スタッフを読み込みました",
            staffData
        );

        loadStaff();

    }
);


// =========================
// シフトをFirebaseから読み込む
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
            "シフトを読み込みました",
            shiftData
        );

        displayMyShift();

    }
);


// =========================
// スタッフ一覧を表示
// =========================

function loadStaff() {

    staffSelect.innerHTML = `

        <option value="">
            スタッフを選択してください
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

            staffSelect.appendChild(
                option
            );

        }
    );

}


// =========================
// スタッフ選択
// =========================

staffSelect.addEventListener(
    "change",
    function() {

        displayMyShift();

    }
);


// =========================
// スタッフ別シフト表示
// =========================

function displayMyShift() {

    const staffName =
        staffSelect.value;


    shiftTitle.textContent =
        `${selectedDay}日目のシフト`;


    // 名前が選択されていない

    if (!staffName) {

        myShiftList.innerHTML = `

            <p class="empty-message">
                スタッフを選択してください。
            </p>

        `;

        return;

    }


    // =========================
    // 選択した日のシフト
    // =========================

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

                        shift.sales.includes(
                            staffName
                        )

                        ||

                        shift.workshop.includes(
                            staffName
                        )

                        ||

                        shift.break.includes(
                            staffName
                        )

                    );

                }
            )
            .sort(
                (a, b) =>
                    a.time.localeCompare(
                        b.time
                    )
            );


    // =========================
    // シフトがない
    // =========================

    if (
        myShifts.length === 0
    ) {

        myShiftList.innerHTML = `

            <p class="empty-message">

                ${staffName}さんの
                ${selectedDay}日目のシフトは
                ありません。

            </p>

        `;

        return;

    }


    // =========================
    // 表示
    // =========================

    myShiftList.innerHTML = "";


    myShifts.forEach(
        shift => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "shift-edit-item";


            // =========================
            // 担当を判定
            // =========================

            let job = "";


            if (
                shift.sales.includes(
                    staffName
                )
            ) {

                job =
                    "🛍️ 物販";

            }

            else if (
                shift.workshop.includes(
                    staffName
                )
            ) {

                job =
                    "🎨 ワークショップ";

            }

            else if (
                shift.break.includes(
                    staffName
                )
            ) {

                job =
                    "☕ 休憩";

            }


            item.innerHTML = `

                <div class="shift-edit-time">

                    🕐 ${shift.time}

                </div>


                <div class="shift-job-title">

                    ${job}

                </div>

            `;


            myShiftList.appendChild(
                item
            );

        }
    );

}


// =========================
// 日付タブ
// =========================

dayTabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            function() {

                // 全タブOFF

                dayTabs.forEach(
                    otherTab => {

                        otherTab.classList.remove(
                            "active"
                        );

                    }
                );


                // 選択したタブON

                this.classList.add(
                    "active"
                );


                // 日付変更

                selectedDay =
                    this.dataset.day;


                // 表示更新

                displayMyShift();

            }
        );

    }
);


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


// =========================
// 初期表示
// =========================

displayMyShift();