/**
 * ページを開いた時に実行される関数
 */
$(document).ready(async function () {
  const apiItem = await getFromApi();

  // データに基づいてカードを生成
  const container = $("#contentContainer");
  apiItem.forEach((item) => {
    console.log("item");
    console.log(item);
    // ないとは思うが安全にデータアクセス
    if (!item.data) return;

    const name = item.data.name;
    const gender =
      item.data.gender === "male"
        ? "男"
        : item.data.gender === "female"
        ? "女"
        : "その他";

    const apiBirthDay = item.data.birthday ?? item.data.birthDay;
    const [birthYear, birthMonth, birthDay] = apiBirthDay
      .split("-")
      .map(Number);

    // 生年月日から年を計算する
    const age = calculateAge(birthYear, birthMonth, birthDay);
    // 表示用に生年月日と年を整形する
    const birthDate = `${birthYear}年 ${birthMonth}月 ${birthDay}日生 (満${age}歳)`;
    const pr = item.data.pr;
    const resume = `
    <main>
    <page
      size="A3"
      layout="portrait"
      style="padding: 60px; box-sizing: border-box"
    >
      <table
        border-collapse="collapse"
        cellspacing="0"
        cellpadding="0"
        style="table-layout: fixed; width: 0"
      >
        <thead>
          <tr style="height: 0px">
            <th style="width: 70px"></th>
            <th style="width: 45px"></th>
            <th style="width: 155px"></th>
            <th style="width: 70px"></th>
            <th style="width: 70px"></th>
            <th style="width: 130px"></th>
            <th style="width: 60px"></th>
            <th style="width: 70px"></th>
            <th style="width: 45px"></th>
            <th style="width: 425px"></th>
          </tr>
        </thead>
        <tbody>
          <tr style="height: 33.5px">
            <td
              style="
                font-size: 2rem;
                line-height: 2rem;
                text-align: center;
                font-family: serif;
              "
              colspan="2"
            >
              履 歴 書
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr style="height: 33.5px">
            <td class="bd-t-s bd-l-s">フリガナ</td>
            <!-- JavaScriptによってフリガナ氏名が設定される -->
            <td
              class="bd-t-s bd-l-s"
              colspan="3"
              
              id="nameKana"
            ></td>
            <!-- JavaScriptによって性別が設定される -->
            <td
              class="bd-t-s bd-l-dt center"
              rowspan="3"
              id="gender"
            >${gender}</td>
            <td class="bd-t-s bd-r-s bd-l-s center" rowspan="4">
              （写真を貼る位置）
            </td>
            <td></td>
            <td class="bd-t-s bd-l-s center">年</td>
            <td class="bd-t-s bd-l-dt center">月</td>
            <td class="bd-t-s bd-r-s bd-l-dt center">学歴・職歴</td>
          </tr>
          <tr style="height: 33.5px">
            <td class="bd-t-dt bd-l-s" rowspan="2">氏 名</td>
            <!-- JavaScriptによって氏名が設定される -->
            <td
              class="bd-t-dt bd-l-s"
              colspan="3"
              rowspan="2"
              
              id="name"
            >${name}</td>
            <td></td>
            <!-- JavaScriptによって学歴職歴の12個目が設定される -->
            <td
              class="bd-t-db bd-l-s center"
              
              id="educationAndWorkYear12"
            ></td>
            <td
              class="bd-t-db bd-l-dt center"
              
              id="educationAndWorkMonth12"
            ></td>
            <td
              class="bd-t-db bd-r-s bd-l-dt center"
              
              id="educationAndWork12"
            ></td>
          </tr>
          <tr style="height: 33.5px">
            <td></td>
            <!-- JavaScriptによって学歴職歴の13個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear13"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth13"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt center"
              
              id="educationAndWork13"
            ></td>
          </tr>
          <tr style="height: 33.5px">
            <td class="bd-t-s bd-l-s">生年月日</td>
            <!-- JavaScriptによって生年月日と年齢が設定される -->
            <td
              class="bd-t-s bd-l-s"
              colspan="4"
              
              id="birthDate"
            >${birthDate}</td>
            <td></td>
            <!-- JavaScriptによって学歴職歴の14個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear14"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth14"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt center"
              
              id="educationAndWork14"
            ></td>
          </tr>
          <tr style="height: 33.5px">
            <td class="bd-t-s bd-l-s">フリガナ</td>
            <!-- JavaScriptによって住所のカナが設定される -->
            <td
              class="bd-t-s bd-r-s bd-l-s"
              colspan="5"
              
              id="addressKana"
            ></td>
            <td></td>
            <!-- JavaScriptによって学歴職歴の15個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear15"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth15"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt center"
              
              id="educationAndWork15"
            ></td>
          </tr>
          <tr style="height: 33.5px">
            <td class="bd-t-dt bd-l-s">住 所</td>
            <td class="bd-t-dt bd-r-s" colspan="5" >
              <!-- JavaScriptによって郵便番号が設定される -->
              ( 〒 <span id="postalCode"></span> )
            </td>
            <td></td>
            <!-- JavaScriptによって学歴職歴の16個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear16"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth16"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt center"
              
              id="educationAndWork16"
            ></td>
          </tr>
          <tr style="height: 33.5px">
            <!-- JavaScriptによって住所が設定される -->
            <td
              class="bd-r-s bd-l-s"
              colspan="6"
              rowspan="2"
              
              id="address"
            >masked</td>
            <td></td>
            <!-- JavaScriptによって学歴職歴の17個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear17"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth17"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt center"
              
              id="educationAndWork17"
            ></td>
          </tr>
          <tr style="height: 33.5px">
            <td></td>
            <!-- JavaScriptによって学歴職歴の18個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear18"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth18"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt center"
              
              id="educationAndWork18"
            ></td>
          </tr>
          <tr style="height: 33.5px">
            <td class="bd-t-s bd-l-s">電話</td>
            <!-- JavaScriptによって電話番号が設定される -->
            <td
              class="bd-t-s"
              colspan="2"
              
              id="phoneNumber"
            ></td>
            <td class="bd-t-s bd-l-s">携帯電話</td>
            <!-- JavaScriptによって携帯番号が設定される -->
            <td
              class="bd-t-s bd-r-s"
              colspan="2"
              id="mobilePhoneNumber"
            >masked</td>
            <td></td>
            <!-- JavaScriptによって学歴職歴の19個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear19"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth19"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt center"
              
              id="educationAndWork19"
            ></td>
          </tr>
          <tr style="height: 33.5px">
            <td class="bd-t-s bd-l-s">E-mail</td>
            <!-- JavaScriptによってメールアドレスが設定される -->
            <td
              class="bd-t-s bd-r-s"
              colspan="5"
              id="email"
            >masked</td>
            <td></td>
            <td class="bd-t-s bd-l-s center">年</td>
            <td class="bd-t-s bd-l-dt center">月</td>
            <td class="bd-t-s bd-r-s bd-l-dt center">免許・資格</td>
          </tr>
          <tr style="height: 33.5px">
            <td class="bd-t-s bd-l-s center">年</td>
            <td class="bd-t-s bd-l-dt center">月</td>
            <td class="bd-t-s bd-r-s bd-l-dt center" colspan="4">
              学歴・職歴
            </td>
            <td></td>
            <!-- JavaScriptによって免許・資格の1個目が設定される -->
            <td
              class="bd-t-db bd-l-s center"
              
              id="licenseYear1"
            ></td>
            <td
              class="bd-t-db bd-l-dt center"
              
              id="licenseMonth1"
            ></td>
            <td
              class="bd-t-db bd-r-s bd-l-dt"
              
              id="license1"
            ></td>
          </tr>
          <tr style="height: 33.5px">
            <!-- JavaScriptによって学歴職歴の1個目が設定される -->
            <td
              class="bd-t-db bd-l-s center"
              
              id="educationAndWorkYear1"
            ></td>
            <td
              class="bd-t-db bd-l-dt center"
              
              id="educationAndWorkMonth1"
            ></td>
            <td
              class="bd-t-db bd-r-s bd-l-dt"
              colspan="4"
              
              id="educationAndWork1"
            ></td>
            <td></td>
            <!-- JavaScriptによって免許・資格の2個目が設定される -->
            <td class="bd-t-dt bd-l-s center" id="licenseYear2"></td>
            <td class="bd-t-dt bd-l-dt center" id="licenseMonth2"></td>
            <td class="bd-t-dt bd-r-s bd-l-dt" id="license2"></td>
          </tr>
          <tr style="height: 33.5px">
            <!-- JavaScriptによって学歴職歴の２個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear2"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth2"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt"
              colspan="4"
              
              id="educationAndWork2"
            ></td>
            <td></td>
            <!-- JavaScriptによって免許・資格の3個目が設定される -->
            <td class="bd-t-dt bd-l-s center" id="licenseYear3"></td>
            <td class="bd-t-dt bd-l-dt center" id="licenseMonth3"></td>
            <td class="bd-t-dt bd-r-s bd-l-dt" id="license3"></td>
          </tr>
          <tr style="height: 33.5px">
            <!-- JavaScriptによって学歴職歴の3個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear3"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth3"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt"
              colspan="4"
              
              id="educationAndWork3"
            ></td>
            <td></td>
            <!-- JavaScriptによって免許・資格の4個目が設定される -->
            <td class="bd-t-dt bd-l-s center" id="licenseYear4"></td>
            <td class="bd-t-dt bd-l-dt center" id="licenseMonth4"></td>
            <td class="bd-t-dt bd-r-s bd-l-dt" id="license4"></td>
          </tr>
          <tr style="height: 33.5px">
            <!-- JavaScriptによって学歴職歴の4個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear4"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth4"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt"
              colspan="4"
              
              id="educationAndWork4"
            ></td>
            <td></td>
            <!-- JavaScriptによって免許・資格の5個目が設定される -->
            <td class="bd-t-dt bd-l-s center" id="licenseYear5"></td>
            <td class="bd-t-dt bd-l-dt center" id="licenseMonth5"></td>
            <td class="bd-t-dt bd-r-s bd-l-dt" id="license5"></td>
          </tr>
          <tr style="height: 33.5px">
            <!-- JavaScriptによって学歴職歴の5個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear5"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth5"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt"
              colspan="4"
              
              id="educationAndWork5"
            ></td>
            <td></td>
            <!-- JavaScriptによって免許・資格の6個目が設定される -->
            <td class="bd-t-dt bd-l-s center" id="licenseYear6"></td>
            <td class="bd-t-dt bd-l-dt center" id="licenseMonth6"></td>
            <td class="bd-t-dt bd-r-s bd-l-dt" id="license6"></td>
          </tr>
          <tr style="height: 33.5px">
            <!-- JavaScriptによって学歴職歴の6個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear6"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth6"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt"
              colspan="4"
              
              id="educationAndWork6"
            ></td>
            <td></td>
            <!-- JavaScriptによって免許・資格の7個目が設定される -->
            <td class="bd-t-dt bd-l-s center" id="licenseYear7"></td>
            <td class="bd-t-dt bd-l-dt center" id="licenseMonth7"></td>
            <td class="bd-t-dt bd-r-s bd-l-dt" id="license7"></td>
          </tr>
          <tr style="height: 33.5px">
            <!-- JavaScriptによって学歴職歴の7個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear7"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth7"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt"
              colspan="4"
              
              id="educationAndWork7"
            ></td>
            <td></td>
            <td class="bd-t-s bd-r-s bd-l-s" colspan="3">自己PR</td>
          </tr>
          <tr style="height: 33.5px">
            <!-- JavaScriptによって学歴職歴の8個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear8"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth8"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt"
              colspan="4"
              
              id="educationAndWork8"
            ></td>
            <td></td>
            <!-- JavaScriptによって自己PRが設定される -->
            <td
              id="selfPr"
              class="bd-t-s bd-r-s bd-b-s bd-l-s"
              colspan="3"
              rowspan="4"
              
            >
              ${pr}
            </td>
          </tr>
          <tr style="height: 33.5px">
            <!-- JavaScriptによって学歴職歴の9個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear9"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth9"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt"
              colspan="4"
              
              id="educationAndWork9"
            ></td>
          </tr>
          <tr style="height: 33.5px">
            <!-- JavaScriptによって学歴職歴の10個目が設定される -->
            <td
              class="bd-t-dt bd-l-s center"
              
              id="educationAndWorkYear10"
            ></td>
            <td
              class="bd-t-dt bd-l-dt center"
              
              id="educationAndWorkMonth10"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-l-dt"
              colspan="4"
              
              id="educationAndWork10"
            ></td>
            <td></td>
          </tr>
          <tr style="height: 33.5px">
            <!-- JavaScriptによって学歴職歴の11個目が設定される -->
            <td
              class="bd-t-dt bd-b-s bd-l-s center"
              
              id="educationAndWorkYear11"
            ></td>
            <td
              class="bd-t-dt bd-b-s bd-l-dt center"
              
              id="educationAndWorkMonth11"
            ></td>
            <td
              class="bd-t-dt bd-r-s bd-b-s bd-l-dt"
              colspan="4"
              
              id="educationAndWork11"
            ></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </page>
  </main>
    `;
    container.append(resume);
  });

  $("#loadingSpinner").fadeOut();
});

// バックエンドから基本データの全てを取得する関数
async function getFromApi() {
  const basicInfoGetURL = `https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec`;
  const response = await $.ajax({
    type: "GET",
    url: basicInfoGetURL,
    mode: "no-cors",
    "Content-Type": "application/x-www-form-urlencoded",
    success: function (response) {
      console.log("基本情報の取得に成功しました");
      console.log(response);
    },
    error: function (error) {
      console.log(error);
      alert("基本情報の取得に失敗しました");
    },
  });
  return response.datas;
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
