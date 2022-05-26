<template>
  <el-dialog
    class="dialog"
    :title="isEdit ? '编辑' : '新建'"
    fullscreen
    :visible="visible"
    width="1000px"
    :before-close="close"
  >
    <div class="item">
      <span class="item-label"> url: </span>
      <el-input
        placeholder="请输入url（ 注意：url = location.origin + location.pathname）"
        :disabled="isEdit"
        clearable
        v-model="name"
      />
    </div>
    <div class="editor">
      <span class="item-label"> 内容: </span>
      <code-editor
        ref="edit"
        v-model="content"
        :show-btns="false"
        :expanded-on-start="true"
        mode="code"
        lang="zh"
      />
    </div>
    <span slot="footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import CodeEditor from "./code-editor";
export default {
  props: {
    isEdit: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      deafult: {},
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    "code-editor": CodeEditor,
  },
  data() {
    return {
      content: {},
      name: "",
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.content = this.data.content;
        this.name = this.data.name;
      }
    },
  },

  methods: {
    close() {
      this.$emit("close");
    },
    confirm() {
      this.$emit("confirm", { content: this.content, name: this.name });
    },
  },
};
</script>

<style scoped>
.item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.item-label {
  width: 60px;
  font-size: 14px;
  font-weight: 500;
  margin-right: 10px;
  text-align: right;
}
.dialog /deep/ .el-dialog {
  display: flex;
  flex-direction: column;
}
.dialog /deep/ .el-dialog__body {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.editor {
  flex: 1;
  display: flex;
}
.json-editor {
  flex: 1;
}
</style>
