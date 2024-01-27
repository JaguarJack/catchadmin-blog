---
title: 使用 El-Switch 封装一个状态组件
---

# 使用 El-Switch 封装一个状态组件

## 为什么要做封装

在日常的开发中，经常会使用`el-switch`组件做状态切换。一个常见的场景，就是在 `Table` 中对某一行数据的状态做切换，假设会和后端进行数据更新。那么以目前`el-switch`组件的功能，不管接口是否请求成功，如果不做封装的话，它都会切换到相对的状态，无法对它的状态进行控制。

## 封装组件

```javascript
<template>
  <el-switch @change="enabled(api, id)" :active-value="Status.ENABLE" :inactive-value="Status.DISABLE" :model-value="modelValue" :loading="loading" />
</template>

<script lang="ts" setup>
import { useEnabled } from '/admin/composables/curd/useEnabled'
import { Status } from '/admin/enum/app'
import { watch } from 'vue'

const props = defineProps({
  modelValue: Boolean | Number | String,
  api: String,
  id: Number | String,
})

const emits = defineEmits(['update:modelValue'])

const { enabled, success, loading } = useEnabled()

watch(success, function () {
  emits('update:modelValue', props.modelValue === Status.ENABLE ? Status.DISABLE : Status.ENABLE)
  success.value = false
})
</script>
```

### useEnable hook

```javascript
import http from '/admin/support/http'
import { Code } from '/admin/assets/enum/app'
import Message from '/admin/support/message'
import { ref } from 'vue'

export function useEnabled() {
  const success = ref(false)
  const loading = ref < boolean > false
  function enabled(path: string, id: string | number, data: object = {}) {
    loading.value = true
    http
      .put(path + '/enable/' + id, data)
      .then((r) => {
        if (r.data.code === Code.SUCCESS) {
          success.value = true
          Message.success(r.data.message)
        } else {
          Message.error(r.data.message)
        }
      })
      .finally(() => {
        loading.value = false
      })
  }

  return { enabled, success, loading }
}
```

这样就可以很好的控制 swtich 的切换了，完美！！！具体代码可参照 `catchadmin`
