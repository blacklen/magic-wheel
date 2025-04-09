<template lang="pug">
.mask-text(:class="{ 'mask-text--active': isActive }")
  .text-container(@click="handleClick")
    .mask(ref="maskRef")
    .text
      span.text-key(v-html="hintKey")
      span(v-if="isActive", v-html="hintContent")

</template>

<script setup>
import { computed, onMounted, ref, inject } from 'vue';

const props = defineProps(['text']);

const command = inject("command");

const maskRef = ref(null);

const isActive = computed(() => command.value === 'all');

const isLink = computed(() => props.text[0] === '<');

const hintKey = computed(() => isLink.value ? props.text : props.text.split(':')[0]);

const hintContent = computed(() => isLink.value ? '' : props.text.split(`${hintKey.value}:`)[1]);

const getStorage = () => localStorage.getItem('hintList') || '';

const handleClick = () => {
  maskRef.value.style.transform = 'translateX(100%)';
  localStorage.setItem('hintList', getStorage() + `,${hintKey.value}`);
};

onMounted(() => {
  if (getStorage().includes(hintKey.value)) {
    maskRef.value.style.transform = 'translateX(100%)';
  }
});
</script>

<style scoped>
.text-container {
  position: relative;
  display: inline-block;
  height: 30px;
  width: 470px;
  overflow: hidden;
}

/* Mask Styling */
.mask {
  position: absolute;
  width: 100%;
  height: 100%;
  background: black; /* Mask color */
  z-index: 2;
  transition: transform 0.5s ease;
  transform: translateX(0); /* Initially covered */
  border-radius: 6px;
}

/* Text Styling */
.text {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white; /* Text color */
  font-size: 20px;
}

.mask-text.mask-text--active .mask {
  transform: translateX(100%);
}

.mask-text.mask-text--active .text-container {
  height: fit-content;
}

.mask-text.mask-text--active .text {
  position: relative;
  display: block;
  text-align: left;
  font-size: 15px;
}

.mask-text.mask-text--active .text .text-key {
  font-weight: bold;
  color: yellow;
}
</style>
