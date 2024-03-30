import puppeteer from "puppeteer";
import axios from "axios";
import "dotenv/config";

async function CreateEmail() {
  const options = {
    method: "GET",
    url: "https://temp-mail94.p.rapidapi.com/new-mail",
    headers: {
      "X-RapidAPI-Key": process.env.API_KEY,
      "X-RapidAPI-Host": "temp-mail94.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
async function getInbox(data) {
  let pengulang = 0;
  while (pengulang < 5) {
    const options = {
      method: "GET",
      url: "https://temp-mail94.p.rapidapi.com/mail-box",
      params: {
        email: data.email,
        token: data.token,
      },
      headers: {
        "X-RapidAPI-Key": process.env.API_KEY,
        "X-RapidAPI-Host": "temp-mail94.p.rapidapi.com",
      },
    };
    try {
      const response = await axios.request(options);
      // console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
}
async function Mulai(index) {
  const emailNya = await CreateEmail();
  // console.log(`Mendapatkan email`, emailNya.email);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1080, height: 1024 });

  await page.goto(process.env.LINK_REF, {
    waitUntil: "networkidle0",
  });

  const email = `[name="email"]`;
  await page.waitForSelector(email);
  if (email) {
    await page.type(email, emailNya.email);
  }
  const buttonSend =
    "body > main > section > form.flex.w-full.flex-col.justify-center.gap-2.text-foreground > button";
  await page.waitForSelector(buttonSend);
  if (buttonSend) {
    await page.click(buttonSend);
    // console.log("Link Verif Berhasil Dikirim");
  }
  let linkVeif = "";
  try {
    let percobaan = 0;
    // console.log("Mencari Link Verif");
    await delay(3000);
    while (percobaan < 5) {
      let inbox = await getInbox(emailNya);
      // console.log(`isi inbox`, inbox);
      if (inbox.length === 0) {
        percobaan++;
        console.log("Menunggu kembali Belum ada email...", percobaan);
        await delay(3000);
        // console.log(inbox[0].body_text)
      } else {
        let linkRegex = /https?:\/\/[^\s]+/g;
        let link = inbox[0].body_text.match(linkRegex);
        linkVeif = link[0];
        // console.log("Link verif ditemukan");
        break;
      }
    }
  } catch (error) {}
  //   console.log(`ini adalah link verif`,linkVeif)
  //   await page.goto(linkVeif)
  await page.goto(linkVeif, {
    waitUntil: "networkidle0",
  });
  await delay(3000);
  await browser.close();
  console.log(`[${index}] ${emailNya.email} ✅`);
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function start() {
  for (let index = 0; index < process.env.JMLH_REF; index++) {
    await Mulai(index + 1);
  }
  console.log("Kelar BossQ 👌");
}
start();
