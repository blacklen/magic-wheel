<template lang="pug">
.word-box
  Cube(
    v-for="cube in cubes"
    :key="cube.id"
    :cube="cube"
    @click="() => handleOpenCube(cube)"
  )
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import Cube from "./Cube.vue";

const props = defineProps(["word"]);

const command = inject("command");

const activeCube = ref('');

const handleOpenCube = (cube) => {
  activeCube.value += ` ${cube.id}`;
  localStorage.setItem("activeCube", activeCube.value);
};

const cubes = computed(() => {
  const wordArray = props.word.toUpperCase().split("");
  let guestList = localStorage.getItem("guestList") || '';

  if (command.value.length === 1) {
    guestList += `,${command.value.toUpperCase()}`;
    localStorage.setItem("guestList", guestList);
  }

  return wordArray.map((letter, index) => ({
    id: index,
    value: letter,
    isActive: command.value === "all"
      || guestList.split(',').includes(letter)
      || activeCube.value.includes(index),
  }));
});

onMounted(() => {
  activeCube.value = localStorage.getItem("activeCube") || '';

  document.addEventListener('word-changed', () => {
    activeCube.value = '';
    localStorage.removeItem("activeCube");
  })
});
</script>

<style scoped>
.word-box {
  display: inline-flex;
  justify-content: flex-start;
  max-width: 100%;
}
</style>
