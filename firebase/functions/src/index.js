import 'dotenv/config';
import cors from 'cors';
import axios from 'axios';
// import rgbquant from 'rgbquant';
// import Canvas from 'canvas';/
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

    const base64Data =
      deleteBackgroundResult.data.img_without_background_base64;
    // const base64Data = req.body.image_base64.replace(
    // /^data:image\/(png|jpeg);base64,/,
    // '',
    // );

    const mainImage = await Jimp.read(Buffer.from(base64Data, 'base64'));

    const width = mainImage.getWidth();
    const height = mainImage.getHeight();

    const background = new Jimp(width, height, 0xd5d7e1ff);
    const glasses = await Jimp.read('./src/assets/glasses.png');

    const result_image = await background
      .composite(mainImage.flip(true, false), 0, 0)
      .resize(32, 32)
      .composite(glasses.resize(32, 32), 0, 0)
      .resize(512, 512, Jimp.RESIZE_NEAREST_NEIGHBOR)
      .getBase64Async('image/png');

    res.status(200).send({
      result_image,
    });
  }),
);
