import 'dotenv/config';
import cors from 'cors';
import fs from 'fs';
import * as functions from 'firebase-functions';

import Jimp from 'jimp';

const corsMiddlware = cors({
  origin: '*',
});

export const nounifyMyFace = functions.https.onRequest((req, res) =>
  corsMiddlware(req, res, async () => {
    // const deleteBackgroundResult = await axios.post(
    //   'https://api.withoutbg.com/v1.0/image-without-background-base64',
    //   {
    //     // image_base64: req.body.image_base64.replace(
    //     // 'data:image/png;base64,',
    //     // '',
    //     // ),
    //     image_base64: originalImage.replace('data:image/png;base64,', ''),
    //   },
    //   {
    //     headers: {
    //       'X-API-Key': '49720876-2eda-4338-830f-54a74c4691f0',
    //       'Content-Type': 'application/json',
    //     },
    //   },
    // );

    const base64Data = req.body.image_base64.replace(
      /^data:image\/png;base64,/,
      '',
    );

    fs.writeFileSync('out.png', base64Data, 'base64');

    const image = await Jimp.read('out.png');

    const width = image.getWidth();
    const height = image.getHeight();

    const background = new Jimp(width, height, 0xffffffff);

    const smaller = width > height ? height : width;

    await background
      .composite(image, 0, 0)
      .crop((width - smaller) / 2, (height - smaller) / 2, smaller, smaller)
      .resize(32, 32)
      .writeAsync('pixelate1.png');

    res.status(200).send('{}');
  }),
);
