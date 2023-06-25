<template>
  <div class="camera-main-container">
    <camera
      class="camera"
      ref="camera"
      :resolution="{ width: 1000, height: 1000 }"
      :autoplay="true"
    >
    </camera>
    <button @click="snapshot">Snapshot</button>
    <img class="noun-image" src="./assets/noun.svg" />
    <!-- <img :src="noBackImage" /> -->
  </div>
</template>

<script lang="ts">
import Camera from 'simple-vue-camera';
import { defineComponent, ref } from 'vue';
import noBackImage from './util/noBack';

import { blobToBase64 } from './util';
import axios from 'axios';

export default defineComponent({
  components: { Camera },
  setup() {
    const camera = ref<InstanceType<typeof Camera>>();

    const snapshot = async () => {
      if (!camera.value) return;
      const blob = await camera.value?.snapshot();

      if (!blob) return;

      const URL = await blobToBase64(blob);

      console.log(URL);

      const result = await axios.post(
        'http://127.0.0.1:6001/ethglobal-wat23-ai-hack/us-central1/nounifyMyFace',
        {
          // image_base64,
          image_base64: URL,
        },
        {
          withCredentials: false,
          // mode: 'no-cors',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(result.data);
    };
    return {
      camera,
      snapshot,
      noBackImage: `data:image/png;base64,${noBackImage}`,
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

.camera-main-container {
  width: 500px;
  height: 500px;
  position: relative;

  video {
    transform: scaleX(-1);
  }

  .noun-image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    opacity: 0.5;
  }
}
</style>
