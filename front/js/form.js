/**
 * ページを開いた時に実行される関数
 */
$(document).ready(function () {
  // ローディング非表示 (HTML CSS でデフォルトで表示されているため)
  $("#loadingSpinner").hide();

  // 年の選択肢を追加
  populateYearOptions("#birthYear"); // 生年月日年

  // 生年月日 月の選択肢を生成
  for (let month = 1; month <= 12; month++) {
    $("#birthMonth").append(`<option value="${month}">${month}</option>`);
  }

  // 生年月日 日の選択肢を生成
  for (let day = 1; day <= 31; day++) {
    $("#birthDate").append(`<option value="${day}">${day}</option>`);
  }

  // 生年月日が入力された時のイベントリスナーを追加
  $("#birthYear, #birthMonth, #birthDate").change(function () {
    // 生年月日から高校入学と大学入学年を推定して設定
    setEducationYears();
  });

  // 郵便番号入力フィールドのフォーカスが外れたときに、入力されていた値を元に住所を取得する
  $("#postalCode").on("blur", function () {
    console.log("郵便番号から住所を検索");
    // 入力された郵便番号からハイフン"-"を取り除いて 7桁 の数値にする
    const postalCode = $(this).val().replace("-", "");
    if (postalCode.length === 7) {
      $.ajax({
        // 日本郵便の公開APIを叩く
        url: `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`,
        dataType: "jsonp",
        success: function (data) {
          // API実行成功
          console.log(data);
          // レスポンスの中身も正しければ住所欄に郵便番号から取得できた住所を設定する
          if (data.status === 200 && data.results) {
            const result = data.results[0];
            const address = `${result.address1}${result.address2}${result.address3}`;
            const addressKana = `${result.kana1}${result.kana2}${result.kana3}`;
            console.log("API 住所:", address);
            $("#address").val(address);
            $("#addressKana").val(addressKana);
          } else {
            alert("住所が見つかりませんでした。");
          }
        },
        error: function (error) {
          console.error(error);
          // API実行失敗 ネットワークエラーとかで起こるかも
          alert("住所検索に失敗しました。");
        },
      });
    } else {
      // 入力された郵便番号が7桁じゃなかったりした場合
      alert("郵便番号を正しく入力してください。");
    }
  });

  // 高校入学年セレクトボックスの設定
  populateYearOptions("#highSchoolYear");
  // 大学入学年セレクトボックスの設定
  populateYearOptions("#universityYear");

  // 職歴年セレクトボックスの設定
  populateYearOptions('select[name="jobYear[]"]');

  // 職歴追加ボタンのクリックイベント
  $("#addJobHistory").on("click", function () {
    const jobHistoryTemplate = `
      <div class="Form-Item-Select job-history mt-3">
        <select name="jobYear[]" class="Form-Item-Select-Input" style="width: 120px">
        </select>
        <input type="text" name="jobName[]" class="Form-Item-Input" placeholder="例）◯◯会社" style="flex: 1; margin-left: 10px" />
        <span class="mt-auto">入社</span>
      </div>
    `;
    $("#jobHistories").append(jobHistoryTemplate);
    // 新しく追加されたセレクトボックスに年の選択肢を追加
    populateYearOptions(
      '#jobHistories .job-history:last select[name="jobYear[]"]'
    );
  });

  // 免許、資格年セレクトボックスの設定
  populateYearOptions('select[name="licenseYear[]"]');

  // 免許・資格追加ボタンのクリックイベント
  $("#addLicense").on("click", function () {
    const licenseTemplate = `
      <div class="Form-Item-Select license-entry mt-3">
        <select name="licenseYear[]" class="Form-Item-Select-Input" style="width: 120px">
        </select>
        <input type="text" name="licenseName[]" class="Form-Item-Input" placeholder="例）普通自動車免許" style="flex: 1; margin-left: 10px" />
        <span class="mt-auto">取得</span>
      </div>
    `;
    $("#licenses").append(licenseTemplate);
    // 新しく追加されたセレクトボックスに年の選択肢を追加
    const newSelect = $(
      '#licenses .license-entry:last select[name="licenseYear[]"]'
    );
    populateYearOptions(newSelect);
  });

  // PR追加ボタンのクリックイベント
  $("#addPR").on("click", function () {
    const prTemplate = `
      <div class="Form-Item-Select pr-entry mt-3" style="max-width: 720px; margin-left: 0px">
        <input
          type="text"
          name="prName[]"
          class="Form-Item-Input"
          placeholder="例）勉強頑張った"
          required
          style="flex: 1; margin-left: 0px; max-width: 720px"
        />
        <span class="mt-auto"></span>
      </div>
    `;
    $("#pr").append(prTemplate);
  });

  /**
   * フォームの登録ボタンが押された時に呼ばれる関数
   * バックエンドの基本情報登録APIを叩いて情報をスプシに保存する
   * 個人情報は"今回は"バックエンドに保存せずにローカルストレージというブラウザについている格納庫みたいな所に保存する
   * こうすることで、基本的な情報はバックエンドで管理され、他API(みんな)から見ることが可能
   * 個人情報は自分のブラウザに閉じるので公開されない
   */
  $("#resumeForm").on("submit", function (event) {
    event.preventDefault();

    // 必須入力項目のバリデーションチェック
    let isValid = true;
    let missingFields = [];
    const requiredFields = $("#resumeForm").find("[required]");
    requiredFields.each(function () {
      // 入力されているかをチェック
      if (!$(this).val()) {
        isValid = false;
        // どの項目が未入力なのかを探す
        const label = $(this)
          .closest(".Form-Item")
          .find(".Form-Item-Label")
          .text()
          .trim();
        missingFields.push(label.replace("必須", "").trim());
      }
    });
    // 一つでも未入力があった場合
    if (!isValid) {
      alert("以下の必須項目が未入力です:\n" + missingFields.join("\n"));
      return;
    }

    // ローディングの表示
    $("#loadingSpinner").fadeIn();

    // 前回のローカルストレージを削除
    removeFromLocalStorage();

    // 入力されたフォームデータを収集
    const formData = new FormData(this);

    // 後々APIに送るデータ
    const jsonData = {
      type: "basic", // 固定
    };
    // 後々ローカルストレージに保存するデータ
    const localStorageData = {};

    // 入力されたデータをfor文で確認していく
    formData.forEach((value, key) => {
      if (
        [
          "postalCode",
          "address",
          "addressKana",
          "phoneNumber",
          "email",
          "prName[]",
        ].includes(key)
      ) {
        // 個人情報の場合はローカルストレージオブジェクトに
        if (localStorageData[key]) {
          if (!Array.isArray(localStorageData[key])) {
            localStorageData[key] = [localStorageData[key]];
          }
          localStorageData[key].push(value);
        } else {
          localStorageData[key] = value;
        }
      } else {
        // 個人情報じゃない場合はAPI用のjsonオブジェクトに
        if (jsonData[key]) {
          if (!Array.isArray(jsonData[key])) {
            jsonData[key] = [jsonData[key]];
          }
          jsonData[key].push(value);
        } else {
          jsonData[key] = value;
        }
      }
    });

    // birthYear, birthMonth, birthDate を birthDay に統合
    // バックエンドには YYYY-MM-DD の形式で渡してあげる
    const birthYear = jsonData["birthYear"];
    const birthMonth = jsonData["birthMonth"];
    const birthDate = jsonData["birthDate"];
    const birthDay = `${birthYear}-${birthMonth}-${birthDate}`;
    jsonData["birthDay"] = birthDay;
    delete jsonData["birthYear"];
    delete jsonData["birthMonth"];
    delete jsonData["birthDate"];

    // highSchool と university をオブジェクトの配列に変換
    // 下記のような形になる
    // "education": [
    //   {
    //       "year": "2011",
    //       "name": "札幌開成",
    //       "type": "highSchool"
    //   },
    //   {
    //       "year": "2014",
    //       "name": "札幌教育大学",
    //       "type": "university"
    //   }
    // ]
    const education = [];
    if (jsonData["highSchoolYear"] && jsonData["highSchoolName"]) {
      education.push({
        year: jsonData["highSchoolYear"],
        name: jsonData["highSchoolName"],
        type: "highSchool",
      });
      delete jsonData["highSchoolYear"];
      delete jsonData["highSchoolName"];
    }
    if (jsonData["universityYear"] && jsonData["universityName"]) {
      education.push({
        year: jsonData["universityYear"],
        name: jsonData["universityName"],
        type: "university",
      });
      delete jsonData["universityYear"];
      delete jsonData["universityName"];
    }
    if (education.length > 0) jsonData["education"] = education;

    // job の配列を構築
    // 下記のような形になる
    // "job": [
    //   {
    //       "year": "2018",
    //       "name": "株式会社システナ"
    //   },
    //   {
    //       "year": "2021",
    //       "name": "株式会社レイヤード"
    //   }
    // ]
    const job = [];
    if (jsonData["jobYear[]"] && jsonData["jobName[]"]) {
      const jobYears = Array.isArray(jsonData["jobYear[]"])
        ? jsonData["jobYear[]"]
        : [jsonData["jobYear[]"]];
      const jobNames = Array.isArray(jsonData["jobName[]"])
        ? jsonData["jobName[]"]
        : [jsonData["jobName[]"]];

      for (let i = 0; i < jobYears.length; i++) {
        job.push({
          year: jobYears[i],
          name: jobNames[i],
        });
      }
      delete jsonData["jobYear[]"];
      delete jsonData["jobName[]"];
    }
    if (job.length > 0) jsonData["job"] = job;

    // license の配列を構築
    // 下記のような形になる
    // "license": [
    //   {
    //       "year": "2015",
    //       "name": "普通自動車免許"
    //   },
    //   {
    //       "year": "2016",
    //       "name": "普通自動二輪免許"
    //   }
    // ]
    const license = [];
    if (jsonData["licenseYear[]"] && jsonData["licenseName[]"]) {
      const licenseYears = Array.isArray(jsonData["licenseYear[]"])
        ? jsonData["licenseYear[]"]
        : [jsonData["licenseYear[]"]];
      const licenseNames = Array.isArray(jsonData["licenseName[]"])
        ? jsonData["licenseName[]"]
        : [jsonData["licenseName[]"]];

      for (let i = 0; i < licenseYears.length; i++) {
        license.push({
          year: licenseYears[i],
          name: licenseNames[i],
        });
      }
      delete jsonData["licenseYear[]"];
      delete jsonData["licenseName[]"];
    }
    if (license.length > 0) jsonData["license"] = license;

    // 名前と生年月日を結合してハッシュ化したものをidとする
    const idSource = jsonData["name"] + jsonData["birthDay"];
    const id = CryptoJS.SHA256(idSource).toString(CryptoJS.enc.Hex);
    jsonData.id = id;
    localStorageData.id = id;

    console.log("jsonData");
    console.log(jsonData);
    console.log("localStorageData");
    console.log(localStorageData);

    // APIに投げたくないデータはLocalStorageに保存
    saveToLocalStorage(localStorageData);

    // APIに基本情報を登録する
    const basicInfoSaveURL = "";
    if (!basicInfoSaveURL) {
      alert("バックエンドのURLが存在していません");
      $("#loadingSpinner").fadeOut();
      return;
    }
    $.ajax({
      type: "POST",
      url: basicInfoSaveURL,
      mode: "no-cors",
      "Content-Type": "application/x-www-form-urlencoded",
      data: JSON.stringify(jsonData),
      success: function (response) {
        alert("登録が完了しました。履歴書画面へ遷移します。");
        // 履歴書画面へ遷移させる
        window.location.href = "resume.html"; // 相対パスでリダイレクト
      },
      error: function (error) {
        alert("フォームの保存に失敗しました。");
        console.log(error);
      },
      complete: function () {
        // 成功・失敗に関わらず、AJAXリクエストが完了したときにローディング非表示
        $("#loadingSpinner").fadeOut();
      },
    });
  });
});

// 渡されたセレクトボックスの初期値を defaultYearにする
function populateYearOptions(selectElement) {
  // 年の選択肢を生成
  const currentYear = new Date().getFullYear();
  const startYear = 1920;
  const defaultYear = 2000;
  for (let year = currentYear; year >= startYear; year--) {
    const selected = year === defaultYear ? "selected" : "";
    $(selectElement).append(
      `<option value="${year}" ${selected}>${year}</option>`
    );
  }
}

/**
 * 生年月日が変更された時に、値を元に高校と大学の入学年を設定する
 * 早生まれの場合で分岐する
 */
function setEducationYears() {
  // 生年月日を取得
  const birthYear = parseInt($("#birthYear").val());
  const birthMonth = parseInt($("#birthMonth").val());
  const birthDate = parseInt($("#birthDate").val());

  // 念の為全て数値か確認
  if (!isNaN(birthYear) && !isNaN(birthMonth) && !isNaN(birthDate)) {
    // （1月〜3月）生まれは早生まれと判定
    const isEarlyBirth = birthMonth <= 3;

    let highSchoolYear, universityYear;
    if (isEarlyBirth) {
      // 早生まれの処理
      highSchoolYear = birthYear + 15;
      universityYear = birthYear + 18;
    } else {
      // 通常処理
      highSchoolYear = birthYear + 16;
      universityYear = birthYear + 19;
    }

    // 高校入学年と大学入学年を設定
    $("#highSchoolYear").val(highSchoolYear);
    $("#universityYear").val(universityYear);
  }
}

// LocalStorageにデータを保存する関数
function saveToLocalStorage(data) {
  const expiryTime = new Date().getTime() + 3 * 60 * 60 * 1000; // 3時間の期限
  const item = {
    value: data,
    expiry: expiryTime,
  };
  // resumePersonalData というキーで保存しておく
  localStorage.setItem("resumePersonalData", JSON.stringify(item));
}

// LocalStorageに保存したデータを削除する関数
function removeFromLocalStorage() {
  localStorage.removeItem("resumePersonalData");
}
