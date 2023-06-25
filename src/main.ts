import { createApp } from 'vue';
import AppComponent from './App.vue';

import { UseWagmiPlugin, createConfig, mainnet } from 'use-wagmi';
import { createPublicClient, http } from 'viem';

const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

export const app = createApp(AppComponent);

app.use(UseWagmiPlugin, wagmiConfig);

app.mount('#app');
