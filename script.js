// =========================
// シフトデータ
// =========================

let shiftData =
    JSON.parse(
        localStorage.getItem("shiftData")
    ) || [];

// =========================
// 最新のシフトデータを読み込む
// =========================

function reloadShiftData() {

    shiftData =
        JSON.parse(
            localStorage.getItem("shiftData")
        ) || [];

}


// =========================
// スタッフデータ
// =========================

let staffData =
    JSON.parse(
        localStorage.getItem("staff")
    ) || [];


// =========================
// 現在選択している日
// =========================

let selectedDay = "1";


// =========================
// HTML要素
// =========================

const shiftTitle =
    document.getElementById(
        "shiftTitle"
    );

const shiftTable =
    document.getElementById(
        "shiftTable"
    );

const manageButton =
    document.getElementById(
        "manageButton"
    );

const editButton =
    document.getElementById(
        "editButton"
    );

const timeButton =
    document.getElementById(
        "timeButton"
    );

const myStaffButton =
    document.getElementById(
        "myStaffButton"
    );

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

const dayTabs =
    document.querySelectorAll(
        ".day-tab"
    );


// =========================
// シフト表を表示
// =========================

function displayShifts(day) {

    // 最新データを読み込む
    reloadShiftData();

    shiftTitle.textContent =
        day + "日目のシフト";

    shiftTable.innerHTML = "";


    const dayShifts =
        shiftData.filter(
            shift =>
                String(shift.day) ===
                String(day)
        );


    // シフトがない場合

    if (
        dayShifts.length === 0
    ) {

        shiftTable.innerHTML = `
            <tr>
                <td colspan="3">
                    まだシフトが登録されていません
                </td>
            </tr>
        `;

        return;

    }


    // 時間順

    dayShifts.sort(
        (a, b) =>
            a.time.localeCompare(
                b.time
            )
    );


    // 表示

    dayShifts.forEach(
        shift => {

            const row =
                document.createElement(
                    "tr"
                );


            const sales =
                Array.isArray(
                    shift.sales
                )
                    ? shift.sales
                    : (
                        shift.sales
                            ? [shift.sales]
                            : []
                    );


            const workshop =
                Array.isArray(
                    shift.workshop
                )
                    ? shift.workshop
                    : (
                        shift.workshop
                            ? [shift.workshop]
                            : []
                    );


            row.innerHTML = `

                <td>
                    ${shift.time}
                </td>

                <td>
                    ${
                        sales.length > 0
                            ? sales.join("<br>")
                            : "―"
                    }
                </td>

                <td>
                    ${
                        workshop.length > 0
                            ? workshop.join("<br>")
                            : "―"
                    }
                </td>

            `;


            shiftTable.appendChild(
                row
            );

        }
    );

}


// =========================
// 日付タブ
// =========================

dayTabs.forEach(tab => {

    tab.addEventListener(
        "click",
        function() {

            // タブを切り替える

            dayTabs.forEach(
                otherTab => {

                    otherTab.classList.remove(
                        "active"
                    );

                }
            );


            this.classList.add(
                "active"
            );


            // 日付変更

            selectedDay =
                this.dataset.day;


            // シフト表更新

            displayShifts(
                selectedDay
            );


            // 現在・次の担当更新

            updateCurrentShift();

        }
    );

});


// =========================
// スタッフ管理
// =========================

manageButton.addEventListener(
    "click",
    function() {

        location.href =
            "staff.html";

    }
);


// =========================
// シフト編集
// =========================

editButton.addEventListener(
    "click",
    function() {

        location.href =
            "shift.html";

    }
);


// =========================
// 時間帯管理
// =========================

timeButton.addEventListener(
    "click",
    function() {

        location.href =
            "time.html";

    }
);


// =========================
// スタッフ別シフト
// =========================

myStaffButton.addEventListener(
    "click",
    function() {

        location.href =
            "mystaff.html";

    }
);


// =========================
// スタッフ名を読み込む
// =========================

function loadMyName() {

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
// 時間を数字に変換
// =========================

function convertTime(time) {

    time =
        time.trim();


    const parts =
        time.split(":");


    if (
        parts.length !== 2
    ) {

        return null;

    }


    const hour =
        Number(parts[0]);


    const minute =
        Number(parts[1]);


    if (
        Number.isNaN(hour) ||
        Number.isNaN(minute)
    ) {

        return null;

    }


    return (
        hour * 60 +
        minute
    );

}


// =========================
// シフト時間を取得
// =========================

function getShiftTimes(
    timeText
) {

    if (!timeText) {

        return null;

    }


    const times =
        timeText.split("〜");


    if (
        times.length !== 2
    ) {

        return null;

    }


    const start =
        convertTime(
            times[0]
        );


    const end =
        convertTime(
            times[1]
        );


    if (
        start === null ||
        end === null
    ) {

        return null;

    }


    return {

        start: start,

        end: end

    };

}


// =========================
// スタッフの担当を取得
// =========================

function getStaffJob(
    shift,
    name
) {

    const sales =
        Array.isArray(
            shift.sales
        )
            ? shift.sales
            : (
                shift.sales
                    ? [shift.sales]
                    : []
            );


    const workshop =
        Array.isArray(
            shift.workshop
        )
            ? shift.workshop
            : (
                shift.workshop
                    ? [shift.workshop]
                    : []
            );


    let job = [];


    if (
        sales.includes(name)
    ) {

        job.push(
            "🛍️ 物販"
        );

    }


    if (
        workshop.includes(name)
    ) {

        job.push(
            "🎨 ワークショップ"
        );

    }


    return job.join(
        " / "
    );

}


// =========================
// シフト表示HTML
// =========================

function createShiftHTML(
    shift,
    name
) {

    const job =
        getStaffJob(
            shift,
            name
        );


    return `

        <div class="current-time">
            🕐 ${shift.time}
        </div>

        <div class="current-job">
            ${job}
        </div>

    `;

}


// =========================
// 現在・次の担当を更新
// =========================

function updateCurrentShift() {

    // 最新データを読み込む
    reloadShiftData();

    const name =
        myNameSelect.value;


    // 名前が未選択

    if (!name) {

        currentShift.innerHTML =
            "名前を選択してください。";

        nextShift.innerHTML =
            "名前を選択してください。";

        return;

    }


    // 現在時刻

    const now =
        new Date();


    const currentTime =
        now.getHours() * 60 +
        now.getMinutes();


    // 自分のシフトだけ取得

    const myShifts =
        shiftData
            .filter(
                shift =>
                    String(
                        shift.day
                    ) ===
                    String(
                        selectedDay
                    )
            )
            .filter(
                shift =>
                    getStaffJob(
                        shift,
                        name
                    ) !== ""
            );


    // シフトがない

    if (
        myShifts.length === 0
    ) {

        currentShift.innerHTML =
            "今日のシフトはありません。";

        nextShift.innerHTML =
            "今日のシフトはありません。";

        return;

    }


    // 時間順

    myShifts.sort(
        (a, b) => {

            const timeA =
                getShiftTimes(
                    a.time
                );

            const timeB =
                getShiftTimes(
                    b.time
                );


            if (
                !timeA ||
                !timeB
            ) {

                return 0;

            }


            return (
                timeA.start -
                timeB.start
            );

        }
    );


    let current =
        null;

    let next =
        null;


    // 現在・次を探す

    for (
        const shift
        of myShifts
    ) {

        const times =
            getShiftTimes(
                shift.time
            );


        if (!times) {

            continue;

        }


        // 現在の担当

        if (
            currentTime >=
                times.start &&
            currentTime <
                times.end
        ) {

            current =
                shift;

        }


        // 次の担当

        if (
            times.start >
                currentTime &&
            next === null
        ) {

            next =
                shift;

        }

    }


    // =========================
    // 現在の担当
    // =========================

    if (current) {

        currentShift.innerHTML =
            createShiftHTML(
                current,
                name
            );

    } else {

        currentShift.innerHTML = `

            <div class="no-current-shift">
                現在は担当時間ではありません。
            </div>

        `;

    }


    // =========================
    // 次の担当
    // =========================

    if (next) {

        nextShift.innerHTML =
            createShiftHTML(
                next,
                name
            );

    } else {

        nextShift.innerHTML = `

            <div class="no-current-shift">
                この後の担当はありません。
            </div>

        `;

    }

}


// =========================
// 名前変更
// =========================

myNameSelect.addEventListener(
    "change",
    function() {

        localStorage.setItem(
            "myStaffName",
            this.value
        );


        updateCurrentShift();

    }
);


// =========================
// 1分ごとに更新
// =========================

setInterval(
    updateCurrentShift,
    60000
);


// =========================
// 初期処理
// =========================

loadMyName();


const savedName =
    localStorage.getItem(
        "myStaffName"
    );


if (savedName) {

    myNameSelect.value =
        savedName;

}


// 1日目を表示

displayShifts("1");


// 現在・次の担当を表示

updateCurrentShift();

// =========================
// ページに戻ってきたとき更新
// =========================

window.addEventListener(
    "pageshow",
    function () {

        reloadShiftData();

        displayShifts(
            selectedDay
        );

        updateCurrentShift();

    }
);

// =========================
// localStorage変更を検知
// =========================

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            "shiftData"
        ) {

            reloadShiftData();

            displayShifts(
                selectedDay
            );

            updateCurrentShift();

        }

    }
);