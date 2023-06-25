<template>
  <div class="nounify-my-face">
    <wagmi-connect />
    <div class="camera-main-container">
      <div v-if="isLoading" class="loader"><div /></div>
      <div v-if="showCamera" class="prompt">
        Click on glasses to make an avatar
      </div>
      <camera
        v-if="showCamera"
        ref="camera"
        :resolution="{ width: 1000, height: 1000 }"
        :autoplay="true"
      />
      <img
        v-if="showCamera"
        class="noun-image"
        src="./assets/noun.svg"
        @click="snapshot"
      />
      <img
        v-if="generatedAvatar"
        class="avatar-result"
        :src="generatedAvatar"
        @click="generatedAvatar = ''"
      />
    </div>
    <noun-button v-if="generatedAvatar" :disabled="!isConnected" @click="send">
      ✉️ Send it to me
    </noun-button>
  </div>
</template>

<script lang="ts">
import WagmiConnect from './components/WagmiConnect.vue';
import NounButton from './components/NounButton.vue';
import Camera from 'simple-vue-camera';
import { defineComponent, ref } from 'vue';

import { blobToBase64, sendImage } from './util';
import axios from 'axios';
import { computed } from '@vue/reactivity';
import { useAccount } from 'use-wagmi';

export default defineComponent({
  components: { Camera, WagmiConnect, NounButton },
  setup() {
    const camera = ref<InstanceType<typeof Camera>>();

    const snapshot = async () => {
      isLoading.value = true;

      try {
        if (!camera.value) return;
        const blob = await camera.value?.snapshot();

        if (!blob) return;

        const URL = await blobToBase64(blob);

        const result = await axios.post(
          // 'https://us-central1-ethglobal-wat23-ai-hack.cloudfunctions.net/nounifyMyFace',
          'http://127.0.0.1:6001/ethglobal-wat23-ai-hack/us-central1/nounifyMyFace',
          {
            image_base64: URL,
          },
          {
            withCredentials: false,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        generatedAvatar.value = result.data.result_image;
      } catch (err) {
        console.error(err);
      } finally {
        isLoading.value = false;
      }
    };

    const send = () => {
      if (!generatedAvatar.value || !address.value) return;
      isLoading.value = true;
      sendImage(address.value, generatedAvatar.value).finally(() => {
        isLoading.value = false;
      });
    };

    const isLoading = ref(false);
    const generatedAvatar = ref<string>();
    const showCamera = computed(
      () => !isLoading.value && !generatedAvatar.value,
    );

    const { isConnected, address } = useAccount();

    return {
      camera,
      isLoading,
      generatedAvatar,
      showCamera,
      snapshot,
      send,
      isConnected,
      address,
    };
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.nounify-my-face {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.camera-main-container {
  width: 512px;
  max-width: calc(100vw - 20px);
  height: 512px;
  position: relative;
  margin: 10px;

  .prompt {
    position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 20;
    font-weight: bold;
    font-size: 20px;
  }

  video {
    transform: scaleX(-1);
  }

  .noun-image {
    position: absolute;
    left: 0;
    top: 0;
    margin: auto;
    width: 100%;
    opacity: 0.5;
    cursor: pointer;
  }

  .avatar-result {
    width: 100%;
    height: 100%;
  }

  .loader {
    position: absolute;
    z-index: 50;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    > div {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 5px solid #fff;
      border-top-color: #000;
      animation: spin 1s ease-in-out infinite;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
}
</style>
