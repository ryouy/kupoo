# KUPOO

会津大学の非公式お絵描きサークル「KUPOO」のWebギャラリーです。

作品の投稿・閲覧、KUPOO紹介、メンバー一覧、連絡先ページがあります。

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
- KUPOOロゴなど: `public/`

通常ページはローカルのJSONやMarkdownを読みます。
GitHub APIを使うのは管理画面で保存するときだけです。

## 管理画面

```txt
/admin
```

管理画面でできること:

- 作品の追加・編集・削除
- サイト内テキストの編集
- メンバーの追加・編集・削除

必要な環境変数:

```txt
ADMIN_PASSWORD=
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_TOKEN=
GITHUB_BRANCH=main
```

## push

管理画面からGitHub上のコンテンツが更新されている場合は、衝突回避用にこちらを使います。

```sh
git add .
git commit -m "Update site design"
npm run sync:push
```
