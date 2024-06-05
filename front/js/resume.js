/**
 * ページを開いた時に実行される関数
 */
$(document).ready(async function () {
  try {
    // 現在の日付を設定する
    setCurrentDate();

    // 印刷ボタン初期設定を行う
    setupPrintButton();

    // リセットボタン初期設定を行う
    setupResetPrButton();

    // 個人情報はローカルストレージに保存されているのでローカルストレージから取得する
    const localStorageItem = getFromLocalStorage("resumePersonalData");
    console.log("localStorageItem");
    console.log(localStorageItem);
    // ローカルストレージから情報が取得できない場合
    if (!localStorageItem) {
      alert("フォームを回答していない or 回答から3時間経っています");
      // ローディングの非表示
      $("#loadingSpinner").fadeOut();
      return;
    }

    // 基本情報はバックエンドに保存されているのでAPIから取得する
    const apiItem = await getFromApi(localStorageItem.id);
    console.log("apiItem");
    console.log(apiItem);

    // 個人情報の設定を行う
    setProfile(apiItem, localStorageItem);

    // 学歴・職歴の設定を行う
    setEducationAndWork(apiItem);

    // 免許・資格の設定を行う
    setLicense(apiItem);

    // 自己PRの設定を行う
    createPr(localStorageItem);
  } catch (e) {
    console.error(e);
  }

  // ローディングの非表示
  $("#loadingSpinner").fadeOut();
});

/**
 * 現在の日付を設定する関数
 */
function setCurrentDate() {
  // 現在の日付を年月日に分けてそれぞれ準備
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 月は0から始まるので1を加える
  const day = today.getDate();

  // HTMLのDOM要素に現在の日付を設定
  $("#nowYear").text(year);
  $("#nowMonth").text(month);
  $("#nowDay").text(day);
}

// バックエンドから基本データを取得する関数
async function getFromApi(id) {
  // ajaxを使って基本情報取得APIを叩いてスプシの情報を取得する
  const basicInfoGetURL = `https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec?id=${id}`;
  const response = await $.ajax({
    type: "GET",
    url: basicInfoGetURL,
    mode: "no-cors",
    "Content-Type": "application/x-www-form-urlencoded",
    success: function (response) {
      console.log("基本情報の取得に成功しました");
      console.log(response.data);
    },
    error: function (error) {
      console.log(error);
      alert("基本情報の取得に失敗しました");
    },
  });
  return response.data;
}

// LocalStorageから個人情報データを取得する関数
function getFromLocalStorage(key) {
  const itemStr = localStorage.getItem(key);
  // 直接アクセスされたりでローカルストレージがない場合にアクセスされたら起こり得る
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date().getTime();
  // 3時間の有効期限が切れていた場合
  if (now > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}

/**
 * 氏名、生年月日、住所等のプロフィール設定する関数
 */
function setProfile(apiItem, localStorageItem) {
  // 表示用に性別を変換する maleなら"男" femaleなら"女" それ以外なら"その他"
  const gender =
    apiItem.gender === "male"
      ? "男"
      : apiItem.gender === "female"
      ? "女"
      : "その他";
  // 画面に表示
  $("#gender").text(gender);
  $("#name").text(apiItem.name);

  // YYYY-MM-DD の形式から 年、月、日 に分けて変数を定義
  const [birthYear, birthMonth, birthDay] = apiItem.birthDay
    .split("-")
    .map(Number);

  // 生年月日から年を計算する
  const age = calculateAge(birthYear, birthMonth, birthDay);
  // 表示用に生年月日と年を整形する
  const birthDate = `${birthYear}年 ${birthMonth}月 ${birthDay}日生 (満${age}歳)`;
  $("#birthDate").text(birthDate);

  // ローカルストレージから取得した個人情報を画面に表示
  $("#addressKana").text(localStorageItem.addressKana);
  $("#postalCode").text(localStorageItem.postalCode);
  $("#address").text(localStorageItem.address);
  $("#mobilePhoneNumber").text(localStorageItem.phoneNumber);
  $("#email").text(localStorageItem.email);
}

/**
 * 年齢を計算する関数
 */
function calculateAge(birthYear, birthMonth, birthDay) {
  // 現在の日付を年月日に分けてそれぞれ準備
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // getMonth()は0から始まるので1を加える
  const currentDay = today.getDate();

  // 現在の年から生まれた年を引くことで何歳かが大体わかる 例) 2024年現在 - 2000年生まれ = 24歳
  let age = currentYear - birthYear;

  // 誕生月が現在の月より後、または誕生日が現在の日より後の場合、年齢を1減らす
  // 誕生日をむかえていたらそのまま、迎えていなかったら1歳減らす
  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay)
  ) {
    age--;
  }

  return age;
}

/**
 * 学歴・職歴を設定する関数
 */
function setEducationAndWork(apiItem) {
  // 高校の学歴情報はeducationプロパティの配列0個目にある
  const highSchool = apiItem.education[0];
  // 学歴職歴のどこの枠に表示するか添字で管理する
  let jQueryIndex = 1;

  // 高校入学について
  $(`#educationAndWorkYear${jQueryIndex}`).text(highSchool.year);
  $(`#educationAndWorkMonth${jQueryIndex}`).text(4); // 入学は4月だろう
  $(`#educationAndWork${jQueryIndex}`).text(highSchool.name + " 入学");
  jQueryIndex++;

  // 高校卒業について
  // 大体高校は3年だろうということで入学年に3年足している、高専などで違ったら手入力で訂正させればOK
  $(`#educationAndWorkYear${jQueryIndex}`).text(Number(highSchool.year) + 3);
  $(`#educationAndWorkMonth${jQueryIndex}`).text(3); // 卒業は3月だろう
  $(`#educationAndWork${jQueryIndex}`).text(highSchool.name + " 卒業");
  jQueryIndex++;

  // 大学について
  const university = apiItem.education[1];
  // フォームで大学情報が入力されていたら大学の学歴も追加する
  if (university) {
    // 大学入学について
    $(`#educationAndWorkYear${jQueryIndex}`).text(Number(university.year));
    $(`#educationAndWorkMonth${jQueryIndex}`).text(4); // 入学は4月だろう
    $(`#educationAndWork${jQueryIndex}`).text(university.name + " 入学");
    jQueryIndex++;

    // 大体大学は4年だろうということで入学年に4年足している、留年などで違ったら手入力で訂正させればOK
    $(`#educationAndWorkYear${jQueryIndex}`).text(Number(university.year) + 4);
    $(`#educationAndWorkMonth${jQueryIndex}`).text(3); // 卒業は3月だろう
    $(`#educationAndWork${jQueryIndex}`).text(university.name + " 卒業");
    jQueryIndex++;
  }

  const jobArray = apiItem.job;
  // 職歴は任意なので存在しないことがある
  if (jobArray) {
    for (let i = 0; i < jobArray.length; i++) {
      // 枠数の問題で職歴はMax7つまでしか反映できない
      if (i > 7) break;

      // 入社について
      $(`#educationAndWorkYear${jQueryIndex}`).text(jobArray[i].year);
      // 入社月は流石にバラバラなので手入力に頼る
      $(`#educationAndWork${jQueryIndex}`).text(jobArray[i].name + " 入社");
      jQueryIndex++;

      // 次の職歴がある場合は退職についても記載する
      const nextJob = jobArray[i + 1];
      if (nextJob) {
        // 退職年は次職の開始年と同じ年にしてみる (数年放浪してた、とかは手入力で修正してくれという気持ち)
        $(`#educationAndWorkYear${jQueryIndex}`).text(nextJob.year);
        // 退職月は流石にバラバラなので手入力に頼る
        $(`#educationAndWork${jQueryIndex}`).text(jobArray[i].name + " 退職");
        jQueryIndex++;
      }
    }
  }
  $(`#educationAndWork${jQueryIndex}`).text("現在に至る");
  $(`#educationAndWork${jQueryIndex}`).addClass("center"); // 「現在に至る」は中央よせにする
}

/**
 * 免許・資格を設定する関数
 */
function setLicense(apiItem) {
  // 免許・資格のどこの枠に表示するか添字で管理する
  let jQueryIndex = 1;
  const licenseArray = apiItem.license;
  // 免許・資格は任意なので存在しないことがある
  if (licenseArray) {
    for (let i = 0; i < licenseArray.length; i++) {
      // 枠数の問題で免許・資格はMax7つまでしか反映できない
      if (i > 7) break;
      $(`#licenseYear${jQueryIndex}`).text(licenseArray[i].year);
      // 資格取得月は流石にバラバラなので手入力に頼る
      $(`#license${jQueryIndex}`).text(licenseArray[i].name);
      jQueryIndex++;
    }
  }
}

/**
 * 自己PRを設定する関数
 * フォームで回答したアピールポイントを元にChatGPTが生成を行う
 */
async function createPr(localStorageItem) {
  // 連打抑止でボタンを無効化
  $("#resetSelfPr").prop("disabled", true);

  // タイムスタンプを表示しておく
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月は0から始まるため+1する
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const formattedNow = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  $(`#selfPr`).text(`ChatGPTにより自己PRを生成中です ${formattedNow}`);

  const jsonData = {
    type: "pr", // 固定
    id: localStorageItem.id,
    prName: Array.isArray(localStorageItem["prName[]"])
      ? localStorageItem["prName[]"]
      : [localStorageItem["prName[]"]],
  };
  console.log("pr jsonData");
  console.log(jsonData);
  // 自己PRの生成APIを叩く
  const createPrURL =
    "https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec";
  const response = await $.ajax({
    type: "POST",
    url: createPrURL,
    mode: "no-cors",
    "Content-Type": "application/x-www-form-urlencoded",
    data: JSON.stringify(jsonData),
    success: function (response) {
      console.log("自己PRが生成されました！");
      console.log(response);
    },
    error: function (error) {
      alert("自己PRの生成に失敗しました。");
      console.log(error);
    },
    complete: function () {
      // 成功・失敗に関わらず、AJAXリクエストが完了したときにボタンを有効化
      $("#resetSelfPr").prop("disabled", false);
    },
  });
  $(`#selfPr`).text(response.pr);
}

/**
 * 印刷ボタンを押下された時
 */
function setupPrintButton() {
  $("#print")
    .off("click")
    .on("click", function () {
      var printContents = $("main").html(); // mainタグ配下のHTMLを取得
      var originalContents = $("body").html(); // 元のHTMLを保持

      // 印刷用CSSを追加 デフォルトで設定される余計なマージンを取り除く
      var printStyle =
        "<style>@media print { @page { margin: 0; } body { margin: 0; } }</style>";
      $("head").append(printStyle);

      $("body").html(printContents); // bodyのHTMLをmainタグ配下のHTMLに置き換え
      window.print(); // 印刷ダイアログを表示
      $("body").html(originalContents); // 元のHTMLに戻す

      // 元のHTMLに戻した後、再度イベントリスナーを設定
      setupPrintButton();
      setupResetPrButton();
    });
}

/**
 * 自己PRのリセットボタンを押下された時
 */
function setupResetPrButton() {
  const localStorageItem = getFromLocalStorage("resumePersonalData");
  $("#resetSelfPr")
    .off("click")
    .on("click", async function () {
      // 一応 confirm で尋ねて ok の時のみ再生成を実行する
      const userConfirmed = confirm("自己PRを再生成しますか？");
      if (userConfirmed) {
        await createPr(localStorageItem);
      }
    });
}
