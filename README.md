# クラスリマインダーと天気通知アプリ

このGoogle Apps Scriptプロジェクトは、クラスのスケジュールと現在の天気情報をSlackチャンネルに送信する毎日のリマインダーを送信するために設計されています。このスクリプトは、OpenWeatherMap APIを使用して天気データを取得し、Google Calendar APIを使用して授業週情報を取得します。

## 機能

- **クラススケジュールリマインダー**: あなたのクラススケジュールに基づいて自動的にリマインダーを送信します（月曜日は午前10:40、水曜日から金曜日は午前9:00、火曜日と週末はクラスなし）。
- **天気通知**: OpenWeatherMap APIを使用して東京の現在の天気を取得し、リマインダーに温度と湿度の詳細を含めます。
- **Slack統合**: 指定されたSlackチャンネルにリマインダーを直接送信します。
- **動的な出発時間計算**: 交通時間、旅行時間、および天候条件に基づいて追加の時間を考慮して、推奨出発時間を計算します。

## はじめに

### 前提条件

- Google Apps ScriptとGoogle CalendarにアクセスできるGoogleアカウント。
- チャンネルにメッセージを送信するためのWebhook URLを持つSlackワークスペース。
- OpenWeatherMap APIキー。

### インストール

1. **リポジトリをクローン**:
   ```bash
   git clone https://github.com/yourusername/class-reminder-weather-app.git
