<template>
  <el-dialog
    class="dialog"
    :title="title"
    fullscreen
    :visible="visible"
    width="1000px"
    :before-close="close"
  >
    <div class="item" v-if="disabledEdit">
      <span class="item-label"> 模式: </span>
      <div class="item-value">{{ ruleValue }}</div>
    </div>
    <div class="item" v-else>
      <span class="item-label"> 模式: </span>
      <el-radio-group :disabled="disabledEdit" v-model="ruleValue">
        <el-radio label="pathname">pathname</el-radio>
        <el-radio label="href">href</el-radio>
      </el-radio-group>
    </div>
    <div class="item" v-if="disabledEdit">
      <span class="item-label"> 名称: </span>
      <div class="item-value">{{ name }}</div>
    </div>
    <div class="item" v-else>
      <span class="item-label"> 名称: </span>
      <el-input
        placeholder="请输入url"
        v-model="name"
        class="input-with-select"
      >
      </el-input>
    </div>
    <div class="editor">
      <span class="item-label"> 内容: </span>
      <code-editor
        ref="edit"
        v-model="content"
        :show-btns="false"
        :expanded-on-start="true"
        :mode="mode"
        :modes="['code']"
        lang="zh"
      />
    </div>
    <span slot="footer">
      <el-button @click="close">返回</el-button>
      <el-button v-if="status !== 'view'" type="primary" @click="confirm"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import CodeEditor from "./code-editor";
import { Message } from "element-ui";
export default {
  props: {
    status: {
      type: String,
      default: "create",
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
      ruleValue: "pathname",
    };
  },
  computed: {
    disabledEdit() {
      return this.status === "edit" || this.status === "view";
    },
    title() {
      if (this.status === "edit") {
        return "编辑";
      } else if (this.status === "view") {
        return "查看";
      }
      return "新建";
    },
    mode() {
      return this.status === "view" ? "code" : "code";
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.content = this.data.content;
        this.ruleValue = this.data.ruleValue || "pathname";
        this.name = this.data.name;
      }
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
    validate() {
      try {
        const url = new URL(this.name);
        if (!url.protocol) {
          return [false, "协议不能为空"];
        } else if (!url.host) {
          return [false, "host不能为空"];
        } else if (!url.pathname) {
          return [false, "pathname不能为空"];
        }

        return [true];
      } catch (error) {
        return [false, "new URL() 无法解析出名称，请检查"];
      }
    },
    getName() {
      const url = new URL(this.name);
      if (this.ruleValue === "pathname") {
        return url.origin + url.pathname;
      } else if (this.ruleValue === "href") {
        return url.href;
      }
    },
    confirm() {
      const [pass, msg] = this.validate();
      if (!pass) {
        return Message.error(msg);
      }

      this.$emit("confirm", {
        content: this.content,
        name: this.getName(),
        ruleValue: this.ruleValue,
      });
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
.item-value {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
.input-with-select {
  width: 600px;
}
.name-protocol {
  width: 100px;
}
</style>
