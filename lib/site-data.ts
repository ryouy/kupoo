import fs from "node:fs";
import path from "node:path";

export type SiteFact = {
  label: string;
  value: string;
};

export type SiteContent = {
  home: {
    eyebrow: string;
    title: string;
    tagline: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    latestEyebrow: string;
    latestTitle: string;
  };
  about: {
    eyebrow: string;
    headline: string;
    body: string;
    vibeTitle: string;
    vibeBody: string;
    jokeLabel: string;
    joke: string;
    facts: SiteFact[];
  };
  contact: {
    eyebrow: string;
    headline: string;
    body: string;
    xHandle: string;
    xUrl: string;
  };
  members: {
    eyebrow: string;
    headline: string;
    body: string;
  };
};

export type Member = {
  name: string;
  role: string;
  comment: string;
  image: string;
};

const contentRoot = path.join(process.cwd(), "content");

function readJson<T>(fileName: string, fallback: T): T {
  const filePath = path.join(contentRoot, fileName);

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export const fallbackSiteContent: SiteContent = {
  home: {
    eyebrow: "会津大学 非公式お絵描きサークル",
    title: "Kupoo",
    tagline: "未来のバンクシーがここから生まれる",
    description: "アトリエきやれでもぐもぐしながら、気ままに絵を描く人たちのWebギャラリーです。作品、ノリ、活動記録、たぶん全部ちょっとにぎやか。",
    primaryCta: "作品を見る",
    secondaryCta: "Kupooとは",
    latestEyebrow: "できたて / たぶん自信作",
    latestTitle: "新着作品"
  },
  about: {
    eyebrow: "Kupoo紹介ページ",
    headline: "未来のバンクシーがここから生まれる",
    body: "Kupooは、会津大学の非公式お絵描きサークルです。アトリエきやれでもぐもぐしながら、気ままに絵を描いています。メンバーは絵がとっても上手です。",
    vibeTitle: "だいたいこんな感じ",
    vibeBody: "うまい人も、これから描く人も、今日は線がヘロヘロの日の人も、同じ机でわちゃわちゃ描く場所です。おやつを食べて、絵を見せ合って、たまに謎の名言が生まれます。",
    jokeLabel: "小ネタ",
    joke: "長野までの直行タクシー利用は #Kupooタクシー",
    facts: [
      { label: "なにもの", value: "会津大学の非公式お絵描きサークル" },
      { label: "活動", value: "毎週金曜 17時から" },
      { label: "場所", value: "アトリエきやれ" },
      { label: "参加費", value: "各回おやつ代100円。なくても参加可能" },
      { label: "参加方法", value: "現地でもリモートでもOK" }
    ]
  },
  contact: {
    eyebrow: "連絡先",
    headline: "Kupooに声をかける",
    body: "見学したい、参加したい、なんか楽しそうなので話を聞きたい。そんな感じで気軽にどうぞ。お絵描き欲がある日はだいたい歓迎ムードです。",
    xHandle: "@Kupoo129",
    xUrl: "https://x.com/Kupoo129"
  },
  members: {
    eyebrow: "メンバーリスト",
    headline: "Kupooの人たち",
    body: "まだ仮の状態です。あとから名前、SNS、担当、アイコンなどを増やしていけます。"
  }
};

export const fallbackMembers: Member[] = [
  {
    name: "ティラノ",
    role: "おやつ係兼、突然すごい線を引く人",
    comment: "金曜17時にだいたい現れる。クレヨンを持つとちょっと強い。",
    image: "/kupoo-mascot.svg"
  },
  {
    name: "てんとう虫",
    role: "ギャラリー係兼、余白に落書きする人",
    comment: "作品を並べたり、サイトをいじったり、長野方面の気配を察知したりする。",
    image: "/favicon.svg"
  }
];

export function getSiteContent() {
  return readJson<SiteContent>("site.json", fallbackSiteContent);
}

export function getMembers() {
  return readJson<Member[]>("members.json", fallbackMembers);
}
