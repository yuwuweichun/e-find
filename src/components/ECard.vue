<template>
  <div class="row justify-center q-gutter-md">
    <q-card class="my-card" bordered>
      <q-img
        src="https://cdn.quasar.dev/img/parallax2.jpg"
      />

      <q-card-section>
        <div class="text-overline text-orange-9">显示时间</div>
        <div class="text-h5 q-mt-sm q-mb-xs">失物名称</div>
        <div class="text-caption text-grey">
          详细描述
        </div>
      </q-card-section>

      <q-card-actions>
        <q-btn flat color="secondary" label="复制联系方式" />
        <q-space />
        <!-- 展开按钮 -->
        <q-btn
          color="grey"
          round
          flat
          dense
          :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="expanded = !expanded"
        />
      </q-card-actions>

      <q-slide-transition>
        <div v-show="expanded">
          <q-separator />
          <q-card-section class="text-subtitle2">
            物品位置：{{ location }}
          </q-card-section>
          <q-card-section class="text-subtitle2">
            联系方式：{{ contact }}
          </q-card-section>

        </div>
      </q-slide-transition>
    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup () {
    return {
      expanded: ref(false),
    }
  }
}
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 400px
</style>
