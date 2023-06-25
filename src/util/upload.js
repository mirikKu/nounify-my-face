import { Web3Storage } from 'web3.storage';
import { Buffer } from 'buffer';
import { RemoteAttachmentCodec, AttachmentCodec, } from 'xmtp-content-type-remote-attachment';
export default class Upload {
    name;
    data;
    constructor(name, data) {
        this.name = name;
        this.data = data;
    }
    stream() {
        return new ReadableStream({
            start: (controller) => {
                controller.enqueue(Buffer.from(this.data));
                controller.close();
            },
        });
    }
}
export async function uploadFile(base64data, name, type) {
    const attachment = {
        filename: name,
        mimeType: type,
        data: new Uint8Array(Buffer.from(base64data.replace(/^data:image\/(png|jpeg);base64,/, ''), 'base64')),
    };
    // Encode the attachment and encrypt that encoded content
    const encryptedEncoded = await RemoteAttachmentCodec.encodeEncrypted(attachment, new AttachmentCodec());
    const upload = new Upload(name, encryptedEncoded.payload);
    const web3Storage = new Web3Storage({
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDQ3YTY5RjFFMjgwZTc2MDA4RWVmNDM1NkI0RDA1MTg0NjFiODlkOEMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODc2ODUwNTI2OTMsIm5hbWUiOiJOb3VuaWZ5TXlGYWNlIn0.IpQyphc1JoF8hVmMyCXK95yXyFPtA0rudQlcTCXFcFA',
    });
    const cid = await web3Storage.put([upload]);
    return {
        attachment,
        encryptedEncoded,
        url: `https://${cid}.ipfs.w3s.link/${name}`,
    };
}
//# sourceMappingURL=upload.js.map