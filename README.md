# Kupoo

会津大学の非公式お絵描きサークル「Kupoo」の[Webギャラリー](https://kupoo.vercel.app/)です。

作品の投稿・閲覧、Kupoo紹介、メンバー一覧、連絡先ページがあります。

## 使っているもの

- Next.js
- React
- Tailwind CSS
- GitHub API

## 起動

```sh
npm install
npm run dev
```

ローカルでは以下で見られます。

```txt
http://localhost:3000
```

## ビルド

```sh
npm run build
```

## コンテンツ

- 作品: `content/paintings/*.md`
- サイト内テキスト: `content/site.json`
- メンバー: `content/members.json`
- 作品画像: `public/images/paintings/`
- Kupooロゴなど: `public/`

通常ページはローカルのJSONやMarkdownを読みます。
GitHub APIを使うのは管理画面で保存するときだけです。

## 管理画面

```txt
/admin
```

管理画面でできること:

- 作品の追加・編集・削除
- 問い合わせチャットへの返信
- サイト内テキストの編集
- メンバーの追加・編集・削除

必要な環境変数:

```txt
ADMIN_PASSWORD=
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_TOKEN=
GITHUB_BRANCH=main
CONTACT_DATA_SECRET=
GITHUB_CONTACT_PATH=content/private-inquiries
```

問い合わせチャットはGitHub APIで `GITHUB_CONTACT_PATH` に保存します。
本文やパスワード情報は `CONTACT_DATA_SECRET` で暗号化されるため、GitHub上では暗号文だけが見えます。

## push

管理画面からGitHub上のコンテンツが更新されている場合は、衝突回避用にこちらを使います。

```sh
git add .
git commit -m "Update site design"
npm run sync:push
```
