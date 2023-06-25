import 'dotenv/config';
import axios from 'axios';
// import rgbquant from 'rgbquant';
// import Canvas from 'canvas';/
import * as functions from 'firebase-functions';

import Jimp from 'jimp';

export const nounifyMyFace = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.status(204).send('');
    return;
  }

  const deleteBackgroundResult = await axios.post(
    'https://api.withoutbg.com/v1.0/image-without-background-base64',
    {
      image_base64: req.body.image_base64.replace('data:image/png;base64,', ''),
    },
    {
      headers: {
        'X-API-Key': '49720876-2eda-4338-830f-54a74c4691f0',
        'Content-Type': 'application/json',
      },
    },
  );

  const base64Data = deleteBackgroundResult.data.img_without_background_base64;
  // const base64Data = req.body.image_base64.replace(
  // /^data:image\/(png|jpeg);base64,/,
  // '',
  // );

  const mainImage = await Jimp.read(Buffer.from(base64Data, 'base64'));

  const width = mainImage.getWidth();
  const height = mainImage.getHeight();

  const background = new Jimp(width, height, 0xd5d7e1ff);
  const glassesChoice = Math.round(6 * Math.random());
  const glasses = await Jimp.read(`./src/assets/glasses/${glassesChoice}.png`);

  const result_image = await background
    .composite(mainImage.flip(true, false), 0, 0)
    .resize(32, 32)
    .composite(glasses.resize(32, 32), 0, 0)
    .resize(512, 512, Jimp.RESIZE_NEAREST_NEIGHBOR)
    .getBase64Async('image/png');

  res.send({
    result_image,
  });
});
