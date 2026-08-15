// =========================
// 時間帯データ
// =========================

let timeSlots =
    JSON.parse(
        localStorage.getItem("timeSlots")
    ) || [];


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
// 時間表示
// =========================

function formatTime(time) {

    return time;

}


// =========================
// 時間帯表示
// =========================

function displayTimeSlots() {

    timeList.innerHTML = "";


    // 選択した日の時間だけ取得

    const daySlots =
        timeSlots
            .map((slot, index) => ({
                ...slot,
                originalIndex: index
            }))
            .filter(
                slot =>
                    slot.day === selectedDay
            );


    // 時間順に並べる

    daySlots.sort(
        (a, b) =>
            a.start.localeCompare(b.start)
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
            document.createElement("div");

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
                    onclick="
                        deleteTimeSlot(
                            ${slot.originalIndex}
                        )
                    "
                >

                    削除

                </button>

            </div>

        `;


        timeList.appendChild(item);

    });

}


// =========================
// 時間帯追加
// =========================

addTimeButton.addEventListener(
    "click",
    function () {

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


        // 終了時間が開始時間より前

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
                    slot.day === selectedDay &&
                    slot.start === start &&
                    slot.end === end
            );


        if (alreadyExists) {

            alert(
                "この時間帯はすでに登録されています。"
            );

            return;
        }


        // 時間帯追加

        timeSlots.push({

            day: selectedDay,

            start: start,

            end: end

        });


        // 保存

        localStorage.setItem(
            "timeSlots",
            JSON.stringify(
                timeSlots
            )
        );


        // 入力欄をクリア

        startTime.value = "";

        endTime.value = "";


        // 表示更新

        displayTimeSlots();


        alert(
            "時間帯を追加しました！"
        );

    }
);


// =========================
// 時間帯削除
// =========================

function deleteTimeSlot(index) {

    const slot =
        timeSlots[index];


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


    timeSlots.splice(
        index,
        1
    );


    localStorage.setItem(
        "timeSlots",
        JSON.stringify(
            timeSlots
        )
    );


    displayTimeSlots();

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


// =========================
// 初期表示
// =========================

displayTimeSlots();