import 'dotenv/config';
import cors from 'cors';
import fs from 'fs';
import axios from 'axios';
import * as functions from 'firebase-functions';

import Jimp from 'jimp';

const corsMiddlware = cors({
  origin: '*',
});

export const nounifyMyFace = functions.https.onRequest((req, res) =>
  corsMiddlware(req, res, async () => {
    const deleteBackgroundResult = await axios.post(
      'https://api.withoutbg.com/v1.0/image-without-background-base64',
      {
        image_base64: req.body.image_base64.replace(
          'data:image/png;base64,',
          '',
        ),
      },
      {
        headers: {
          'X-API-Key': '49720876-2eda-4338-830f-54a74c4691f0',
          'Content-Type': 'application/json',
        },
      },
    );

    // const base64Data = req.body.image_base64.replace(
    //   /^data:image\/(png|jpeg);base64,/,
    //   '',
    // );

    fs.writeFileSync(
      'out.png',
      deleteBackgroundResult.data.img_without_background_base64,
      'base64',
    );

    const mainImage = await Jimp.read('out.png');

    const width = mainImage.getWidth();
    const height = mainImage.getHeight();

    const background = new Jimp(width, height, 0xffffffff);
    const glasses = await Jimp.read('./src/assets/glasses.png');

    const result_image = await background
      .composite(mainImage.flip(true, false), 0, 0)
      .resize(32, 32)
      .composite(glasses.resize(32, 32), 0, 0)
      .getBase64Async('image/png');

    res.status(200).send({
      result_image,
    });
  }),
);
