<template lang="pug">
.word-box
  Cube(
    v-for="cube in cubes"
    :key="cube.id"
    :cube="cube"
  )
</template>

<script setup>
import { computed, inject } from "vue";
import Cube from "./Cube.vue";

const props = defineProps(["word"]);

const command = inject("command");

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
    isActive: command.value === "all" || guestList.split(',').includes(letter),
  }));
});
</script>

<style scoped>
.word-box {
  display: inline-flex;
  justify-content: flex-start;
  max-width: 100%;
}
</style>
