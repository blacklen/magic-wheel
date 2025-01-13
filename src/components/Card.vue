<template lang="pug">
.card
  .content(ref="contentRef")
    .front {{ card.id }}
    .back
      .main-content
        .word-value {{ card.value }}
</template>

<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps(['card']);

const flip = ref(false);
const contentRef = ref(null);

onMounted(() => {
  setTimeout(() => {
    flip.value = true;
    contentRef.value.style.transform = 'rotateY(180deg)';
  }, 3000);
})
</script>

<style lang="css" scoped>
@import 'https://fonts.googleapis.com/css?family=Lily+Script+One';
body {
  background: #eee;
  font-family: 'Lily Script One';
}

.card {
  position: relative;
  width: 50px;
  height: 50px;
  perspective: 500px;
}

.main-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  line-height: normal;
  font-size: 16px;
  gap: 20px;
  color: #03446A;
}

.word-value {
  color: #fff;
  font-size: 60px;
}

.card.card--pass .front, .card.card--pass .back {
  background-color: #7AC143;
}

.card.card--fail .front, .card.card--fail .back {
  background-color: #da3b0f;
}

.content {
  position: absolute;
  width: 100%;
  height: 100%;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);

  transition: transform 0.5s;
  transform-style: preserve-3d;
}

.card:hover .content {
  transform: rotateY( 180deg ) ;
  transition: transform 0.2s;
}

.front,
.back {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  position: absolute;
  height: 100%;
  width: 100%;
  background: white;
  line-height: 300px;
  color: #03446A;
  text-align: center;
  font-size: 60px;
  border-radius: 5px;
  backface-visibility: hidden;
}

.back {
  background: #03446A;
  color: white;
  transform: rotateY( 180deg );
}
</style>
