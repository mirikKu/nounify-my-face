import { Client } from '@xmtp/xmtp-js';
import { Wallet } from 'ethers';
import { uploadFile } from './upload';
import {
  ContentTypeRemoteAttachment,
  RemoteAttachment,
} from 'xmtp-content-type-remote-attachment';

// You'll want to replace this with a wallet from your application
const wallet = Wallet.createRandom();
// Create the client with your wallet. This will connect to the XMTP development network by default
const xmtp = await Client.create(wallet, { env: 'production' });
// Start a conversation with XMTP

export async function sendImage(walletAddress: string, data: string) {
  const conversation = await xmtp.conversations.newConversation(walletAddress);

  const { url, attachment, encryptedEncoded } = await uploadFile(
    data,
    'noun-avatar.png',
    'image/png',
  );

  const remoteAttachment: RemoteAttachment = {
    url: url,
    contentDigest: encryptedEncoded.digest,
    salt: encryptedEncoded.salt,
    nonce: encryptedEncoded.nonce,
    secret: encryptedEncoded.secret,
    scheme: 'https://',
    filename: attachment.filename,
    contentLength: attachment.data.byteLength,
  };

  console.log(url);

  await conversation.send(remoteAttachment, {
    contentFallback:
      '[Attachment] Cannot display ${remoteAttachment.filename}. This app does not support attachments yet.',
    contentType: ContentTypeRemoteAttachment,
  });
}
