const spreadsheetId = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

// POSTメソッドを受け取る
function doPost(e){
  const spreadsheetId = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  logging('POSTメソッドでデータを取得したよ！！！', e.postData.contents, e.parameter)

  try{
    var requestData = JSON.parse(e.postData.contents)

    // typeが空、あるいは想定していないタイプだったらエラーにする
    if(!requestData.type || ['basic', 'pr'].includes(requestData.type) == false){
      return createResponse(JSON.stringify({message: '想定外のtypeが指定されました', status: 'NG'}))
    }

    // スプシに書き込む
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId)
    var sheet = spreadsheet.getSheetByName('シート1');

    let prstr = ""

    // IDがあるかチェック。なければ新規作成、あれば更新
    const profile = findProfile(sheet, requestData.id)
    if(profile == null){
      // IDが見つからなかったので新規作成
      const profileId = Utilities.getUuid()
      requestData.id = profileId

      // 基本情報と自己紹介で処理を分ける
      if(requestData.type == 'basic')
      {
        sheet.appendRow([requestData.id, selectBasicData(requestData)])
      }else if(requestData.type == 'pr'){
        // ChatGPTに自己紹介文を作ってもらう
        prstr = ChatGPTAccess(requestData.prName)
        sheet.appendRow([requestData.id, selectBasicData(requestData), JSON.stringify(requestData.prName), prstr])
      }    
    }else{
      // 基本情報と自己紹介で処理を分ける
      if(requestData.type == 'basic')
      {
        sheet.getRange(profile, 2).setValue(selectBasicData(requestData))
      }else if(requestData.type == 'pr'){
        // ChatGPTに自己紹介文を作ってもらう
        prstr = ChatGPTAccess(requestData.prName)

        sheet.getRange(profile, 3).setValue(JSON.stringify(requestData.prName))
        sheet.getRange(profile, 4).setValue(prstr)
      }
    }

    let response = {
      status: "OK",
      message: "成功",
      id: requestData.id
    }

    if(requestData.type == 'pr' && prstr && prstr != ''){
      response.pr = prstr
    }

    logging('レスポンスデータ', response)

    return createResponse(JSON.stringify(response))
  }catch(e){
    let response = {
      status: "NG",
      message: "システムエラーが発生しました",
    }

    logging('エラー発生！！！！', e)

    return response
  }
}

// パラメータから基本情報以外のデータを削除する
function selectBasicData(params)
{
  // ディープコピー（全く別物として扱う）
  let basicData = JSON.parse(JSON.stringify(params));
  delete basicData.id
  delete basicData.type
  delete basicData.prName

  return JSON.stringify(basicData)
}

// GETメソッドを受け取る
function doGet(e){
  logging('GETメソッドでデータを取得したよ！！！', e, e.parameter, e.parameter.id)
  try{
    var requestDataId = e.parameter.id

    // スプシから読み込む
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId)
    var sheet = spreadsheet.getSheetByName('シート1');

    // IDがある場合は１つのデータを取得する
    if(requestDataId){
      const profile = fetchProfile(sheet, requestDataId)

      if(profile){
        // データがある場合
        const response = {id: requestDataId, data: profile, status: "OK", message: ""}
        return createResponse(JSON.stringify(response))
      }else{
        // データがない場合
        const response = {id: requestDataId, data: null, status: "NG", message: "IDに紐づくデータがりません"}
        return createResponse(JSON.stringify(response))
      }
    }else{
      const idList = sheet.getRange(2, 1, sheet.getLastRow()).getValues()
      let datas = []
      for (let profileId of idList){
        // データを取得して配列に追加
        const profile = {id: requestDataId, data: fetchProfile(sheet, profileId)}
        datas.push(profile)
      }
      const response = {datas: datas, status: "OK", message: ""}
      return createResponse(JSON.stringify(response))
    }
  }catch(e){
    let response = {
      status: "NG",
      message: "システムエラーが発生しました",
    }

    logging('エラー発生！！！！', e)

    return response
  }
}

// JSON形式でレスポンスを作る
function createResponse(value){
  // ContentServiceを使えばJSON形式で返せるらしい。GASの機能っぽい
  ContentService.createTextOutput()
  var output = ContentService.createTextOutput();

  // JSONでかえすぜ！ってする。レスポンスのヘッダーに付与される
  output.setMimeType(ContentService.MimeType.JSON);

  // データを埋め込む
  output.setContent(value);

  // できたデータをお返事
  return output;
}

// ロギング機能
// "...value"は可変長引数。2つ以上の引数を入れると配列として取得できる
function logging(message, ...value){
  let data = {
    message: message,
    value: value
  }
  Logger.log(data)
}

// スプシの1行目はヘッダー行とする。ヘッダ行のデータ一覧を返す
function getHeaders(sheet) {
  var range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  return range.getValues()[0]; // ヘッダー行のみを返す
}

// IDで検索する
function findProfile(sheet, id) {
  // 指定されたデータが空白の時はnullを返す
  if( !sheet || !id || id == '')
  {
    return null
  }

  // A列を2列目以降全範囲選択
  var range = sheet.getRange(2, 1, sheet.getLastRow() - 1);
  // 完全なセル一致で検索

  var textFinder = range.createTextFinder(id).matchEntireCell(true);
  // 最初のセルを返す
  var foundRange = textFinder.findNext();

  if (foundRange) {
    return foundRange.getRow()
  } else {
    // とりあえず入力されたIDで1列作ってその行を返す
    sheet.appendRow([id])
    return sheet.getLastRow()
  }
}

// IDで検索してデータを返す
function fetchProfile(sheet, id) {
  const row = findProfile(sheet, id)

  if (row) {
    // スプシからデータを取得
    const basicData = sheet.getRange(row, 2).getValue()
    const prData = sheet.getRange(row, 4).getValue()

    // JSONにする
    var profileData = JSON.parse(basicData)

    // 自己紹介文はついてないので紐づけ
    profileData.pr = prData

    // JSONを文字列に戻して返す
    return profileData
  } else {
    return null; // 指定されたIDが見つからない場合
  }
}

// ChatGPTで自己紹介PRを作る
function ChatGPTAccess(dialogs) {
  // 自己紹介文が配列じゃなかったら想定外
  if(!Array.isArray(dialogs)){
    throw "自己紹介文が配列ではありません"
  }

  //スクリプトプロパティに設定したOpenAIのAPIキーを取得
  const apiKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  //ChatGPTのAPIのURLを設定
  const apiUrl = 'https://api.openai.com/v1/chat/completions'

  //ChatGPTに投げるメッセージを設定
  const messages = [
    {'role': 'system', 'content': '以下の文章を元にユーザの自己紹介文を400文字で作成してください'},
  ]

  // 自己紹介文をユーザの発言としてChatGPTの会話をつくる
  for (const dialog of dialogs) {
    messages.push({'role': 'user', 'content': dialog})
  }

  //OpenAIのAPIリクエストに必要なヘッダー情報を設定
  const headers = {
    'Authorization':'Bearer '+ apiKey,
    'Content-type': 'application/json',
    'X-Slack-No-Retry': 1
  };

  //オプションの設定(モデルやトークン上限、プロンプト)
  const options = {
    'muteHttpExceptions' : true,
    'headers': headers,
    'method': 'POST',
    'payload': JSON.stringify({
      'model': 'gpt-3.5-turbo',
      'max_tokens' : 2048,
      'temperature' : 0.9,
      'messages': messages})
  };

  //OpenAIのChatGPTにAPIリクエストを送り、結果を変数に格納
  const response = JSON.parse(UrlFetchApp.fetch(apiUrl, options).getContentText());

  //ChatGPTのAPIレスポンスを返す
  return response.choices[0].message.content
}
