<template lang="pug">
.cube(ref="cubeRef")
  .flip
  .flop {{ cube.value }}
</template>

<script setup>
import { watch, ref, onMounted } from 'vue';

const props = defineProps(['cube']);

const cubeRef = ref(null);

const openCube = () => {
  cubeRef.value.style.transform = 'rotateX(89deg)';
};

watch(() => props.cube, value => {
  if (value?.isActive) {
    openCube();
  }
});

onMounted(() => {
  if (props.cube.isActive) openCube();
});
</script>

<style scoped>
/* Container box to set the sides relative to */
.cube {
	width: 100px;
	text-align: center;
	margin: 0 auto;

	transition: transform .3s; /* Animate the transform properties */

	transform-style: preserve-3d; /* <-NB */
  height: 100px;
  border: 1px solid yellow;
}

.flip,.flop {
	border: 2px solid black;
  background: black;
  color: yellow;
  height: 100%;
  width: 100%;
  text-align: center;
  font-size: 60px;
  border: 1px solid yellow;
}

.flip {
	transform: translateZ(50px);
}

.flop {
	transform: rotateX(-90deg) translateZ(-50px);
}

/* rotation */
/* .cube:hover {
	transform: rotateX(89deg);
} */
</style>
