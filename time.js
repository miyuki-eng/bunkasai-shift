// =========================
// Firebase
// =========================

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

const app =
    initializeApp(firebaseConfig);

const database =
    getDatabase(app);

const timeSlotsRef =
    ref(database, "timeSlots");


// =========================
// HTML要素
// =========================

const startTime =
    document.getElementById("startTime");

const endTime =
    document.getElementById("endTime");

const addTimeButton =
    document.getElementById(
        "addTimeButton"
    );

const timeList =
    document.getElementById(
        "timeList"
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
// 現在選択している日
// =========================

let selectedDay = "1";


// =========================
// 時間帯データ
// =========================

let timeSlots = [];


// =========================
// 時間表示
// =========================

function formatTime(time) {

    return time;

}


// =========================
// Firebaseから時間帯を読み込む
// =========================

onValue(
    timeSlotsRef,
    snapshot => {

        const data =
            snapshot.val();

        timeSlots = [];

        if (data) {

            Object.entries(data).forEach(
                ([id, slot]) => {

                    timeSlots.push({

                        id: id,

                        day: String(
                            slot.day
                        ),

                        start:
                            slot.start,

                        end:
                            slot.end

                    });

                }
            );

        }


        console.log(
            "Firebaseから時間帯を読み込みました",
            timeSlots
        );


        displayTimeSlots();

    }
);


// =========================
// 時間帯表示
// =========================

function displayTimeSlots() {

    timeList.innerHTML = "";


    // 選択した日の時間だけ取得

    const daySlots =
        timeSlots
            .filter(
                slot =>
                    String(slot.day) ===
                    String(selectedDay)
            );


    // 時間順

    daySlots.sort(
        (a, b) =>
            a.start.localeCompare(
                b.start
            )
    );


    // 登録されていない場合

    if (daySlots.length === 0) {

        timeList.innerHTML = `
            <p class="empty-message">
                まだ時間帯が登録されていません。
            </p>
        `;

        return;

    }


    // 表示

    daySlots.forEach(slot => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "staff-item";


        item.innerHTML = `

            <div class="staff-info">

                <h3>
                    🕐
                    ${formatTime(slot.start)}
                    〜
                    ${formatTime(slot.end)}
                </h3>

            </div>


            <div class="staff-buttons">

                <button
                    class="delete-button"
                    data-id="${slot.id}"
                >

                    削除

                </button>

            </div>

        `;


        const deleteButton =
            item.querySelector(
                ".delete-button"
            );


        deleteButton.addEventListener(
            "click",
            function () {

                deleteTimeSlot(
                    slot.id
                );

            }
        );


        timeList.appendChild(item);

    });

}


// =========================
// 時間帯追加
// =========================

addTimeButton.addEventListener(
    "click",
    async function () {

        const start =
            startTime.value;

        const end =
            endTime.value;


        // 未入力

        if (
            start === "" ||
            end === ""
        ) {

            alert(
                "開始時間と終了時間を入力してください。"
            );

            return;

        }


        // 時間チェック

        if (start >= end) {

            alert(
                "終了時間は開始時間より後にしてください。"
            );

            return;

        }


        // 同じ時間帯があるか確認

        const alreadyExists =
            timeSlots.some(
                slot =>
                    String(slot.day) ===
                        String(selectedDay) &&
                    slot.start === start &&
                    slot.end === end
            );


        if (alreadyExists) {

            alert(
                "この時間帯はすでに登録されています。"
            );

            return;

        }


        try {

            // Firebaseに新しいIDを作る

            const newTimeRef =
                push(timeSlotsRef);


            // Firebaseへ保存

            await set(
                newTimeRef,
                {

                    day:
                        String(selectedDay),

                    start:
                        start,

                    end:
                        end

                }
            );


            // 入力欄をクリア

            startTime.value = "";
            endTime.value = "";


            alert(
                "時間帯を追加しました！"
            );


        } catch (error) {

            console.error(
                "時間帯の登録に失敗しました",
                error
            );


            alert(
                "時間帯の登録に失敗しました。"
            );

        }

    }
);


// =========================
// 時間帯削除
// =========================

async function deleteTimeSlot(id) {

    const slot =
        timeSlots.find(
            item =>
                item.id === id
        );


    if (!slot) {

        return;

    }


    const result =
        confirm(
            `${slot.start}〜${slot.end}を削除しますか？`
        );


    if (!result) {

        return;

    }


    try {

        const deleteRef =
            ref(
                database,
                `timeSlots/${id}`
            );


        await remove(
            deleteRef
        );


        alert(
            "時間帯を削除しました。"
        );


    } catch (error) {

        console.error(
            "時間帯の削除に失敗しました",
            error
        );


        alert(
            "時間帯の削除に失敗しました。"
        );

    }

}


// =========================
// 日付タブ
// =========================

dayTabs.forEach(tab => {

    tab.addEventListener(
        "click",
        function () {

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

            displayTimeSlots();

        }
    );

});


// =========================
// シフト表へ戻る
// =========================

backButton.addEventListener(
    "click",
    function () {

        location.href =
            "index.html";

    }
);