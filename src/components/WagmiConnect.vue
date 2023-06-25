<script setup lang="ts">
import NounButton from './NounButton.vue';
import { useAccount, useConnect, useDisconnect } from 'use-wagmi';
import { InjectedConnector } from 'use-wagmi/connectors/injected';

const { address, isConnected } = useAccount();
const { connect } = useConnect({
  connector: new InjectedConnector(),
});
const { disconnect } = useDisconnect();
</script>

<template>
  <div v-if="isConnected">
    Connected to {{ address }}
    <noun-button @click="disconnect()">Disconnect</noun-button>
  </div>
  <noun-button v-else @click="connect()">Connect Wallet</noun-button>
</template>
