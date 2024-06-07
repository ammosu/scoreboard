# 記分板應用程序

這是一個簡單的記分板應用程序，允許管理員通過後台界面更新分數和隊伍名稱，並且前台顯示會即時更新。

## 功能

- 即時顯示分數和隊伍名稱
- 管理員可以通過後台界面更新分數和隊伍名稱
- 使用 WebSocket 實現即時更新
- 前後台界面友好，易於操作

## 目錄結構

```
scoreboard/
├── public/
│ ├── index.html
│ ├── admin.html
│ └── styles.css
├── server/
│ ├── server.js
│ └── data/
│ └── scores.json
├── package.json
└── README.md
```

## 安裝和運行

### 先決條件

- Node.js 和 npm 已安裝

### 安裝

1. 克隆這個倉庫到本地：

    ```bash
    git clone <repository-url>
    cd scoreboard
    ```

2. 安裝所需的 npm 包：

    ```bash
    npm install
    ```

### 配置

確保 `server/data/scores.json` 文件存在並包含初始數據：

```json
{
    "team1": 0,
    "team2": 0,
    "team1Name": "隊伍1",
    "team2Name": "隊伍2"
}
```

### 運行

1. 啟動後台服務：

```bash
node server/server.js
```

2. 打開瀏覽器，訪問以下地址：

* 前台顯示：`http://localhost:3000`
* 後台管理：`http://localhost:3000/admin.html`

## 使用說明
### 前台顯示
前台顯示頁面將即時顯示當前的分數和隊伍名稱，無需刷新頁面。

### 後台管理
在瀏覽器中打開後台管理頁面 `http://localhost:3000/admin.html`。
輸入密碼（預設密碼為 `admin123`），按下 Enter 或點擊 `Login` 按鈕登錄。
登錄後，可以通過點擊 `-` 和 `+` 按鈕調整分數，或者直接在輸入框中輸入新的分數。
修改隊伍名稱後，點擊輸入框外的任意位置以保存變更。
點擊 `Reset Scores` 按鈕將分數和隊伍名稱重置為初始值。