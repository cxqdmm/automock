<template>
  <el-dialog
    class="dialog"
    fullscreen
    :visible="visible"
    width="1000px"
    :before-close="close"
  >
    <span class="action">
      <el-button @click="close" size="medium">Cancel</el-button>
      <el-button
        v-if="status !== 'view'"
        size="medium"
        type="primary"
        @click="confirm"
        >Save</el-button
      >
    </span>
    <div class="item">
      <span class="item-label"> Mode: </span>
      <el-radio-group v-model="ruleValue">
        <el-radio label="pathname">pathname</el-radio>
        <el-radio label="href">href</el-radio>
      </el-radio-group>
    </div>
    <div class="item">
      <span class="item-label"> Filename: </span>
      <el-input
        placeholder="Please Input Url"
        v-model="name"
        class="input-with-select"
      >
      </el-input>
    </div>
    <div class="editor">
      <span class="item-label"> Response: </span>
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

<style lang="less" scoped>
.item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  &-label {
    width: 80px;
    font-size: 14px;
    font-weight: 500;
    margin-right: 10px;
    text-align: right;
  }
  &-value {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.dialog {
  /deep/ .el-dialog__header {
    display: none;
  }
  /deep/ .el-dialog__body {
    flex: 1;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
  /deep/ .el-dialog {
    display: flex;
    flex-direction: column;
  }
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
.title {
  height: 56px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
}
.action {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  .el-alert {
    position: absolute;
    right: 20px;
    width: auto;
  }
}
</style>
