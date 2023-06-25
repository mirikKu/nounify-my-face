<template>
  <button class="noun-button"><slot /></button>
</template>

<style lang="scss" scoped>
.noun-button {
  cursor: pointer;
  background-color: #627eea;
  color: #fff;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.3s ease;
  &[disabled] {
    cursor: not-allowed;
    opacity: 0.8;
  }
  &:not([disabled]):hover {
    background-color: #4c6ef5;
  }
}
</style>
