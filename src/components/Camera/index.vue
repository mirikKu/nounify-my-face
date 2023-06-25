<template>
  <div class="camera-container" :class="{ [type]: true }">
    <div v-if="data.loading && !restricted" class="loading icon">
      <or-icon name="spinner-alt" />
    </div>
    <div
      v-if="restricted && !data.imageData.image"
      class="camera icon"
      :style="data.customStyle"
    >
      <or-icon name="video" width="32px" height="32px" />
    </div>
    <video
      v-else-if="!data.imageData.image"
      ref="video"
      class="camera video"
      :style="data.customStyle"
    />
    <img
      v-else-if="uploading"
      ref="image"
      :src="data.imageData.image"
      class="camera"
      :style="data.customStyle"
    />
    <template v-else>
      <img
        id="image"
        ref="cropper"
        :src="data.imageData.image"
        alt="Avatar image"
        class="camera"
        :style="data.cropperStyle"
        @zoom="zoomImage"
        @ready="readyImage"
      />
    </template>
    <sup v-if="data.isCapturing" class="camera-badge">
      {{ data.time }}
    </sup>
    <sup v-else-if="uploading" class="camera-badge">
      <or-icon
        class="camera-badge__icon"
        name="spinner-alt"
        width="24px"
        height="24px"
      />
    </sup>
  </div>
</template>

<script lang="tsx">
import { defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue';
import type { PropType } from 'vue';

import type { CameraDataType } from './types';

export default defineComponent({
  name: 'WebCamera',
  props: {
    start: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    color: {
      type: String as PropType<string>,
      default: 'var(--primary-color)',
    },
    restricted: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    uploading: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  emits: ['capture'],
  setup(props, { emit }) {
    const data: CameraDataType = reactive({
      customStyle: {
        'box-shadow': `0 0 0 1px ${props.color}`,
      },
      cropperStyle: {
        '--camera-box-shadow': `0 0 0 1px ${props.color}`,
      },
      time: 3,
      mediaStream: null,
      imageData: {
        image: '',
        image_orientation: 0,
      },
      constraints: {
        audio: false,
        video: true,
      },
      loading: false,
      isCapturing: false,
      timer: null,
      error: null,
      fileName: '',
      zoom: 0,
      zoomMin: 0,
      zoomable: true,
      canvas: null,
      ctx: null,
    });

    onMounted(() => {
      if (props.start) play();
    });
    onUnmounted(() => {
      stop();
      data.imageData = {
        image: '',
        image_orientation: 0,
      };
    });

    const video = ref<HTMLVideoElement>();
    const cropper = ref<any>();

    function play() {
      data.loading = true;
      navigator.mediaDevices.getUserMedia(data.constraints).then((stream) => {
        if (!video.value) return;
        video.value.srcObject = stream;
        video.value.play();
        data.mediaStream = stream;
      });
      data.loading = false;
    }
    async function captureImage() {
      data.isCapturing = true;
      if (!video.value) console.error('Video ref is not provided');
      return new Promise<{ blob: Blob | null; URL: string }>((resolve) => {
        data.timer = setTimeout(() => {
          data.time -= 1;
          if (data.time === 0) {
            if (!data.ctx) {
              const canvas = document.createElement('canvas');
              if (!video.value) {
                console.warn('No video ref was provided');
                return;
              }
              canvas.height = video.value.videoHeight;
              canvas.width = video.value.videoWidth;
              data.canvas = canvas;
              data.ctx = canvas.getContext('2d');
            }
            const { ctx, canvas } = data;
            // сбросить настройки, а затем отразить
            if (!ctx || !canvas) {
              console.warn('No ctx or canvas was provided for capturing');
              return;
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            if (!video.value) {
              console.warn('No video ref was provided');
              return;
            }
            ctx.drawImage(video.value, 0, 0, canvas.width, canvas.height);
            const image: HTMLCanvasElement = canvas;
            const URL = image.toDataURL('image/jpeg', 1);
            data.imageData.image = URL;
            image.toBlob((blob) => {
              emit('capture', URL);
              stopCapturing();
              resolve({ blob, URL });
            });
          } else captureImage().then(resolve);
        }, 100);
      });
    }
    function stopCapturing() {
      if (data.timer) {
        clearTimeout(data.timer);
      }
      data.time = 3;
      data.isCapturing = false;
    }
    // adds uploaded picture
    function addImage(file: File) {
      data.fileName = file.name;
      const reader = new FileReader();

      if (!file.type.match(/image.*/)) {
        console.error(new Error('Not an image'));
        return;
      }

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (!e.target?.result) {
          return console.warn('Adding image failed: there is no target result');
        }
        if (typeof e.target.result === 'string')
          data.imageData.image = e.target.result;
      };

      reader.readAsDataURL(file);
      return file;
    }

    function cancelImage() {
      data.imageData.image = '';
      if (data.timer) {
        clearTimeout(data.timer);
      }
      data.time = 3;
      stop();
      play();
    }

    function stop() {
      if (!data.mediaStream) return;
      const tracks = data.mediaStream.getTracks();
      if (tracks) {
        tracks?.forEach((track) => {
          track?.stop();
        });
      }
    }

    return {
      data,
      video,
      cropper,
      play,
      captureImage,
      stopCapturing,
      addImage,
      cancelImage,
      stop,
    };
  },
});
</script>

<style lang="scss" scoped>
.camera-container {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;

  &.space {
    .camera {
      border-radius: 16px;
    }

    :deep(.cropper-view-box) {
      border-radius: 16px;
    }
    .camera-badge {
      bottom: -30px;
      right: 30px;
    }
  }
  .camera {
    position: relative;
    object-fit: cover;
    visibility: visible;
    width: 100%;
    height: 100%;
    border: 2px solid transparent;
    opacity: 1;
    transition: box-shadow 150ms ease, opacity 150ms ease, transform 150ms ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &.cropper {
      :deep(img) {
        max-height: 500px;
      }
    }
    &.video {
      transform: scaleX(-1);
    }
    &:not(.cropper) {
      min-width: 500px;
      min-height: 500px;
      max-width: 500px;
      max-height: 500px;
    }
  }
  .loading {
    min-width: 150px;
    min-height: 150px;
    max-width: 150px;
    max-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon {
    font-size: var(--text-size-giant);
    color: var(--color-secondary);
    transform: scaleX(1);
  }
  .camera-badge {
    background: #e9e9e9;
    font-size: var(--text-size-large);
    color: var(--color-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    line-height: 40px;
    width: 40px;
    padding: 0 2px;
    text-align: center;
    white-space: nowrap;
    position: absolute;
    bottom: -12px;
    right: #{1 + 40px};
    transform: translateY(-50%) translateX(100%);
    &__icon {
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
