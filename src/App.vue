<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { mainCalc } from "./utils/calc";

onMounted(() => {
  const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  document.documentElement.classList.remove('dark', 'light')
  document.documentElement.classList.add(theme)
})

const alreadyPass = ref<number>(0);
const readyStone = ref<number>(0);
const readyPass = ref<number>(0);
const clockStone = ref<number>(0);
const clockPass = ref<number>(0);
const readyTen = ref<boolean>(false);
const signEveryDay = ref<boolean>(false);
const taskEveryDay = ref<boolean>(false);

const result = ref<any>(null);

function compute() {
  result.value = mainCalc(
    alreadyPass.value | 0,
    readyStone.value | 0,
    readyPass.value | 0,
    clockStone.value | 0,
    clockPass.value | 0,
    readyTen.value,
    signEveryDay.value,
    taskEveryDay.value
  );
  console.log(result.value);
}
</script>

<template>
  <div style="padding: 16px; max-width: 540px; margin: 0 auto">
    <h3><Icon icon="lucide:tickets"/> 终末地寻访计算终端</h3>

    <!-- ...existing input fields... -->
    <div class="input">
      <div>
        <label
          ><span class="tips"><Icon icon="lucide:ticket-x" />已垫抽数</span
          ><br /><input type="number" v-model.number="alreadyPass"
        /></label>
      </div>
      <div>
        <label
          ><span class="tips"><Icon icon="lucide:stone" />嵌晶玉</span
          ><br /><input type="number" v-model.number="readyStone"
        /></label>
      </div>
      <div>
        <label
          ><span class="tips"
            ><Icon icon="lucide:stone" />未领取嵌晶玉</span
          ><br /><input type="number" v-model.number="clockStone"
        /></label>
      </div>
      <div>
        <label
          ><span class="tips"
            ><Icon icon="lucide:ticket" />特许寻访凭证</span
          ><br /><input type="number" v-model.number="readyPass"
        /></label>
      </div>
      <div>
        <label
          ><span class="tips"
            ><Icon icon="lucide:ticket" />未领取特许寻访凭证</span
          ><br /><input type="number" v-model.number="clockPass"
        /></label>
      </div>
    </div>

    <div class="checkbox">
      <label class="container"
        ><input type="checkbox" v-model="readyTen" /> 拥有十连转换凭证</label
      >
      <label class="container"
        ><input type="checkbox" v-model="signEveryDay" /> 完成卡池 7
        日签到<span style="color: var(--overlay1);">（最多可增加 5 次寻访次数）</span></label
      >
      <label class="container"
        ><input type="checkbox" v-model="taskEveryDay" /> 完成 17
        日每日任务<span style="color: var(--overlay1);">（最多可增加 3400 嵌晶玉）</span></label
      >
    </div>

    <div style="margin-top: 16px">
      <button class="calc" @click="compute">计算</button>
    </div>

    <!-- 改为信息框显示 -->
    <div v-if="result" class="result" style="margin-top: 16px">
      <div v-if="result.errorVar" style="font-weight: 500">
        计算不合法，已垫抽数必须小于 80
      </div>
      <div v-else>
        <div class="pity" style="margin-top: 0px !important">
          <Icon icon="lucide:badge-info" /> 概览
        </div>
        <div class="info">
          包括配额兑换总计可进行
          <strong>{{ result.afterCalcBiggest }}</strong> 次寻访
        </div>
        <div class="info">
          可产出 <strong>{{ result.weaponPointsWithPity }}</strong> 点武库配额 （<strong>{{ result.newWeaponNum }}</strong> 次武库申领）
        </div>
        <div class="pity">
          <Icon icon="lucide:receipt-swiss-franc" /> 小保底
        </div>
        <div class="info">
          已获得 <strong>{{ result.smallPityCount }}</strong> 次小保底
        </div>
        <div class="info">
          距离下一次小保底还差 <strong>{{ result.drawsToNextSmall }}</strong> 抽
        </div>

        <div class="pity"><Icon icon="lucide:chess-queen" /> 大保底</div>
        <div class="info">
          已获得 <strong>{{ result.bigPityCount }}</strong> 次大保底
        </div>
        <div class="info">
          距离下一次大保底还差 <strong>{{ result.drawsToNextBig }}</strong> 抽
        </div>
        <div style="margin-top: 6px; color: var(--overlay1); font-size: 13px" class="info">
          *第 1 次大保底在 120 抽，第 2 次在 240 抽，之后每 240 抽一次；第 2
          次及以后大保底为角色赠送，不再额外提供武器配额（见“武库申领”）。
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
label {
  display: block;
  margin: 6px 0;
}
</style>
