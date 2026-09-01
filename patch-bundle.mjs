import { readFileSync, writeFileSync } from "node:fs";

const bundlePath = "assets/index-DvFIb72A.js";
const source = readFileSync(bundlePath, "utf8");
const oldTask = '},{id:"follow_erik",title:"Follow @erikcrty",subtitle:"The hand behind the drawings. Follow Erik to see the Robos take shape.",href:"https://x.com/erikcrty",tone:"bg-robo-ink text-lime"}]';
const newTask = '},{id:"follow_erik",title:"Follow @erikcrty",subtitle:"The hand behind the drawings. Follow Erik to see the Robos take shape.",href:"https://x.com/erikcrty",tone:"bg-robo-ink text-lime"},{id:"like_retweet_latest",title:"Like & Retweet the latest post",subtitle:"Like and retweet the latest Robo whitelist post on X.",href:"https://x.com/therobowtf/status/2094835376913559983?s=20",tone:"bg-robo-pink text-white"}]';

if (!source.includes("like_retweet_latest")) {
  if (!source.includes(oldTask)) {
    throw new Error("The expected task list was not found in the bundled app.");
  }
  writeFileSync(bundlePath, source.replace(oldTask, newTask));
}

console.log("Latest X task added to the bundled app.");
